const os = require("os");
const ejs = require("ejs");
const moment = require('moment');
const jwt = require('jsonwebtoken');
const geoip = require('geoip-lite');
const { mongoose} = require("mongoose");
const { User } = require('../models/user.model');
const { Member } = require('../models/member.model');
const {sendMail} = require('../middlewares/mail.middleware');
const { Memberlogin } = require('../models/memberlogin.model');

module.exports = {
  registerMember: async(req,res) => {
    
    const {user,username,email,mobile,date_from,date_to,comment,permissionlist} = req.body;

    try {
    
      if(user =="" && username == "" || email == "" || date_from == "" || date_to == "" || permissionlist == "") {
        return res.status(401).json({
          status: 401,
          message: "Name ,Email, user_id, From and to Date fields are mandatory",
          data: null
        })
      }

      const MemberExists = await Member.findOne({email});
    
      if(MemberExists) {
        return res.status(401).json({
          status: 401,
          message: "Member with this email id is already registered",
          data: null
        })
      }
    
      const member = await Member.create({
        user,
        username,
        email,
        mobile,
        date_from,
        date_to,
        permissionlist,
        comment
      })
    
      if(!member) {
        return  res.status(401).json({
          status: 401,
          message: "Error while inserting or creating data",
          data: null
        })
      }

      const htmlBody = await ejs.renderFile(__dirname.replace('\controllers','') + "/views/MemberDetails.ejs", {username: username, email: email,urlLink: `${process.env.BASE_URL}/member-login` });
      //const htmlBody = `Dear ${username} , <br/><br/> Please find herewith your Member Login credentials <br/> <br /> Email: ${email} <br/> Username: ${username} <br/><br/><br/> Regards <br/> Exchange Trading App`;
      //console.log(htmlBody);
            
      if(htmlBody) {
        const subject = "Member Login Credentials!!!"
        sendMail(email,subject,htmlBody);
        return res.status(200).json({
          status: 201,
          message: "Member is registered Successfully!!!",
          data:member
        })
      }

    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: 500,
        message: "Something went wrong with api",
        data: error
      })
    }
  },
  validateMember: async (req,res) => {
  
    const {email,username} = req.body;
    try {
      
      if(email == "" || username == "") {
        return res.status(401).json({
          status: 401,
          message: "Email and Username fields are mandatory",
          data: null
        })
      }
  
      const member = await Member.findOne({email});

      if(!member) {
        return res.status(401).json({
          status: 401,
          message: "User is not exists with Us! Please check your Email Id",
          data: null
        })
      }
   
      const isUsernameCorrect = await Member.find({username});

      if(isUsernameCorrect.length == 0) {
        return res.status(401).json({
          status: 401,
          message: "Invalid Username!!!",
          data: null
        })
      }

      let todayDate = new Date().toISOString().replace('T', ' ').substring(0, 10)
      let date_from = isUsernameCorrect[0].date_from.toISOString().replace('T', ' ').substring(0, 10)
      let date_to = isUsernameCorrect[0].date_to.toISOString().replace('T', ' ').substring(0, 10)

      if(todayDate >= date_from && todayDate <= date_to) {
      } else {
        return res.status(401).json({
          status: 401,
          message: "Member login expire, please contact to user",
          data: null
        })
      }

      const user = await User.find({_id: member.user});

      if(!user) {
        return res.status(401).json({
          status: 401,
          message: "Invalid Member / Unable to authenticate with associated user",
          data: null
        })
      }

      const generatedOtp = require('node:crypto'). randomBytes(8). toString('hex');

      await Member.findByIdAndUpdate(
      {
        _id:member._id
      },
      {
        otp:generatedOtp
      },
      {
        new: true,
      })

      const htmlBody = `Dear ${username} , <br/><br/> Please find herewith OTP for Login <br/> <br /> OTP: ${generatedOtp} <br/><br/><br/> Regards <br/> Exchange Trading App`;
      const subject = "Login OTP!!!"
      sendMail(email,subject,htmlBody);

      return res.status(200).json({
        status: 201,
        message: "OTP has been sent in your registered email id",
        data:"success",
      })

    } catch (error) {
      console.log(error);
       return res.status(500).json({
        status: 500,
        message: "Error while connecting with user table",
        data:null
      })
    }
  },
  loginMember: async(req,res) => {
        
   const {email,otp} = req.body;
   try {
     if(otp == "") {
      return res.status(401).json({
        status: 401,
        message: "Please provide the OTP",
        data: null
      })
    }

    const validateOtp = await Member.find({otp: otp});

    if(validateOtp.length == 0) {
      return res.status(401).json({
        status: 401,
        message: "Invalid OTP!!!",
        data: null
      })
    }

    const ObjectId = mongoose.Types.ObjectId;
    const memberUser = await Member.find({email});
    const user =  await User.findById({_id:new ObjectId(memberUser[0].user)})
   
    if(!user) {
      return res.status(401).json({
        status: 401,
        message: "User is not exists with Us! Please check your e-Mail Address",
        data: null
      })
    }
   
    const generateToken = await generateAccessTokenMember(user,memberUser[0].permissionlist);
   
    const options = {
      httpOnly: true,
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
   
    const LoggedInData = await User.findById(user._id).select("-password");

    await Member.findOneAndUpdate(
    {
      email:email
    },
    {
      otp:null
    },
    {
     new: true,
    })

    var geo = geoip.lookup(req.socket.remoteAddress);
    const memberLoginDetails = await Memberlogin.create({
      user:memberUser[0].user,
      member:memberUser[0]._id,
      ip_address:req.socket.remoteAddress,
      source: os.type(),
      country: (geo ? geo.country: "localhost"),
      region : (geo ? geo.region: "localhost"),
      allinfo: JSON.stringify(req.headers)
    })

    if(!memberLoginDetails) {
      return res.status(407).json({
        status: 407,
        message: "Error while enter login details",
        data:null
      })
    }
   
    return res.cookie('accessToken', generateToken, options).status(200).json({
      status: 201,
      message: "User is logged In Successfully",
      type: 'member',
      user_id: memberUser._id,
      data:LoggedInData,
      token:generateToken
    })
   } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: 500,
        message: "Error while connecting with user table",
        data:null
      })
   }
  },
  memberLoginList: async(req,res) => {
    const {id} = req.params;
    const memberLoginDetails = await Memberlogin.find({member:id});
    if(!memberLoginDetails) {
      return res.status(401).json({
        status: 401,
        message: "Error while connecting with member login table",
        data:null
      })
     }

    return res.status(201).json({
      status: 201,
      message: "Member login details are fetched successfully",
      data:memberLoginDetails
    })

  },
  updateMember: async(req,res) => {
   
    const {user,member_id,username,email,mobile,date_from,date_to,comment,permissionlist} = req.body;
    try {
   
      if(member_id =="" && username == "" || email == "" || date_from == "" || date_to == "" || permissionlist == "") {
        return res.status(401).json({
          status: 401,
          message: "Name ,Email, user_id, From and to Date fields are mandatory",
          data: null
        })
      }
  
      const UpdateMember = await Member.findOneAndUpdate(
      {
        _id:member_id
      },
      {
        user,
        username,
        email,
        mobile,
        date_from,
        date_to,
        comment,
        permissionlist
      },
      {
        new: true,
      })
  
      if(!UpdateMember) {
        return  res.status(401).json({
          status: 401,
          message: "Error while updating member data",
          data: null
        })
      }

      return res.status(200).json({
        status: 201,
        message: "Member is updated Successfully!!!",
        data:UpdateMember
      })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
          status: 500,
          message: "Something went wrong with api",
          data: error
        })
     }
  },
  membersList: async(req,res) => {
  
    try {
      const {id} = req.params;
      const { page, size , days , from , to } = req.query;   
         
      const ObjectId = mongoose.Types.ObjectId;
 
      const skipPage = page > 0 ? page-1 : 0;
 
      if(days == "custom") {
        var postsTotal = await Member.find({
          "user":new ObjectId(id),
          createdAt: {
            $gte: new Date(from).toISOString(),
            $lte: moment.utc(to).endOf('day').toDate()
          } 
        });
        var posts = await Member.find(
        {
          "user":new ObjectId(id),
           createdAt: {
            $gte: new Date(from).toISOString(),
            $lte: moment.utc(to).endOf('day').toDate()
           } 
        },
             
        )
        .limit(size)
        .skip(skipPage)
        .exec();
 
         var count = await Member.countDocuments();
      } else {
         var postsTotal = await Member.find({
          "user":new ObjectId(id),
          "createdAt": { $gte: moment().startOf('day').subtract(days, 'days').toDate() }
         
      });
 
      var posts = await Member.find(
      {
        "user":new ObjectId(id),
        "createdAt": { $gte: moment().startOf('day').subtract(days, 'days').toDate() }
      },
             
    )
    .limit(size)
    .skip(skipPage)
    .exec();

    var count = await Member.countDocuments();
   }
 
   if(!posts) {
      return res.status(500).json({
        status: 500,
        message: "Error while fetching members list",
        data:null
      })
   }
 
   return res.status(201).json({
    status: 201,
    message: "Members list are successfully fetched",
    data:posts,
    totalPages: Math.ceil(postsTotal.length / size),
    currentPage: page,
    totalCount:postsTotal.length
   })
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: 500,
      message: "Error while fetching members list",
      data:null
    })
  }
  },
  members: async(req,res) => {
  
    try {
      const {id} = req.params;
   
      const members = await Member.find({user: id});
      
      if(!members) {
        return res.status(500).json({
          status: 500,
          message: "Error while fetching members list",
          data:null
        })
      }
      
      return res.status(201).json({
        status: 201,
        message: "Members list are successfully fetched",
        data:members,
      })
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: 500,
        message: "Error while fetching members list",
        data:null
      })
    }
  },
  adminmembersList: async(req,res) => {
 
  try {

    const {id} = req.params;
    const posts = await Member.find({
      user: id
    });
  
   if(!posts) {
    return res.status(500).json({
      status: 500,
      message: "Error while fetching members list",
      data:null
    })
   }
 
   return res.status(201).json({
    status: 201,
    message: "Members list are successfully fetched",
    data:posts,
   })
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: 500,
      message: "Error while fetching members list",
      data:null
    })
   }
  },
  membersDetailsById: async(req,res) => {
  
    const {id} = req.params;
    try {
        
      const memberDetails = await Member.find({_id:id});
  
      if(!memberDetails) {
        return res.status(500).json({
          status: 500,
          message: "Error while fetching member details",
          data:null
        })
      }
  
      return res.status(201).json({
        status: 201,
        message: "Member details are successfully fetched",
        data:memberDetails
      })
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: 500,
        message: "Error while fetching members list",
        data:null
      })
    }
  },
  deleteMember:async(req,res) => {
    const {id} = req.params;
      
   try {
     const memberDetails = await Member.find({_id:id});
 
     if(!memberDetails) {
       return res.status(500).json({
         status: 500,
         message: "Error while fetching member details",
         data:null
       })
     }
 
     const memberDelete  = await Member.deleteOne({_id: id});
 
     if(!memberDelete) {
       return res.status(500).json({
         status: 500,
         message: "Error while delete member",
         data:null
       })
     }
 
     return res.status(201).json({
       status: 201,
       message: "Member is successfully deleted",
       data:memberDetails
     })
   } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: 500,
        message: "Error while fetching member details",
        data:null
      })
   }
  }
}

async function generateAccessTokenMember(user,perm) {
  const dataSend = {
    id: user._id,
    email: user.email,
    name: user.name,
    type: 'member',
    perm: perm,
    defaultcurr: user.defaultCurrency
  }
  
  try {
      return jwt.sign({
      expiresIn: '1d',
      data: dataSend
      },process.env.ACCESS_TOKEN_SECRET);
  } catch (error) {
      console.log("Error while generating Access Token", error);
  } 
}
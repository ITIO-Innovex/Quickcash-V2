const ejs = require("ejs");
const bcrypt = require('bcrypt');
const moment = require('moment');
const jwt = require('jsonwebtoken');
const { mongoose} = require("mongoose");
const randomstring = require("randomstring");
const { Kyc } = require('../../models/kyc.model');
const { User } = require("../../models/user.model");
const { Crypto } = require('../../models/crypto.model');
const { Revenue } = require('../../models/revenue.model');
const { Support } = require('../../models/support.model');
const { Invoice } = require('../../models/invoice.model');
const { Account } = require("../../models/account.model");
const { Admin } = require('../../models/Admin/admin.model');
const { Transaction } = require('../../models/transaction.model');
const { sendMail } = require("../../middlewares/mail.middleware");
const { WalletAddressRequest } = require('../../models/walletAddressRequest.model');

const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "1d" }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" } 
  );
};
module.exports = {
  // registerAdmin: async(req,res) => {
  //   const {fname,lname,email,password,mobile,autoResetTime,status} = req.body;
  //   try {

  //     if(fname == "" || email == "" || password == "") {
  //       return res.status(401).json({
  //        status: 401,
  //        message: "Name,Email,Password are mandatory",
  //        data: null
  //       })
  //     }

  //     const AdminExists = await Admin.findOne({email});
    
  //     if(AdminExists) {
  //        return res.status(401).json({
  //         status: 401,
  //         message: "Admin with this email id is already registered with Us",
  //         data: null
  //       })
  //     }

  //     const startdate = new Date();
  //     var new_date = moment(startdate, "YYYY-MM-DD");

  //     const admin = await Admin.create({
  //       fname,
  //       lname,
  //       email,
  //       password,
  //       mobile,
  //       status: status ? status : false,
  //       autoresettime: autoResetTime ? new_date.add(autoResetTime, 'days').format('YYYY-MM-DD') : new_date.add(7, 'days').format('YYYY-MM-DD')
  //     });
    
  //     if(!admin) {
  //       return  res.status(401).json({
  //        status: 401,
  //        message: "Error while inserting or creating data",
  //        data: null
  //       })
  //     }

  //     const rell = __dirname.replace("\controllers","");
  //     const rell2 = rell.replace("\Admin","");
  //     const htmlBody = await ejs.renderFile(rell2 + "/views/AdminDetails.ejs", { name:fname, email, password,urlLink: `${process.env.BASE_URL2}/admin` });
       
  //     const createdAdmin = await Admin.findById({_id: admin._id}).select("-password");
    
  //     if(!createdAdmin) {
  //       return res.status(401).json({
  //        status: 401,
  //        message: "User with this email id is already registered with Us",
  //        data: null
  //       })
  //     }

  //     if(htmlBody) {
  //       const subject = "Admin Login Credentials!!!"
  //       sendMail(email,subject,htmlBody);
  //     }

  //     return res.status(200).json({
  //       status: 201,
  //       message: "Admin is registered Successfully!!!",
  //       data:createdAdmin,
  //     })

  //     } catch (error) {
  //          console.log(error);
  //          return res.status(500).json({
  //           status: 500,
  //           message: "Something went wrong with api",
  //           data: error
  //          })
  //       }
  // },
  // auth: async(req,res) => {
  //     try {
  //       if(!req.user) {
  //         return res.status(401).json({
  //           status:401,
  //           message: "Admin is not authorized to access page",
  //           data: null
  //         })
  //       }
  
  //        return res.status(201).json({
  //         status:201,
  //         message: "Admin is Successfully authenticated",
  //         data: req.user
  //       })
  //     } catch (error) {
  //       return res.status(500).json({
  //         status:500,
  //         message: "Something went wrong",
  //         data: null
  //       })
  //     }
  // },
  getbyId: async(req,res) => {
    const ObjectId = mongoose.Types.ObjectId;
    try {
     const id = req.params.id;
     if(!id) {
      return res.status(401).json({
        status:401,
        message: "Id is missing",
        data: null
      })
     }

     const details = await Admin.find({
      _id: new ObjectId(id)
     });

     if(!details) {
      return res.status(401).json({
        status:401,
        message: "Error while getting admin details",
        data: null
      })
     }

     return res.status(201).json({
      status:201,
      message: "Admin details are successfully fetched",
      data: details
     });

    } catch (error) {
      return res.status(500).json({
        status:500,
        message: "Something went wrong",
        data: null
      })
    }
  },
  loginUser: async(req,res) => {
    const {email,password} = req.body;
    try {

      if(email == "" || password == "") {
        return res.status(401).json({
         status: 401,
         message: "Email and Password fields are mandatory",
         data: null
        });
      }
   
      const user =  await Admin.findOne({email})
   
      if(!user) {
        return res.status(401).json({
         status: 401,
         message: "User is not exists with Us! Please check your Email Id",
         data: null
        });
      }

      const userStatusCheck = await Admin.find({status: user?.status});

      if(!userStatusCheck) {
        return res.status(401).json({
          status: 401,
          message: "This account is not active, please contact to admin",
          data: null
        })
      }

      let todayDate = new Date().toISOString().replace('T', ' ').substring(0, 10)
      let date_from = user?.autoresettime;

      if(todayDate > date_from && !user?.superadmin) {
        return res.status(401).json({
          status: 401,
          message: "Admin login expire, please contact to admin",
          data: null
        })
      } 
   
     if(!await user.isPasswordCorrect(password)) {
        return res.status(401).json({
          status: 401,
          message: "Invalid Credentials!!!",
          data: null
        })
     }
   
     const isPasswdCorrect = await bcrypt.compare(password, user.password);
   
     if(!isPasswdCorrect) {
        return res.status(401).json({
          status: 401,
          message: "Invalid Credentials!!!",
          data: null
        })
     }
   
     const generateToken = await generateAccessTokenUser(user);
   
     const options = {
       httpOnly: true,
       expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
     }
   
     const LoggedInData = await Admin.findById(user._id).select("-password");
   
     return res.cookie('adminAccessToken', generateToken, options).status(200).json({
       status: 201,
       message: "ADmin is logged In Successfully",
       user_id: user._id,
       data:LoggedInData,
       token:generateToken,
       type: 'admin'
     })
    } catch (error) {
       console.log("Error", error);
       return res.status(401).json({
        status: 401,
        message: "Something Went Wrong With the Login API!!!",
        data: null
      })
    }
  },
  logoutUser: async(req,res) => {
    const options = {
      httpOnly: true,
      data: null,
      maxAge: 0
    }

    res.cookie('adminAccessToken', '', options ).status(201).json({
      status:201,
      message: "Admin is logout Successfully",
      data:null,
      token: null
    })
  },
  updateUserInfo: async(req,res) => {
    let Image1 = "";
    if(req.files?.profileAvatar) {
      Image1 = req.files.profileAvatar[0].filename;
    }

    try {
      const {
        fname,
        lname,
        user_id,
        mobile,
        email,
        password,
        autoResetTime,
        status
      } = req.body;
        
     if(!req.user) {
       return res.status(401).json({
        status: 401,
        message: "Token is missing / Can't authenticate the right user",
        data: null
       })
     }

     if(Image1) {
       await Admin.findByIdAndUpdate(
       {
        _id:user_id
       },
       {
         profileAvatar: Image1
       },
       {
        new: true,
       })
     }

     if(password) {
      updatePassword(user_id,password);
     }

     var new_date = moment(autoResetTime, "YYYY-MM-DD");
        
     const UpdateProfile = await Admin.findByIdAndUpdate(
      {
       _id:user_id
      },
      {
       fname,
       lname,
       user_id,
       mobile,
       email,
       status,
       autoresettime: new_date.add(autoResetTime, 'days').format('YYYY-MM-DD')
      },
      {
       new: true,
      })
        
      if(!UpdateProfile) {
        return  res.status(401).json({
         status:401,
         message: "Error while updating profile!",
         data:null
        })
      }

      const user = await Admin.findById({_id: UpdateProfile._id}).select("-password");
                
      return  res.status(201).json({
        status:201,
        message: "Admin profile is updated successfully",
        data:user
      })
      } catch (error) {
        console.log("Error", error);
        return  res.status(401).json({
         status:401,
         message: error,
         data:null
        })
      }
  },
  changePassword: async(req,res) => {
    try {
      const {old_password,new_passsword,confirm_password} = req.body;
        
      const userId = req?.user._id;

      if(old_password == "" || new_passsword == "" || confirm_password == "") {
        return res.status(401).json({
         status: 401,
         message: "All fields are mandatory!!!",
         data: null
        })
      }
        
      if(!userId) {
        return res.status(401).json({
          status: 401,
          message: "Token is missing / Can't authenticate the right user",
          data: null
        })
      }

       const UserDetails = await Admin.findById({_id: req.user._id});

       if(!await UserDetails.isPasswordCorrect(old_password)) {
          return res.status(401).json({
           status: 401,
           message: "Old password is In-Correct",
           data: null
          })
        }
        
        const UpdatePassword = await Admin.findByIdAndUpdate(
        {
          _id:req.user._id
        },
        {
         password: await bcrypt.hash(confirm_password, 10)
        },
        {
         new: true,
        })
        
        if(!UpdatePassword) {
          return  res.status(401).json({
           status:401,
           message: "Error while updating password!",
           data:null
          })
        }
        
        return  res.status(201).json({
         status:201,
         message: "User Password is updated successfully"
        })
       } catch (error) {
         console.log("Error", error);
         return  res.status(401).json({
          status:401,
          message: error,
          data:null
        })
       }
  },
  forgetPassword: async(req,res) => {
       
    const {email} = req.body;
    const emailExists = await Admin.find({email});

    if(emailExists.length == 0) {
      return res.status(401).json({
       status:401,
       message: "Email is not exists in our record!!!",
       data: null
     })
    }

    const newtoken = await bcrypt.hash(email, 10);
    const InserttokenIntoDb = await Admin.findOneAndUpdate(
    {
      email:email
    },
    {
      resetToken: newtoken
    },
    {
      new: true,
    })

    const htmlBody = await ejs.renderFile(__dirname.replace('\controllers','') + "/views/ResetPassword.ejs", { urlLink: `${process.env.BASE_URL}reset-password/${newtoken}` });
    if(htmlBody) {
      const subject = "Reset Password!!!"
      sendMail(email,subject,htmlBody);
       return  res.status(201).json({
        status:201,
        message: "Success",
        data: true
      })
    }
  },
  resetPassword: async(req,res) => {
       
    const {token,password} = req.body;

    if(token == "" || password == "" ) {
      return res.status(401).json({
        status:401,
        message: "All fields are mandatory!!",
        data: null
      })
    }

    const tokenExists = await Admin.find({resetToken:token});

    if(tokenExists.length == 0) {
       return res.status(401).json({
        status:401,
        message: "Invalid Token , Make sure you have a correct reset password link / Reset Link Expired",
        data: null
       })
    }
        
    const UpdatePassword = await Admin.findOneAndUpdate(
    {
      resetToken:token
    },
    {
      password: await bcrypt.hash(password, 10)
    },
    {
      new: true,
    })
    
    if(!UpdatePassword) {
       return  res.status(401).json({
        status:401,
        message: "Error while updating password!",
        data:null
      })
    }

    await Admin.findOneAndUpdate(
    {
      resetToken:token
    },
    {
     resetToken:null
    },
    {
     new: true,
    })

    return res.status(201).json({
     status:201,
     message: "Password has been updated",
     data: null
    })
  },
  adminsList: async(req,res) => {
    try {
      const admins = await Admin.find({"superadmin": {$ne: true}}).select("-password");
  
      if(!admins) {
        return  res.status(401).json({
         status:401,
         message: "Error while get admin list details!",
         data:null
        })
      }
 
      return  res.status(201).json({
       status:201,
       message: "Success",
       data:admins
      })
 
      
    } catch (error) {
       console.log("error", error);
       return  res.status(401).json({
        status:401,
        message: "Error while get users list details!",
        data:null
      })
    }
  },
  usersList: async(req,res) => {
   try {
     const email = req.query.email || '';
     const users = await User.find({
      email: {'$regex': email, '$options' : 'i'},
     }).sort({createdAt: -1}).select("-password");
 
     if(!users) {
       return  res.status(401).json({
        status:401,
        message: "Error while get users list details!",
        data:null
       })
     }

    var usersIds = [];
    users?.map((item) => {
     usersIds.push(item._id);
    })

    return res.status(201).json({
     status:201,
     message: "Success",
     data:users,
     usersData:usersIds
    })

   } catch (error) {
      console.log("error", error);
      return  res.status(401).json({
       status:401,
       message: "Error while get users list details!",
       data:null
     })
   }
  },
  accountsList: async(req,res) => {
    try {
      const Accounts = await Account.find({});
  
      if(!Accounts) {
        return  res.status(401).json({
         status:401,
         message: "Error while get accounts list details!",
         data:null
        })
      }
 
     return res.status(201).json({
      status:201,
      message: "Success",
      data:Accounts
     });
 
    } catch (error) {
       console.log("error", error);
       return  res.status(401).json({
        status:401,
        message: "Error while get accounts list details!",
        data:null
      })
    }
  },
  accountsListByID: async(req,res) => {
    try {

      if(!req?.params?.id) {
        return res.status(401).json({
          status:401,
          message: "User Id is missing!",
          data:null
        })
      }

      const Accounts = await Account.find({user: req?.params?.id});
  
      if(!Accounts) {
        return  res.status(401).json({
         status:401,
         message: "Error while get accounts list details!",
         data:null
        });
      }
 
     return res.status(201).json({
      status:201,
      message: "Success",
      data:Accounts
     });
 
    } catch (error) {
       console.log("error", error);
       return  res.status(401).json({
        status:401,
        message: "Error while get accounts list details!",
        data:null
      })
    }
  },
  usergetbyId: async(req,res) => {
    const ObjectId = mongoose.Types.ObjectId;
    try {
     const id = req.params.id;
     if(!id) {
      return res.status(401).json({
        status:401,
        message: "Id is missing",
        data: null
      })
     }

    //  const details = await User.find({
    //   _id: new ObjectId(id)
    //  }).select("-password");

    const ObjectId = mongoose.Types.ObjectId;
    const details = await User.aggregate([
    {
      $match: {
        _id: new ObjectId(id)
      }
    },
    {
      $lookup: {
       "from": "referals",
       "localField": "_id",
       "foreignField": "user",
       "as": "referalDetails"
      }
    },
    {
      $lookup: {
       "from": "accounts",
       "localField": "_id",
       "foreignField": "user",
       "as": "accountDetails"
      }
    },
    {
      $lookup: {
       "from": "receipients",
       "localField": "_id",
       "foreignField": "user",
       "as": "beneDetails"
      }
    },
    {
     $project: {
       _id:1,
       name:1,
       email:1,
       mobile:1,
       address:1,
       gender:1,
       city:1,
       state:1,
       country:1,
       defaultCurrency:1,
       status:1,
       postalcode:1,
       ownerTitle:1,
       ownertaxid:1,
       owneridofindividual:1,
       ownerbrd:1,
       vaultAccountId:1,
       resetToken:1,
       referalCode:1,
       ownerProfile:1,
       createdAt:1,
       referalDetails: {
         _id: 1,
         referral_code: 1,
        status:1,
        },
        beneDetails: {
          _id:1,
          name:1,
          bic_code:1,
          iban:1,
          currency:1,
          country:1,
          amount:1,
          status:1
        },
        accountDetails: {
          _id:1,
          name:1,
          bic_code:1,
          iban:1,
          currency:1,
          country:1,
          amount:1,
          status:1
        }
      }
    }
    ])

     if(!details) {
      return res.status(401).json({
        status:401,
        message: "Error while getting admin details",
        data: null
      })
     }

     return res.status(201).json({
      status:201,
      message: "Admin details are successfully fetched",
      data: details
     });

    } catch (error) {
      return res.status(500).json({
        status:500,
        message: "Something went wrong",
        data: null
      })
    }
  },
  ticketsList: async(req,res) => {
    try {
      const users = await Support.find({});
  
      if(!users) {
        return  res.status(401).json({
         status:401,
         message: "Error while get tickets list details!",
         data:null
        })
      }
 
      return  res.status(201).json({
       status:201,
       message: "Success",
       data:users
      })
 
    } catch (error) {
       console.log("error", error);
       return  res.status(401).json({
        status:401,
        message: "Error while get tickets list details!",
        data:null
      })
    }
  },
  usertickets: async(req,res) => {
    try {
      const title = req.query.status || '';
      const details = await Support.aggregate([
      {
        $match: {
          status: {'$regex': title, '$options' : 'i'}
        }
      },
      {$sort: {createdAt: -1}},
      {
        $lookup: {
          "from": "users",
          "localField": "user",
          "foreignField": "_id",
          "as": "userDetails"
        }
        },
        {
          $project: {
            _id:1,
            user:1,
            subject:1,
            message:1,
            status:1,
            ticketId:1,
            createdAt:1,
            userDetails: {
              _id: 1,
              name: 1,
              email: 1,
              mobile: 1,      
              address: 1,
              city: 1,
              country: 1,
              defaultCurrency: 1,
              status:1
            }
          }
        },
       ])
  
      if(!details) {
        return  res.status(401).json({
         status:401,
         message: "Error while get tickets list details!",
         data:null
        })
      }
 
      return  res.status(201).json({
       status:201,
       message: "Success",
       data:details
      })
 
    } catch (error) {
       console.log("error", error);
       return  res.status(401).json({
        status:401,
        message: "Error while get tickets list details!",
        data:null
      })
    }
  },
  sendOtp: async(req,res) => {
    try {
      const {email,name} = req.body;
      if(email == "") {
        return res.status(401).json({
          status: 401,
          message: "Email or User ID is missing",
          data: null
        })
      }

      const rell = __dirname.replace("\controllers","");
      const rell2 = rell.replace("\Admin","");

      const newToken = randomstring.generate(6);
      const htmlBody = await ejs.renderFile(rell2 + "/views/Otptwofa.ejs", { name, otp: newToken });

      await Admin.findOneAndUpdate(
      {
        email: email
      },
      {
        otp: newToken
      },
      {
        new: true,
      })
      
      if(htmlBody) {
        const subject = "Two Factor Authentication OTP!!!"
        sendMail(email,subject,htmlBody);
        return  res.status(201).json({
         status:201,
         message: "Success",
         data: true
        })
      }

    } catch (error) {
      console.log("error", error);
      return  res.status(401).json({
        status:401,
        message: "Error while send otp!",
        data:null
      })
    }
  },
  updateTwofa: async(req,res) => {
    try {
      const {email,otp} = req.body;
      if(otp == "") {
        return res.status(401).json({
          status: 401,
          message: "Otp is missing",
          data: null
        })
      }

      const getUserOtp = await Admin.find({email: email});

      if(!getUserOtp) {
        return res.status(401).json({
          status: 401,
          message: "Error while matching otp",
          data: null
        })
      }

      if(getUserOtp?.[0].otp == otp) {
        await Admin.findOneAndUpdate(
          {
            email:email
          },
          {
            otp: '',
            twofa: true
          },
          {
            new: true,
          })
          return res.status(201).json({
            status: 201,
            message: "success",
          })
      } else {
        return res.status(401).json({
          status: 401,
          message: "Wrong OTP, please try again",
        })
      }  

    } catch (error) {
      console.log("error", error);
      return  res.status(401).json({
        status:401,
        message: "Error while matching otp!",
        data:null
      })
    }
  },
  removeprofileImage: async(req,res) => {
    try {
      const deleteImage = await Admin.findOneAndUpdate(
      {
        _id:req?.user?._id
      },
      {
        profileAvatar: '',
      },
      {
        new: true,
      });

      if(!deleteImage) {
        return res.status(401).json({
          status: 500,
          message: "Error while deleting profile image",
          data: false
        })
      }  

      return res.status(201).json({
        status: 201,
        message: "Successfully removed profile image",
        data: true
      })

    } catch (error) {
      return res.status(401).json({
        status: 500,
        message: "Error while deleting profile image",
        data: null
      })
    }
  },
  generatePassword: async(req,res) => {
    try {
      const {password} = req.body;
      if(password == "") {
        return res.status(401).json({
          status: 401,
          message: "password is missing",
          data: null
        })
      }

      const user_id = req.params.id;

      if(!user_id) {
        return res.status(401).json({
          status: 401,
          message: "user-id is missing",
          data: null
        })
      }

      const userDetails = await Admin.findOne({_id:user_id});

      if(!userDetails) {
        return res.status(401).json({
          status: 401,
          message: "User Id invalid",
        })
      }

      const rell = __dirname.replace("\controllers","");
      const rell2 = rell.replace("\Admin","");
      const htmlBody = await ejs.renderFile(rell2 + "/views/AdminDetails.ejs", { name:userDetails?.fname, email:userDetails?.email , password,urlLink: `${process.env.BASE_URL2}/admin` });
     
      if(htmlBody) {
        const subject = "Admin Login Credentials!!!"
        sendMail(userDetails?.email,subject,htmlBody);
      }

        await Admin.findOneAndUpdate(
        {
          _id:user_id
        },
        {
          password: await bcrypt.hash(password, 10)
        },
        {
          new: true,
        })
        
        return res.status(201).json({
          status: 201,
          message: "success",
        })

    } catch (error) {
      console.log("error", error);
      return  res.status(401).json({
        status:401,
        message: "Error while updating password!",
        data:null
      })
    }
  },
  dashboardData: async(req,res) => {
    try {

    const filter = req?.query?.filter || '';
    var startDateFilter = req?.query?.start ? req?.query?.start : moment().format('YYYY-MM-DD');
    var endDateFilter = req?.query?.end ? req?.query?.end  : moment().subtract(7,'d').format('YYYY-MM-DD');

    if(filter == "custom") {
      startDateFilter = req?.query?.start;
      endDateFilter = req?.query?.end;
    }
     
    const details = await Transaction.aggregate([
    {
      $match: {
        createdAt: {
          $gte: new Date(endDateFilter),
          $lte: moment.utc(startDateFilter).endOf('day').toDate()
        }
      }
    },
    {
      $lookup: {
       "from": "cryptos",
       "localField": "_id",
       "foreignField": "user",
       "as": "cryptoDetails"
      }
    },
    {
      $project: {
      _id: 1,
      trx:1,
      ttNumber:1,
      info:1,
      trans_type:1,
      extraType:1,
      from_currency:1,
      to_currency:1,
      amount:1,
      postBalance:1,
      conversionAmount:1,
      conversionAmountText:1,
      createdAt:1,
      country:1,
      user:1,
      cryptoDetails: {
        _id:1,
        user:1,
        account: 1,
        fromCurrency:1,
        fee:1,
        coin:1,
        walletAddress:1,
        paymentType:1,
        currencyType:1,
        amount:1,
        fromAmount:1,
        noOfCoins:1,
        side:1,
        status:1,
        createdAt:1
      },
    }
   },
  ])

     const transactions = await Transaction.find({
                              tr_type: {$ne: "Crypto"},
                              createdAt: {
                                $gte: new Date(endDateFilter),
                                $lte: moment.utc(startDateFilter).endOf('day').toDate()
                              }
                          }).sort({"createdAt": -1});
     const transactionsall = await Transaction.find({
                                createdAt: {
                                  $gte: new Date(endDateFilter),
                                  $lte: moment.utc(startDateFilter).endOf('day').toDate()
                                }
                             });
     const credit = await Transaction.find({ 
                      extraType: {$eq: "credit"}, 
                      createdAt: {
                        $gte: new Date(endDateFilter),
                        $lte: moment.utc(startDateFilter).endOf('day').toDate()
                      }
                    });
     const debit = await Transaction.find({ 
                    extraType: {$eq: "debit"},
                    createdAt: {
                      $gte: new Date(endDateFilter),
                      $lte: moment.utc(startDateFilter).endOf('day').toDate()
                    }
                  });
     const totalCryptos = await Crypto.find({
                            createdAt: {
                              $gte: new Date(endDateFilter),
                              $lte: moment.utc(startDateFilter).endOf('day').toDate()
                            }
                          }).sort({"createdAt": -1});
     const pendingUsers = await Kyc.find({ 
                            status: {$ne: "completed"},
                            createdAt: {
                              $gte: new Date(endDateFilter),
                              $lte: moment.utc(startDateFilter).endOf('day').toDate()
                            }
                          });
     const totalUsers   = await User.find({
                            createdAt: {
                              $gte: new Date(endDateFilter),
                              $lte: moment.utc(startDateFilter).endOf('day').toDate()
                            }
                          });
     const totalRevenue = await Revenue.find({
                            createdAt: {
                              $gte: new Date(endDateFilter),
                              $lte: moment.utc(startDateFilter).endOf('day').toDate()
                            }
                          });
     const totalAccount = await Account.find({
                            createdAt: {
                              $gte: new Date(endDateFilter),
                              $lte: moment.utc(startDateFilter).endOf('day').toDate()
                            }
                          });
     const totalTicket  = await Support.find({
                            createdAt: {
                              $gte: new Date(endDateFilter),
                              $lte: moment.utc(startDateFilter).endOf('day').toDate()
                            }
                          });
     const totalInvoice = await Invoice.find({
                            createdAt: {
                              $gte: new Date(endDateFilter),
                              $lte: moment.utc(startDateFilter).endOf('day').toDate()
                            }
                          });
     const totalWallet  = await WalletAddressRequest.find({ 
                            walletAddress: {$ne: ""},
                            createdAt: {
                              $gte: new Date(endDateFilter),
                              $lte: moment.utc(startDateFilter).endOf('day').toDate()
                            }
                          });

     const totalWalletall = await User.aggregate([
     {
      $match: {
        createdAt: {
          $gte: new Date(endDateFilter),
          $lte: moment.utc(startDateFilter).endOf('day').toDate()
        }
      }
     },
     {
        "$lookup" : {
          "from" : "walletaddressrequests",
          "localField" : "_id",
          "foreignField" : "user",
          "as" : "related"
        }
     },
     {
      $project: {
       _id:1,
       name:1,
       email:1,
       mobile:1,
       status:1,
       kycstatus:1,
       related: {
        _id:1,
        user:1,
        coin: 1,
        noOfCoins:1,
        walletAddress:1,
        comment:1,
        sttaus:1
      },
     }
    }
   ]
  );

    var totalwallets = 0;
    var walletItems = [];
    var i = 0;
    for (const element of totalWallet) {
      walletItems.push(element?.coin);
      i++;
    }

    totalWallet?.map((item) => {
      totalwallets = totalwallets + item?.related?.length;
    });

    const counts = {};
    walletItems.forEach(function (x) { counts[x] = (counts[x] || 0) + 1; });

   if(!details) {
    console.log(details);
    return res.status(402).json({
     status: 402,
     message: "Error while fetching transaction details!!!",
     data: null
    });
   }

   var sumTotal = 0;
   for (const item of totalRevenue) {
    //sumTotal = parseFloat(sumTotal) + parseFloat(item?.convertAmount);
    if(item?.usdRate == 0) {
      sumTotal = parseFloat(sumTotal) + parseFloat(item?.convertAmount);
    } else {
      sumTotal = parseFloat(sumTotal) + parseFloat(item?.fee);
    }
   }

   var sumTotalCredit = 0;
   for (const item of credit) {
    sumTotalCredit = parseFloat(sumTotalCredit) + parseFloat(item?.dashboardAmount);
   }

   var sumTotalDebit = 0;
   for (const item of debit) {
    sumTotalDebit = parseFloat(sumTotalDebit) + (parseFloat(item?.dashboardAmount));
   }

   var transactionsallTotal = 0;
   for (const item of transactionsall) {
    console.table(item?.dashboardAmount);
    transactionsallTotal = parseFloat(transactionsallTotal) + parseFloat(item?.dashboardAmount);
   }

   var summary = [];

    summary.push({
     "transactions": transactions,
     "transactionsallTotal":transactionsallTotal,
     "credit":sumTotalCredit,
     "debit":sumTotalDebit,
     "crypto_transactions":totalCryptos,
     "wallet" : totalWallet?.length,
     "twallet": totalWalletall,
     "pendingUsers": pendingUsers?.length,
     "totalRevenue": parseFloat(sumTotal).toFixed(2),
     "totalAccount": totalAccount?.length,
     "totalTicket": totalTicket?.length,
     "totalInvoice": totalInvoice?.length,
     "totalUsers": totalUsers?.length,
     "walletItems": counts
    }
   )
  
   return res.status(201).json({
    status:201,
    message: "Transaction details is Successfully fetched",
    data: details,
    summary: summary
   });

  } catch (error) {
    console.log(error); 
    return res.status(500).json({
      status:500,
      message: "Something went wrong with api",
      data: error
    });
   }
  },
}

async function updatePassword(userId,password) {
  const UpdatePassword = await Admin.findByIdAndUpdate(
  {
   _id:userId
  },
  {
   password: await bcrypt.hash(password, 10)
  },
  {
   new: true,
  });
 
 if(UpdatePassword) {
  return true;
 } else {
   return false;
 }
}

async function generateAccessTokenUser(user) {
  const dataSend = {
    id: user._id,
    email: user.email,
    name: user.fname,
    type: 'admin',
    superadmin: user.superadmin,
    profile: user?.profileAvatar
  }
    
  try {
   return jwt.sign({
    expiresIn: '12h',
    exp: Math.floor(Date.now() / 1000) + (43200),
    data: dataSend
   },process.env.ACCESS_TOKEN_SECRET);
   } catch (error) {
     console.log("Error while generating Admin Access Token", error);
   } 
}
const excelJS = require("exceljs");
const { mongoose} = require("mongoose");
const { User } = require("../models/user.model");
const { Referal } = require('../models/referal.model');
const { ReferalUser } = require("../models/referaluser.model");

module.exports = {
  // This function is used for generate Referal Code of logged In User
  generateReferalCode: async(req,res) => {
    const {user,type,referral_code,status} = req.body;
      
    try {
      if(user == "") {
        return res.status(401).json({
          status: 401,
          message: "All fields are mandatory",
          data: null
        })
      }
    
      const referal = await Referal.create({
        user,
        type,
        referral_code,
        status
      })
    
      if(!referal) {
        return res.status(401).json({
          status: 401,
          message: "Error while inserting referal data",
          data: null
        })
      }
                 
        return res.status(200).json({
          status: 201,
          message: "Referal Code has been generated !!!",
          data:referal
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
  // This function is used for fetching list
  list: async(req,res) => {
      
    const user_id = req.params.id; 
    const account_id = req.params.account_id; 
    const ObjectId = mongoose.Types.ObjectId;

   try {
    if(!user_id) {
      return res.status(402).json({
        status: 402,
        message: "User Id is missing",
        data: null
      })
    }

    if(!account_id) {
      return res.status(402).json({
       status: 402,
       message: "Account Id is missing",
       data: null
      })
    }

    const listDetails = await Wallet.find({
      user: new ObjectId(user_id),
      account: new ObjectId(account_id),
    })

    if(!listDetails) {
      return res.status(402).json({
        status: 402,
        message: "Error while fetching add money list!!!",
        data: null,
      })
    }
 
    return res.status(201).json({
      status:201,
      message: "list are fetched Successfully",
      data: listDetails,
    })

   } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: 500,
        message: "Error while fetching add money list!!!",
        data: error
      })
   }
  },
  // This function is used for checking Are referal code ever generated or not
  IsReferalCodeGenerated: async (req,res) => {
    const user_id = req.params.id; 
    const ObjectId = mongoose.Types.ObjectId;
    try {
     if(!user_id) {
      return res.status(402).json({
        status: 402,
        message: "User Id is missing",
        data: null
      })
     }

     const listDetails = await Referal.find({
      user: new ObjectId(user_id),
     })
 
     return res.status(201).json({
      status:201,
      message: "referal details are fetched Successfully",
      data: listDetails,
     })

     } catch (error) {
       console.log(error);
       return res.status(500).json({
        status: 500,
        message: "Error while fetching referal details!!!",
        data: error
      })
     }
  },
  // This function is used for get Receipient Users List
  ReferedUsersList: async (req,res) => {
    try {
        
      const user_id = req.params.id;
   
      if(!user_id) {
       return res.status(402).json({
        status: 402,
        message: "User Id is missing",
        data: null
       })
      }
   
      const ObjectId = mongoose.Types.ObjectId;
      const details = await Referal.aggregate([
      {
        $match: {
          user: new ObjectId(user_id)
        }
      },
      {
        $lookup: {
         "from": "users",
         "localField": "referral_code",
         "foreignField": "referalCode",
         "as": "referDetails"
        }
      },
      {
        $project: {
        _id:1,
        user:1,
        status:1,
        createdAt:1,
        referDetails: {
        _id: 1,
        name: 1,
        email: 1,
        mobile: 1,      
        address: 1,
        city: 1,
        country: 1,
        defaultCurrency: 1,
        status:1,
        referalCode:1,
        createdAt:1
      }
     }
    },
   ])
 
  if(!details) {
    return res.status(402).json({
      status: 402,
      message: "Error while fetching referal users list!!!",
      data: null
    })
  }
   
  return res.status(201).json({
    status:201,
    message: "Details are fetched Successfully !!!",
    data: details
  })
 } catch (error) {
    console.log(error); 
     return res.status(500).json({
      status:500,
      message: "Something went wrong with api",
      data: error
     })
   }
  },
  // This function is used for add Receipient (for Admin)
  AdminReferedUsersList: async (req,res) => {
    try {

      const ObjectId = mongoose.Types.ObjectId;
      const details = await User.aggregate([
      {
        $lookup: {
         "from": "referalusers",
         "localField": "_id",
         "foreignField": "referedByUser",
         "as": "referDetails"
        }
      },
      {
        $project: {
        _id: 1,
        name: 1,
        email: 1,
        createdAt:1,
        status:1,
        referDetails: {
        _id:1,
        referral_code:1,
        referedByUser:1,
        user:1
       }
      }
     },
     ])
 
      if(!details) {
        return res.status(402).json({
          status: 402,
          message: "Error while fetching referal users list!!!",
          data: null
        })
      }
   
      return res.status(201).json({
        status:201,
        message: "Details are fetched Successfully !!!",
        data: details
      });

    } catch (error) {
       console.log(error); 
        return res.status(500).json({
         status:500,
         message: "Something went wrong with api",
         data: error
        })
     }
  },
  // This function is used for export excel of Referal Users
  exportExcelForReferral: async(req,res) => {
    const ObjectId = mongoose.Types.ObjectId;
    const workbook = new excelJS.Workbook();  // Create a new workbook
    const worksheet = workbook.addWorksheet("ReferRewards"); // New Worksheet
    const path = "./uploads";  // Path to download excel
    // Column for data in excel. key must match data key
    worksheet.columns = [
     { header: "S no.", key: "s_no", width: 10 }, 
     { header: "Date", key: "createdAt", width: 20 },
     { header: "Name", key: "name", width: 20 },
     { header: "Email", key: "email", width: 20 },
     { header: "Mobile", key: "mobile", width: 20 },
    ];

    // const referalData = await User.find(
    // {
    //   _id: req.params.id,
    //   $and: [{
    //     referalCode: {$ne: ''}
    //   }]
    // }
    // );

    const referalData = await ReferalUser.aggregate([
      {
        $match: {
          referedByUser: new ObjectId(req?.params?.id)
        }
      },
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
          createdAt:1,
          userDetails: {
            name:1,
            email:1,
            mobile:1,
            createdAt:1
          }
        }
      }
    ])

    var newValue = [];

    if(referalData?.length > 0) {
      referalData?.map((item,index) => {
        newValue.push({
          "name": item?.userDetails?.[index]?.name,
          "email": item?.userDetails?.[index]?.email,
          "mobile": item?.userDetails?.[index]?.mobile 
        });
      })
    }

    console.log(newValue);

    // Looping through User data
    let counter = 1;
    newValue.forEach((user) => {
      user.s_no = counter;
      worksheet.addRow(user);
       // Add data in worksheet
      counter++;
    });
  
    // Making first line in excel bold
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
    });
    try {
      await workbook.xlsx.writeFile(`${path}/referall.xlsx`)
      .then(() => {
        res.send({
          status: "success",
          message: "file successfully downloaded",
          path: `${path}/referall.xlsx`,
        });
      });
      } catch (err) {
        res.send({
          status: "error",
          message: "Something went wrong",
        });
      }
  },
  // This function is used for generate Referal Code for API
  generateReferalCodeforAPI: async(req,res) => {
    try {
      
      const referalCode = await makeid(10);

      if(!referalCode) {
        return res.status(500).json({
          status:500,
          message: "Something went wrong !!!",
          data: details
        });
      }

      return res.status(201).json({
        status:201,
        message: "Success",
        data: referalCode
      });

    } catch (error) {
       console.log(error);
       return res.status(500).json({
        status:500,
        message: "Something went wrong !!!",
        data: details
      });
    }
  }
}

async function makeid(length)   {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

const Razorpay = require('razorpay');
const { mongoose} = require("mongoose");
const { FeeType } = require("../../models/Admin/feetype.model");

module.exports = {
  addFeeType: async(req,res) => {
    try {
      const {description,title,status} = req.body;
      if(title == "" || status == "") {
        return res.status(401).json({
          status: 401,
          message: "Title and status fields are nececcsary",
          data: null
        })
      }

      const slug = title.replaceAll(" ","_");

      const FeeExists = await FeeType.findOne({slug:slug});
      if(FeeExists) {
        return res.status(401).json({
          status: 401,
          message: "Fee Type is already added in our record",
          data: null
        })
      }
    
      const feeStruc = await FeeType.create({
        description,title,status,slug
      })
    
      if(!feeStruc) {
        return res.status(401).json({
          status: 401,
          message: "Error while inserting fee type data",
          data: null
        })
      }
                 
      return res.status(200).json({
        status: 201,
        message: "Fee Type is added Successfully!!!",
        data:feeStruc
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
  FeeTypeList: async(req,res) => {

  const title = req.query.title || '';
  const ObjectId = mongoose.Types.ObjectId;

  try {
    
      const feeDetails = await FeeType.aggregate([
        {
          $lookup: {
           "from": "feestructures",
           "localField": "_id",
           "foreignField": "type",
           "as": "feedetails"
          }
        },
        {
          $project: {
           _id:1,
           description:1,
           title:1,
           slug:1,
           status:1,
           createdAt:1,
           feedetails: {
             _id: 1,
            commissionType: 1,
            minimumValue:1,
            value: 1,
            createdAt:1
            }
          }
        },
        {$sort: {_id: -1}}
       ])

      if(!feeDetails) {
        return res.status(402).json({
          status: 402,
          message: "Error while fetching card list!!!",
          data: null,
        })
      }
    
      return res.status(201).json({
        status:201,
        message: "Fee Structure list is Successfully fetched",
        data: feeDetails,
      })

    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: 500,
        message: "Error while fetching card list!!!",
        data: error
      })
    }
  },
  FeeTypeById: async(req,res) => {
      
  try {
    const fs_id = req.params.id;
    if(!fs_id) {
     return res.status(402).json({
      status: 402,
      message: "Fee structure Id is missing",
      data: null
    })
  }
  
  const details = await FeeType.findOne({_id: fs_id});
  if(!details) {
    return res.status(402).json({
      status: 402,
      message: "Error while fetching fee structure details!!!",
      data: null
    })
  }
  
  return res.status(201).json({
    status:201,
    message: "Fee Structure details is Successfully fetched",
    data: details
  })
} catch (error) {
    return res.status(500).json({
      status:500,
      message: "Something went wrong with api",
      data: error
    })
  }
  },
  FeeTypeByType: async(req,res) => {

    try {
      const { type } = req.query;

      if(type == "") {
       return res.status(402).json({
        status: 402,
        message: "Fee Type is missing",
        data: null
      })
    }

    const title = type || '';
    
    const details = await FeeType.aggregate([
      {
        $match: {
         slug: {'$regex': title, '$options' : 'i'}
        }
      },
      {
        $lookup: {
         "from": "feestructures",
         "localField": "_id",
         "foreignField": "type",
         "as": "feedetails"
        }
      },
      {
        $project: {
         _id:1,
         description:1,
         title:1,
         slug:1,
         status:1,
         createdAt:1,
         feedetails: {
           _id: 1,
          commissionType: 1,
          minimumValue:1,
          value: 1
          }
        }
      },
      {$sort: {_id: -1}}
     ])

    if(!details) {
      return res.status(402).json({
        status: 402,
        message: "Error while fetching fee structure details!!!",
        data: null
      })
    }
    
    return res.status(201).json({
      status:201,
      message: "Fee Structure details is Successfully fetched",
      data: details
    })
  } catch (error) {
      return res.status(500).json({
        status:500,
        message: "Something went wrong with api",
        data: error
      })
    }
    },
  updateFeeType: async(req,res) => {
    const {description,title,status} = req.body;

    try {
             
      if(user == "" || type == "" || commissionType == "") {
        return res.status(401).json({
        status: 401,
        message: "All red star mark * fields are mandatory!!!",
        data: null
        })
      }
    
      const UpdateData = await FeeType.findByIdAndUpdate(
      {
       _id:req.params.id
      },
      {
        description,title,status,slug
      },
      {
        new: true,
      })
        
      if(!UpdateData) {
        return  res.status(401).json({
          status:401,
          message: "Error while updating fee structure details!",
          data:null
        })
      }
      
      return res.status(201).json({
        status:201,
        message: "Fee Structure details has been updated successfully"
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
  deleteFeeType: async(req,res) => {
  try {
    const fs_id = req.params.id;
             
    if(fs_id == "") {
      return res.status(401).json({
        status: 401,
        message: "Fee Structure Id is missing",
        data: null
      })
    }

    const deletedData = await FeeType.deleteOne({_id: fs_id});

    if(!deletedData) {
      return res.status(401).json({
        status:401,
        message: "Error while updating Fee Structure details!",
        data:null
      })
    }
      
    return res.status(201).json({
      status:201,
      message: "Fee Structure data has been deleted successfully"
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
}

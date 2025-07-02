const { mongoose} = require("mongoose");
const { FeeStructure } = require('../../models/Admin/feestucture.model');

module.exports = {
  addFeeStructure: async(req,res) => {
    
    try {
      const {user,type,commissionType,value,minimumValue} = req.body;
      if(user == "" || type == "" || commissionType == "" || value == "") {
        return res.status(401).json({
          status: 401,
          message: "All fields are mandatory to fill",
          data: null
        })
      }

      const TypeExists = await FeeStructure.findOne({type: type});

      if(TypeExists != null ) {
        const deleteIfExists = await FeeStructure.findOneAndDelete({type:type});

        if(!deleteIfExists) {
          console.log(deleteIfExists);
          return res.status(401).json({
            status: 401,
            message: "Error while inserting data",
            data: null
          })
        }
      }

      const feeStruc = await FeeStructure.create({
        user,type,commissionType,value,minimumValue
      })
    
      if(!feeStruc) {
        return res.status(401).json({
          status: 401,
          message: "Error while inserting data",
          data: null
        })
      }
                 
      return res.status(200).json({
        status: 201,
        message: "Fee Structure is added Successfully!!!",
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
  feeStructureList: async(req,res) => {

  const title = req.query.title || '';
  const ObjectId = mongoose.Types.ObjectId;

  try {

      const feeDetails = await FeeStructure.find({});

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
  feeStructureById: async(req,res) => {
      
  try {
    const fs_id = req.params.id;
    if(!fs_id) {
     return res.status(402).json({
      status: 402,
      message: "Fee structure Id is missing",
      data: null
    })
  }
  const ObjectId = mongoose.Types.ObjectId;
  const details = await FeeStructure.findOne({_id: new ObjectId(fs_id)});
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
    console.log(error);
    return res.status(500).json({
      status:500,
      message: "Something went wrong with api",
      data: error
    })
  }
  },
  updateFeeStructure: async(req,res) => {
    const {user,type,commissionType,value} = req.body;

    try {
             
      if(user == "" || type == "" || commissionType == "") {
        return res.status(401).json({
        status: 401,
        message: "All red star mark * fields are mandatory!!!",
        data: null
        })
      }
    
      const UpdateData = await FeeStructure.findByIdAndUpdate(
      {
       _id:req.params.id
      },
      {
        user,type,commissionType,value
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
  deleteFeeStructure: async(req,res) => {
  try {
    const fs_id = req.params.id;
             
    if(fs_id == "") {
      return res.status(401).json({
        status: 401,
        message: "Fee Structure Id is missing",
        data: null
      })
    }

    const deletedData = await FeeStructure.deleteOne({_id: fs_id});

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
  }
}

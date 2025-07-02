const { mongoose} = require("mongoose");
const { Tax } = require('../models/tax.model');

module.exports = {
  // This function is used for add Tax data into the tax table
  addTax: async(req,res) => {
    const {user,name,value,isDefault} = req.body;
      try {
        if(user == "" || name == "" || value == "") {
           return res.status(401).json({
            status: 401,
            message: "All fields are mandatory",
            data: null
           })
        }

        if(isDefault == "yes") {
          await Tax.updateMany(
          {},{
            IsDefault: "no"
          },{
            new: true,
          })
        }
    
        const tax = await Tax.create({
          user,
          Name:name,
          taxvalue:value,
          IsDefault:isDefault
        })
    
        if(!tax) {
          return res.status(401).json({
            status: 401,
            message: "Error while inserting or inserting tax data",
            data: null
          })
        }
                 
        return res.status(200).json({
          status: 201,
          message: "Tax data has been saved !!!",
          data:tax
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
  // This function is used for fetch tax list data from tax table
  list: async(req,res) => {
      
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

     const listDetails = await Tax.find({
       user: new ObjectId(user_id),
     })

     if(!listDetails) {
       return res.status(402).json({
        status: 402,
        message: "Error while fetching tax list!!!",
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
          message: "Error while fetching tax list!!!",
          data: error
        })
     }
  },
  // This function is used for fetch tax data by their id
  getDetailsById:async(req,res) => {
  
    const {id} = req.params;
        
    try {
     const taxDetails = await Tax.find({_id:id});
  
     if(!taxDetails) {
      return res.status(500).json({
        status: 500,
        message: "Error while fetching tax details",
        data:null
       })
     }
  
     return res.status(201).json({
      status: 201,
      message: "Tax is successfully deleted",
      data:taxDetails
     })
   } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: 500,
        message: "Error while fetching tax details",
        data:null
      })
   }
  },
  
  updateTax: async(req,res) => {
    const {user,name,value,isDefault} = req.body;
      
    try {
      if(user == "" || name == "" || value == "") {
        return res.status(401).json({
          status: 401,
          message: "All fields are mandatory",
          data: null
        })
      }

      if(isDefault == "yes") {
          
        await Tax.updateMany(
        {},
        {
          IsDefault: "no"
        },
        {
          new: true,
        })
      }
    
      const Updatetax = await Tax.findByIdAndUpdate(
      {
        _id:req.params.id
      },
      {
        user,
        Name:name,
        taxvalue:value,
        IsDefault:isDefault
      },
      {
        new: true,
      })
    
      if(!Updatetax) {
        return res.status(401).json({
          status: 401,
          message: "Error while updating tax data",
          data: null
        })
      }
                 
      return res.status(200).json({
        status: 201,
        message: "Tax data has been saved !!!",
        data:Updatetax
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
  // This function is used to delete data
  deleteMember:async(req,res) => {
      
    const {id} = req.params;
        
    try {
     // Find tax details by id
     const taxDetails = await Tax.findById({id});
     if(!taxDetails) {
      return res.status(500).json({
       status: 500,
       message: "Tax details not found",
       data:null
      })
    }
   
    // Attempt to delete the tax details
    const taxDelete  = await Tax.deleteOne({_id: id});
   
    if (taxDelete.deletedCount === 0) {
     return res.status(500).json({
      status: 500,
      message: "Error while deleting tax",
      data:null
     })
    }
   
    // Successful deletion
    return res.status(201).json({
      status: 201,
      message: "Tax is successfully deleted",
      data:taxDetails
    })
   } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: 500,
        message: "Internal server Error while fetching tax details",
        data:null
      })
    }
  }
}

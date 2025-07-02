const { mongoose} = require("mongoose");
const { TemplateSetting } = require('../models/templatesetting.model');

module.exports = {
  // This function is used to save invoice template content
  addInvoiceTemplate: async(req,res) => {
    const {user,invoice_country,color,templateContent} = req.body;
      
    try {
      if(user == "" || invoice_country == "" || color == "") {
        return res.status(401).json({
          status: 401,
          message: "All fields are mandatory",
          data: null
        })
      }

      const ObjectId = mongoose.Types.ObjectId;
      await TemplateSetting.deleteMany({user: new ObjectId(user)});
    
      const invtempsetting = await TemplateSetting.create({
        user,
        invoice_country,
        color,
        templateContent: templateContent ? templateContent :''
      });
    
      if(!invtempsetting) {
        return res.status(401).json({
          status: 401,
          message: "Error while inserting the data",
          data: null
        });
      }
                 
      return res.status(200).json({
        status: 201,
        message: "Data has been saved !!!",
        data:invtempsetting
      });

    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: 500,
        message: "Something went wrong with api",
        data: error
      });
    }
  },
  // This function is used to get list
  list: async(req,res) => {
      
  const user_id = req.params.id; 
  const ObjectId = mongoose.Types.ObjectId;

  try {
    if(!user_id) {
      return res.status(402).json({
        status: 402,
        message: "User Id is missing",
        data: null
      });
    }

    const listDetails = await TemplateSetting.find({
      user: new ObjectId(user_id),
    })

    if(!listDetails) {
      return res.status(402).json({
        status: 402,
        message: "Error while fetching data list!!!",
        data: null,
      });
    }
 
    return res.status(201).json({
      status:201,
      message: "list are fetched Successfully",
      data: listDetails,
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: 500,
      message: "Error while fetching data list!!!",
      data: error
    });
   }
  },
  // This function is used to get details by their id
  getDetailsById:async(req,res) => {
  
    const {id} = req.params;
        
    try {
      const taxDetails = await TemplateSetting.find({_id:id});
   
      if(!taxDetails) {
       return res.status(500).json({
        status: 500,
        message: "Error while fetching tax details",
        data:null
       });
      }
  
      return res.status(201).json({
        status: 201,
        message: "Data is successfully deleted",
        data:taxDetails
      });

    } catch (error) {
       console.log(error);
       return res.status(500).json({
        status: 500,
        message: "Error while fetching data details",
        data:null
      });
    }
  }
}

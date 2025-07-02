const { mongoose} = require("mongoose");
const { InvoiceSetting } = require('../models/invoicesetting.model');

module.exports = {
  // This function is used for add invoice setting details
  addInvoiceSetting: async(req,res) => {
    const {user,invoice_country,company_name,mobile,state,city,zipcode,address,prefix,regardstext} = req.body;
      try {
        if(user == "" || invoice_country == "" || company_name == "" || mobile == "" || address == "") {
          return res.status(401).json({
            status: 401,
            message: "Star marked fields are mandatory",
            data: null
          })
        }

        var Image1  = "";
        if(req.files.logo) {
          Image1 = req.files.logo[0].filename;
        }

        const ObjectId = mongoose.Types.ObjectId;
        await InvoiceSetting.deleteMany({user: new ObjectId(user)});
        const invtempsetting = await InvoiceSetting.create({
          user,
          invoice_country,
          company_name,
          mobile,
          state,
          city,
          zipcode,
          address,
          prefix,
          logo: Image1,
          regardstext: regardstext ? regardstext : ''
        })
    
        if(!invtempsetting) {
          return res.status(401).json({
            status: 401,
            message: "Error while inserting the data",
            data: null
          })
        }
                 
        return res.status(200).json({
          status: 201,
          message: "Data has been saved !!!",
          data:invtempsetting
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
  // This function is used for update invoice setting details
  updateInvoiceSetting: async(req,res) => {
    const {user,invoice_country,company_name,mobile,state,city,zipcode,address,prefix,regardstext} = req.body;
      try {
        if(user == "" || invoice_country == "" || company_name == "" || mobile == "" || address == "") {
          return res.status(401).json({
            status: 401,
            message: "Star marked fields are mandatory",
            data: null
          })
        }

        var Image1  = "";
        if(req.files.logo) {
          Image1 = req.files.logo[0].filename;
          await InvoiceSetting.findByIdAndUpdate(
          {
            _id:req.params.id
          },
          {
            logo: Image1
          },
          {
            new: true,
          }
          );
        }

        const invtempsetting = await InvoiceSetting.findByIdAndUpdate(
        {
          _id:req.params.id
        },
        {
          user,
          invoice_country,
          company_name,
          mobile,
          state,
          city,
          zipcode,
          address,
          prefix,
          regardstext: regardstext ? regardstext : ''
        },
        {
          new: true,
        })
    
        if(!invtempsetting) {
          return res.status(401).json({
            status: 401,
            message: "Error while inserting the data",
            data: null
          })
        }
                 
        return res.status(200).json({
          status: 201,
          message: "Data has been saved !!!",
          data:invtempsetting
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
  // This function is used for fetching data
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

      const listDetails = await InvoiceSetting.find({
        user: new ObjectId(user_id),
      })

      if(!listDetails) {
        return res.status(402).json({
          status: 402,
          message: "Error while fetching data list!!!",
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
          message: "Error while fetching data list!!!",
          data: error
        })
     }
  },
  // This function is used for fetching data by their invoice setting id
  getDetailsById:async(req,res) => {
   const {id} = req.params;

   try {

    const taxDetails = await InvoiceSetting.find({_id:id});
   
    if(!taxDetails) {
      return res.status(500).json({
        status: 500,
        message: "Error while fetching invoice settings details",
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
      })
   }
  }
}

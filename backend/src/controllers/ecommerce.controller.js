const ejs = require("ejs");
const { mongoose} = require("mongoose");
const { User } = require("../models/user.model");
const { Invoice } = require("../models/invoice.model");
const { sendMail } = require("../middlewares/mail.middleware");
const { EcommerceInvoice } = require('../models/Payment/Ecommerce.model');
const { EcommercePayment } = require("../models/Payment/EcommerPayment.model");

module.exports = {
  // Insert data into the Ecommerce Payment table
  addCreate: async(req,res) => {
    const {title,user,userType,amount,amounttext,reference,dueDate,comment,status,createdBy,currency,url} = req.body;
    try {
    
      if(title == "" || user == "" || amount == "" || dueDate == "") {
        return res.status(401).json({
          status: 401,
          message: "All fields are mandatory",
          data: null
        })
      }
    
      const tableData = await EcommerceInvoice.create({
        title,user,userType,amount,amounttext,reference,dueDate,comment,status:status,createdBy,currency,url
      })
    
      if(!tableData) {
        return res.status(401).json({
          status: 401,
          message: "Error while inserting data",
          data: null
        })
      }
                 
      return res.status(200).json({
        status: 201,
        message: "Data is added Successfully!!!",
        data:tableData
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
  // This is used for fetch ecommerce data
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

      const dataDetails = await EcommerceInvoice.find({createdBy: user_id})

      if(!dataDetails) {
        return res.status(402).json({
          status: 402,
          message: "Error while fetching data list!!!",
          data: null,
        })
      }

      return res.status(201).json({
        status:201,
        message: "Data list is Successfully fetched",
        data: dataDetails,
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
  // This is used for fetch ecommerce data by their id
  ecommerceById: async(req,res) => {

    try {
         
      const ecommerce_id = req.params.id;
      const ObjectId = mongoose.Types.ObjectId;
      if(!ecommerce_id) {
        return res.status(402).json({
          status: 402,
          message: "Ecommerce Id is missing",
          data: null
        })
      }

      const details = await EcommerceInvoice.findOne({_id: ecommerce_id});
  
      if(!details) {
        console.log(details);
        return res.status(402).json({
          status: 402,
          message: "Error while fetching details!!!",
          data: null
        })
      }
  
      return res.status(201).json({
        status:201,
        message: "Ecommerce details is Successfully fetched",
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
  // This is used for get invoice ecommerce data
  invoice_frontecommerceById: async(req,res) => {
    try {
         
      const reference = req.params.id;

      if(!reference) {
        return res.status(402).json({
          status: 402,
          message: "reference is missing",
          data: null
        })
      }

      console.log("reference", reference);

      const details = await Invoice.findOne({reference: reference}).select("-_id userid total dueAmount due_date othersInfo currency status");
      console.log("details", details);
      if(!details) {
        console.log("Invoice Details",details);
        return res.status(402).json({
          status: 402,
          message: "Link has been expired",
          data: null
        });
      }

      // const currentDate = new Date().toISOString().replace('T', ' ').substring(0, 10)

      // if(currentDate <= details?.due_date) {
      //   return res.status(201).json({
      //     status:201,
      //     message: "Invoice details is Successfully fetched",
      //     data: details
      //   })
      // } else {
      //   return res.status(402).json({
      //     status: 402,
      //     message: "Link has been expired",
      //     data: details
      //   })
      // }

      return res.status(201).json({
        status:201,
        message: "Invoice details is Successfully fetched",
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
  // This is used for add ecommerce details by their id
  frontecommerceById: async(req,res) => {

    try {
         
      const ecommerce_id = req.params.id;
      const ObjectId = mongoose.Types.ObjectId;
      if(!ecommerce_id) {
        return res.status(402).json({
          status: 402,
          message: "Ecommerce Id is missing",
          data: null
        })
      }

      const details = await EcommerceInvoice.findOne({reference: ecommerce_id}).select("-_id amount dueDate currency status");

      if(!details) {
        console.log(details);
        return res.status(402).json({
          status: 402,
          message: "Link has been expired",
          data: null
        })
      }
  
      return res.status(201).json({
        status:201,
        message: "Ecommerce details is Successfully fetched",
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
  // This is used for get transaction details
  transactionDetails: async(req,res) => {

    try {
         
      const ecommerce_id = req.params.id;
      const ObjectId = mongoose.Types.ObjectId;
      if(!ecommerce_id) {
        return res.status(402).json({
          status: 402,
          message: "Ecommerce Id is missing",
          data: null
        })
      }

      const details = await EcommercePayment.findOne({invoice: ecommerce_id});
      console.log(details);
      if(!details) {
        console.log(details);
        return res.status(402).json({
          status: 402,
          message: "Error while fetching details!!!",
          data: null
        })
      }
  
      return res.status(201).json({
        status:201,
        message: "Ecommerce details is Successfully fetched",
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
  // This is used for update ecommerce details
  updateEcommerce: async(req,res) => {
   
    try {
   
      const eCommerce_id = req.params.id;

      if(!eCommerce_id) {
        return res.status(401).json({
          status: 401,
          message: "Ecommerce Id is missing",
          data: null
        })
      }

      const {title,user,userType,amount,dueDate,comment,status} = req.body;
              
      if(title == "" || user == "" || amount == "") {
        return res.status(401).json({
          status: 401,
          message: "All red star mark * fields are mandatory!!!",
          data: null
        })
      }
    
      const UpdateData = await EcommerceInvoice.findByIdAndUpdate(
      {
        _id:eCommerce_id
      },
      {
        title,user,userType,amount,dueDate,comment,status
      },
      {
        new: true,
      })
      
      if(!UpdateData) {
        console.log(UpdateData);
        return  res.status(401).json({
          status:401,
          message: "Error while updating details!",
          data:null
        })
      }
      
      return res.status(201).json({
        status:201,
        message: "Details has been updated successfully"
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
  // This is used for delete ecommerce details
  deleteEcommerce: async(req,res) => {
      
      try {
      
        const eCommerce_id = req.params.id;
              
        if(eCommerce_id == "") {
          return res.status(401).json({
            status: 401,
            message: "Ecommerce Id is missing",
            data: null
          })
        }

        const deletedData = await EcommerceInvoice.deleteOne({_id: eCommerce_id});

        if(!deletedData) {
          return  res.status(401).json({
            status:401,
            message: "Error while updating details!",
            data:null
          })
        }
      
        return res.status(201).json({
          status:201,
          message: "Data has been deleted successfully"
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
  // This is used for send email link to the user
  sendLinktoMail: async(req,res) => {
      
    try {

    const id = req.params.id;  

    if(!id) {
      return res.status(402).json({
        status:402,
        message: "Id is missing",
        data: null
      })
    }

    const getLink = await EcommerceInvoice.findOne({_id: id});

    if(!getLink) {
      return res.status(402).json({
        status:402,
        message: "Error while getting payment link",
        data: null
      })
    }

    const userData = await User.findOne({_id: getLink?.user});

    const linkGet = getLink?.url;
    
    const htmlBody = await ejs.renderFile(__dirname.replace('\controllers','') + "/views/PaymentLink.ejs", { urlLink: `${linkGet}`, email:userData?.email, title:getLink?.title, amount: getLink?.amount, amounttext: getLink?.amounttext, duedate: getLink?.dueDate });
    if(htmlBody) {
      const subject = "Payment Link!!!"
      sendMail(userData?.email,subject,htmlBody);
      return  res.status(201).json({
        status:201,
        message: "Success",
        data: true
      })
    }
    
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

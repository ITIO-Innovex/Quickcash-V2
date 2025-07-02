const excelJS = require("exceljs");
const { mongoose} = require("mongoose");
const playwright = require('playwright');
const { Quote } = require("../models/quote.model");
const { QrCode } = require('../models/qrcode.model');
const { Client } = require("../models/client.model");
const { Account } = require("../models/account.model");
const { Invoice } = require("../models/invoice.model");
const { InvoiceSetting } = require("../models/invoicesetting.model");
const { TemplateSetting } = require("../models/templatesetting.model");
const { sendMailWithAttachment } = require('../middlewares/mail.middleware');
var CryptoJS = require("crypto-js");

module.exports = {
  // This function is used for add Quote details
  addQuote: async(req,res) => {
    
    const {user,userid,reference,url,othersInfo,quote_number,invoice_date,due_date,invoice_country,currency,productsInfo,discount,discount_type,tax,subTotal,sub_discount,sub_tax,total,note,terms,status,currency_text} = req.body;
   
    try {
      if(quote_number == "" || invoice_country == "" || productsInfo[0]?.productName == "" || currency == "" || subTotal == "" || invoice_date == "" || due_date == "") {
        return res.status(401).json({
         status: 401,
         message: "Make sure all fields are not left blank",
         data: null
        })
      }

    const ObjectId = mongoose.Types.ObjectId;
    const AccountInfo = await Account.findOne({ user: new ObjectId(user) , currency: currency });

    if(!AccountInfo) {
      return res.status(401).json({
        status: 401,
        message: "Error while fetching currency account details",
        data: null
       });
    }
  
    const quote = await Quote.create({
      user,
      userid,
      account: AccountInfo?._id,
      reference,
      url,
      othersInfo,
      quote_number,
      invoice_date,
      due_date,
      invoice_country,
      currency,
      productsInfo,
      discount,
      discount_type,
      tax,
      subTotal,
      sub_discount,
      sub_tax,
      total,
      note,
      terms,
      status,
      currency_text
    })
  
     if(!quote) {
      return  res.status(401).json({
        status: 401,
        message: "Error while inserting quote data",
        data: null
      })
     }

     if(userid) {
      var userDetails = await Client.find({_id: new ObjectId(userid)});
     }
     
     var qrCodeItem = '';

     var qrCodeImage = '';
     if(qrCodeItem) {
      qrCodeImage = qrCodeItem[0].image;
     }
 
    generatePDFfromURL(req?.user?._id,'', 'invoice.pdf', qrCodeImage ? `${process.env.BASE_URL}/qrcode/${qrCodeImage}` : '',quote_number, quote,userDetails ? userDetails?.[0]?.address : othersInfo?.[0]?.address,userDetails ? userDetails?.[0].email : othersInfo?.[0]?.email,userDetails? userDetails?.[0].firstName : othersInfo?.[0]?.name, url);

    return res.status(200).json({
      status: 201,
      message: "Quote Data is added Successfully!!!",
      data:quote
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: 500,
      message: "Something went wrong with api",
      data: error
    })
   }
  },
   // This function is used for add Quote details
  addQuoteApi: async(req,res) => {
    
    const {user,userid,othersInfo,quote_number,invoice_date,due_date,invoice_country,currency,productsInfo,discount,discount_type,tax,subTotal,sub_discount,sub_tax,total,note,terms,status,currency_text} = req.body;
   
    try {
      if(quote_number == "" || invoice_country == "" || productsInfo[0]?.productName == "" || currency == "" || subTotal == "" || invoice_date == "" || due_date == "") {
        return res.status(401).json({
         status: 401,
         message: "Make sure all fields are not left blank",
         data: null
        })
      }

    const ObjectId = mongoose.Types.ObjectId;
    var reference = Math.floor(Math.random() * 10000000);
    var ciphertext = CryptoJS.AES.encrypt(`${reference}`, 'ganesh').toString();
    const url = `${process.env.BASE_URL2}/invoice-pay?code=${ciphertext}`;
    const AccountInfo = await Account.findOne({ user: new ObjectId(user) , currency: currency });

    if(!AccountInfo) {
      return res.status(401).json({
        status: 401,
        message: "Error while fetching currency account details",
        data: null
       });
    }
  
    const quote = await Quote.create({
      user,
      userid,
      account: AccountInfo?._id,
      reference:reference,
      url,
      othersInfo,
      quote_number,
      invoice_date,
      due_date,
      invoice_country,
      currency,
      productsInfo,
      discount,
      discount_type,
      tax,
      subTotal,
      sub_discount,
      sub_tax,
      total,
      note,
      terms,
      status,
      currency_text
    })
  
     if(!quote) {
      return  res.status(401).json({
        status: 401,
        message: "Error while inserting quote data",
        data: null
      })
     }

     if(userid) {
      var userDetails = await Client.find({_id: new ObjectId(userid)});
     }
     
     var qrCodeItem = '';

     var qrCodeImage = '';
     if(qrCodeItem) {
      qrCodeImage = qrCodeItem[0].image;
     }
 
    generatePDFfromURL(req?.user?._id,'', 'invoice.pdf', qrCodeImage ? `${process.env.BASE_URL}/qrcode/${qrCodeImage}` : '',quote_number, quote,userDetails ? userDetails?.[0]?.address : othersInfo?.[0]?.address,userDetails ? userDetails?.[0].email : othersInfo?.[0]?.email,userDetails? userDetails?.[0].firstName : othersInfo?.[0]?.name, url);

    return res.status(200).json({
      status: 201,
      message: "Quote Data is added Successfully!!!",
      data:quote
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: 500,
      message: "Something went wrong with api",
      data: error
    })
   }
  },
  // This function is used for update Quote Details
  updateQuote: async(req,res) => {
  
  const {user,userid,url,noteandterms,othersInfo,quote_number,invoice_date,due_date,invoice_country,currency,productsInfo,discount,discount_type,tax,subTotal,sub_discount,sub_tax,total,note,terms,status,currency_text} = req.body;
   
   const quote_id = req.params.id;
   var noteVal = note;
   var termsVal = terms;
   
   if(!noteandterms) {
     noteVal = '';
     termsVal = '';
   }
      
   if(!quote_id) {
    return res.status(401).json({
      status: 401,
      message: "Quote Id is missing",
      data: null
    })
   }

   const ObjectId = mongoose.Types.ObjectId;

   try {
    if(quote_number == "" || invoice_country == "" || productsInfo == "" || user == "") {
      return res.status(401).json({
       status: 401,
       message: "Star marked fields are mandatory",
       data: null
      })
    }

    const UpdateData = await Quote.findByIdAndUpdate(
    {
      _id: new ObjectId(quote_id)
    },
    {
      user,quote_number,invoice_date,due_date,invoice_country,currency,productsInfo,discount,discount_type,tax,subTotal,sub_discount,sub_tax,total,note:noteVal,terms:termsVal,status,currency_text
    },
    {
      new: true,
    });
    
    if(!UpdateData) {
      console.log(UpdateData);
      return  res.status(401).json({
        status:401,
        message: "Error while updating quote details!",
        data:null
      })
    }

    if(userid) {
      var userDetails = await Client.find({_id: new ObjectId(userid)});
      console.log(userid);
    }
   
    generatePDFfromURL(req?.user?._id,'', 'invoice.pdf', '',quote_number, UpdateData,userDetails ? userDetails?.[0]?.address : othersInfo?.[0]?.address,userDetails ? userDetails?.[0].email : othersInfo?.[0]?.email,userDetails? userDetails?.[0].firstName : othersInfo?.[0]?.name, url);
    
    return res.status(201).json({
      status:201,
      data:UpdateData,
      message: "Quote details has been updated successfully"
    });

    } catch (error) {
      console.log("Error", error);
      return  res.status(401).json({
        status:401,
        message: error,
        data:null
      }); 
    }
  },
  // This function is used for fetch Quote list
  quoteList: async(req,res) => {
  
    const user_id = req.params.id; 
    const status = req.query.status || '';
    const ObjectId = mongoose.Types.ObjectId;

    try {
     if(!user_id) {
      return res.status(402).json({
        status: 402,
        message: "User Id is missing",
        data: null
      })
     }

    if(status) {
      var details = await Quote.find(
        { user: new ObjectId(user_id),
         $or: [
          {'status' : status}
        ]}
      );
    } else {
      var details = await Quote.find(
        { user: new ObjectId(user_id),
         $or: [{
          'status' : { $ne: status }
        }] }
      );
    }

    if(!details) {
      return res.status(402).json({
        status: 402,
        message: "Error while fetching quote list!!!",
        data: null
      })
    }
 
    return res.status(201).json({
      status:201,
      message: "Quote Data list is Successfully fetched",
      data: details
    });

   } catch (error) {
      return res.status(500).json({
        status: 500,
        message: "Error while fetching quote data list!!!",
        data: error
      });
    }
  },
  // This function is used for fetch Quote details by their id
  quoteById: async(req,res) => {
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
      const details = await Quote.aggregate([
      {
        $match: {
          _id: new ObjectId(user_id)
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
        _id:1,
        user:1,
        quote_number:1,
        invoice_date:1,
        due_date:1,
        status:1,
        othersInfo:1,
        url:1,
        userid:1,
        invoice_country:1,
        payment_qr_code:1,
        currency_text:1,
        currency:1,
        recurring:1,
        recurring_cycle:1,
        productsInfo:1,
        discount:1,
        discount_type:1,
        tax:1,
        subTotal:1,
        sub_discount:1,
        sub_tax:1,
        total:1,
        createdAt:1,
        note:1,
        terms:1,
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
     return res.status(402).json({
      status: 402,
      message: "Error while fetching invoice details!!!",
      data: null
     })
   }
  
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
  // This function is used for delete Quote Details
  deleteQuote: async(req,res) => {
    try {   
      const quote_id = req.params.id;   
      if(quote_id == "") {
        return res.status(401).json({
          status: 401,
          message: "Quote Id is missing",
          data: null
        })
      }

      const quoteStatus = await Quote.findOne({ _id: quote_id });

      if(quoteStatus?.status == "converted") {
        return res.status(401).json({
          status:401,
          message: "This Quote can't be deleted",
          data:null
        })
      }

      const deletedData = await Quote.deleteOne({_id: quote_id});

      if(!deletedData) {
        return  res.status(401).json({
          status:401,
          message: "Error while updating quote details!",
          data:null
        })
      }

      return res.status(201).json({
        status:201,
        message: "Quote data has been deleted successfully"
      });

    } catch (error) {
        console.log("Error", error);
        return  res.status(401).json({
          status:401,
          message: error,
          data:null
        })    
    }
  },
  // This function is used for insert details into the excel sheet
  exportExcelForQuote: async(req,res) => {
    const workbook = new excelJS.Workbook();  // Create a new workbook
    const worksheet = workbook.addWorksheet("Quotes"); // New Worksheet
    const path = "./uploads";  // Path to download excel
    // Column for data in excel. key must match data key
    worksheet.columns = [
    { header: "S no.", key: "s_no", width: 10 }, 
    { header: "Quote Number", key: "quote_number", width: 20 },
    { header: "Quote Date", key: "invoice_date", width: 20 },
    { header: "Due Date", key: "due_date", width: 20 },
    { header: "Amount", key: "total", width: 20 },
    { header: "Status", key: "status", width: 20 },
    ];

    const quoteData = await Quote.find({_id: req.params.id});

    // Looping through User data
    let counter = 1;
    quoteData.forEach((user) => {
      user.s_no = counter;
      worksheet.addRow(user); // Add data in worksheet
      counter++;
    });

    // Making first line in excel bold
      worksheet.getRow(1).eachCell((cell) => {
        cell.font = { bold: true };
      });
      try {
        const data = await workbook.xlsx.writeFile(`${path}/quotes.xlsx`)
        .then(() => {
          res.send({
            status: "success",
            message: "file successfully downloaded",
            path: `${path}/quotes.xlsx`,
          });
        });
      } catch (err) {
          res.send({
          status: "error",
          message: "Something went wrong",
        });
      }
  },
  // This function is used for send reminder Quote Details to the user
  reminderQuoteToUser : async (req,res) => {
    try {

      const quote_number = req.params.id;
      const ObjectId = mongoose.Types.ObjectId;

      if(quote_number == "") {
        return res.status(401).json({
          status: 401,
          message: "Quote Number is missing",
          data: null
        });
      }

      const quoteDetails = await Quote.aggregate([
      {
        $match: {
          _id: new ObjectId(quote_number)
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
        $lookup: {
          "from": "qrcodes",
          "localField": "user",
          "foreignField": "user",
          "as": "qrcodeDetails"
        }
      },
      {
        $lookup: {
          "from": "invoicesettings",
          "localField": "user",
          "foreignField": "user",
          "as": "settingsDetails"
        }
      },
      {
        $project: {
        _id:1,
        user:1,
        quote_number:1,
        invoice_date:1,
        due_date:1,
        status:1,
        othersInfo:1,
        url:1,
        userid:1,
        invoice_country:1,
        payment_qr_code:1,
        currency_text:1,
        currency:1,
        productsInfo:1,
        discount:1,
        discount_type:1,
        tax:1,
        subTotal:1,
        sub_discount:1,
        sub_tax:1,
        total:1,
        createdAt:1,
        note:1,
        terms:1,
        userDetails: {
        _id: 1,
        name: 1,
        email: 1,
        mobile: 1,      
        address: 1,
        state:1,
        postalcode:1,
        city: 1,
        country: 1,
        defaultCurrency: 1,
        status:1
       },
       qrcodeDetails: {
       title:1,
       image:1
       },
       settingsDetails: {
        user:1,
        invoice_country:1,
        company_name:1,
        mobile:1,
        state:1,
        city:1,
        zipcode:1,
        address:1,
        logo:1,
        regardstext:1
       }
      }
      },
      ]);

      if(!quoteDetails) {
        return  res.status(401).json({
          status:401,
          message: "Quote Doesn't exists",
          data:null
        });
      }

      if(quoteDetails?.[0]?.userid) {
        var userDetails = await Client.find({_id: new ObjectId(quoteDetails?.[0]?.userid)});
      }  

      await generatePDFfromURL(req?.user?._id,'', 'invoice.pdf', quoteDetails[0]?.quoteDetails?.[0]?.image && `${process.env.BASE_URL}/qrcode/${quoteDetails[0]?.qrcodeDetails?.[0]?.image}` || '',quoteDetails[0]?.quote_number, quoteDetails[0],userDetails ? userDetails?.[0]?.address : quoteDetails?.[0]?.othersInfo?.[0]?.address,userDetails ? userDetails?.[0].email : quoteDetails?.[0]?.othersInfo?.[0]?.email,userDetails? userDetails?.[0].firstName : quoteDetails?.[0]?.othersInfo?.[0]?.name, quoteDetails?.[0]?.url);
      
      return res.status(201).json({
        status:201,
        message: "Reminder has been sent"
      });

    } catch (error) {
      console.log("error", error);
      return  res.status(401).json({
        status:401,
        message: "Error while send reminder!",
        data:null
      });
    }
  },
  // This function is used for fetch Quote info to the quote number
  getQuoteInfoByQuoteNumber: async (req,res) => {
    
    const quote_number = req?.params?.id;

    try {
      
      const getDetails = await Quote.findOne({ quote_number: quote_number });
        
      if(!getDetails) {
        return res.status(401).json({
          status:401,
          message: "Error while fetching quote details!",
          data:getDetails
        })
      }
      
      return res.status(201).json({
        status: 201,
        message: "Successfully Fetched details",
        data: getDetails
      });

    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: 500,
        message: "Something went wrong with quote info api",
        data: []
      });
    }

  },
  // This function is used for update Quote status
  updateQuoteStatusByCustomer: async (req,res) => {

    const quote_number = req?.params?.id;

    const { status } = req.body;

    try {
      
      const ObjectId = mongoose.Types.ObjectId;

      const getDetails = await Quote.findOne({ quote_number: quote_number });
        
      if(!getDetails) {
        return res.status(401).json({
          status:401,
          message: "Error while fetching quote details!",
          data:getDetails
        })
      }

      const UpdateData = await Quote.findByIdAndUpdate(
      {
        _id: new ObjectId(getDetails?._id)
      },
      {
        status: status
      },
      {
        new: true,
      });

      if(!UpdateData) {
        console.log("Error",UpdateData);
        return res.status(201).json({
          status: 201,
          message: "Successfully updated details",
          data: UpdateData
        });
      }
      
      return res.status(201).json({
        status: 201,
        message: "Successfully Fetched details",
        data: getDetails
      });

    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: 500,
        message: "Something went wrong with quote info api",
        data: []
      });
    }
  },
  // This function is used for convert quote into the Invoice
  convertQuoteToInvoice: async (req,res) => {

    const quote_number = req?.params?.id;

    const { status } = req.body;

    try {
      
      const ObjectId = mongoose.Types.ObjectId;

      const getDetails = await Quote.findOne({ _id: quote_number });
        
      if(!getDetails) {
        return res.status(401).json({
          status:401,
          message: "Error while fetching quote details!",
          data:getDetails
        })
      }

      const UpdateData = await Quote.findByIdAndUpdate(
      {
        _id: new ObjectId(getDetails?._id)
      },
      {
        status: status
      },
      {
        new: true,
      });

      if(!UpdateData) {
        console.log("Error",UpdateData);
        return res.status(201).json({
          status: 201,
          message: "Successfully updated details",
          data: UpdateData
        });
      };

      const AccountInfo = await Account.findOne({ user: new ObjectId(getDetails?.user) , currency: getDetails?.currency });
  
      if(!AccountInfo) {
        return res.status(401).json({
          status: 401,
          message: "Error while fetching currency account details",
          data: null
         });
      }

      const invoiceSettings = await InvoiceSetting.findOne({ user: new ObjectId(getDetails?.user)});

      var valString = invoiceSettings?.prefix || '';
      var length = 4;
      for (var s=''; s.length < length; s += 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.charAt(Math.random()*62|0)) {
        var milliseconds = Math.floor(Math.random() * 99999);
        valString = valString + s;
      }
    
      const invoiceCreate = await Invoice.create({
        user: getDetails?.user,
        userid: getDetails?.userid,
        account: AccountInfo?._id,
        reference: getDetails?.reference,
        url: getDetails?.url,
        othersInfo: getDetails?.othersInfo,
        invoice_number: (valString+milliseconds).toUpperCase(),
        dueAmount: getDetails?.total,
        invoice_date: getDetails?.invoice_date,
        due_date: getDetails?.due_date,
        invoice_country: getDetails?.invoice_country,
        payment_qr_code: getDetails?.payment_qr_code,
        currency: getDetails?.currency,
        productsInfo: getDetails?.productsInfo,
        discount: getDetails?.discount,
        discount_type: getDetails?.discount_type,
        tax: getDetails?.tax,
        subTotal: getDetails?.subTotal,
        sub_discount: getDetails?.sub_discount,
        sub_tax: getDetails?.sub_tax,
        total: getDetails?.total,
        note: getDetails?.note,
        terms: getDetails?.terms,
        status: "converted",
        currency_text: getDetails?.currency_text
      });

      if(!invoiceCreate) {
        return res.status(500).json({
          status: 500,
          message: "Getting error while converting quote to invoice",
          data: []
        });
      }

      return res.status(201).json({
        status: 201,
        message: "Successfully Fetched details",
        data: invoiceCreate
      });

    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: 500,
        message: "Something went wrong with quote info api",
        data: []
      });
    }
  },
  // This function is used for get quote status by their quote number
  getQuoteStatusByQuoteNumber: async (req,res) => {
    
    const quote_number = req?.params?.id;

    try {
      
      const getDetails = await Quote.findOne({ quote_number: quote_number });
      
      if(!getDetails) {
        return res.status(401).json({
          status:401,
          message: "Error while fetching quote details!",
          data:getDetails
        });
      }

      let currentDate = new Date().toISOString().replace('T', ' ').substring(0, 10);
      let dueDate = getDetails?.due_date;

      if(currentDate <=  dueDate) {
        return res.status(201).json({
          status:201,
          message: "Success",
          data: "live"
        })
      } else {
        return res.status(201).json({
          status:201,
          message: "Success",
          data: "expire",
          type: getDetails?.status,
          dueDate: getDetails?.due_date
        })
      }          

    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: 500,
        message: "Something went wrong with quote info api",
        data: []
      });
    }

  }
}

// This function is used in Invoice Section in order to create a pdf file for invoice.

// here,
// Setting_id means invoice setting table of user based details
// qrCode means Payment QR Code id
// inv means invoice number
// item means invoice details array
// address means any other address of user
// email means any other email address of user
// name means any other name of user

async function generatePDFfromURL(setting_id,url, outputPath,qrCode,inv,item,address,email,name,urll) {

  var printFileName = 'QuotePrint.ejs';
 
  const invoiceData = await InvoiceSetting.find({user: setting_id});

  const printColor = await TemplateSetting.find({invoice_country: item.invoice_country, user: setting_id});

  var byDefaultPrintColor = '';
  if(printColor.length > 0) {
    byDefaultPrintColor = printColor[0]?.color;
  } else {
    byDefaultPrintColor = "#000000";
  }

  var invcsettingData = [];
  if(invoiceData.length > 0) {
    invcsettingData = invoiceData;
  } else {
    invcsettingData = [];
  }

  const logoInvoice = `${process.env.BASE_URL}/setting/${invoiceData?.[0]?.user}/${invoiceData?.[0]?.logo}`;

  try {
   const ejs = require("ejs");
   ejs.renderFile(__dirname.replace('\controllers','') + `/views/${printFileName}`, {invoiceData:invcsettingData,byDefaultPrintColor,qrCode,item, address , email , name, inv, logoInvoice}, async function (err, data) {
   if (err) {
    console.log("error in Invoice Template file: ",err);
   } else {
     const path = require('path');
     const fs = require('fs');
     const folderName = `public/quotes/${inv}`;
     try {
      if (!fs.existsSync(folderName)) {
       fs.mkdirSync(folderName);
      }
     } catch (err) {
       console.error("error",err);
     }
  
    const pathInvoice = __dirname.replace("src","public/quotes");
    const pdfPath = path.resolve(pathInvoice, inv+`/Quote_${inv}.pdf`);
    console.log("Quote pdf path is ", pdfPath);
     
    const browser = await playwright.chromium.launch();
    const page = await browser.newPage();
    await page.setContent(data);
    await page.pdf({ path: pdfPath.replace("controllers","") });
    console.log('PDF generated successfully');
    await browser.close();
    const htmlBody = await ejs.renderFile(__dirname.replace('\controllers','') + "/views/QuoteDetails.ejs", { quoteNumber:inv, name,email,urlLink: `${process.env.BASE_URL2}/quote/${inv}/` });
    const subject = "Quote!!!"
    const emailSent = sendMailWithAttachment(email,subject,htmlBody,pdfPath.replace("controllers",""),title=`Quote_${inv}.pdf`);
    if(emailSent)
      console.log("Quote pdf has been sent");
    else 
      console.log("waiting...");
    }
   });
  } catch (error) {
    console.error('Error fetching URL:', error);
  }
}

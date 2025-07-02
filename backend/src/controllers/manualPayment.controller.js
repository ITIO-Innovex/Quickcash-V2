const axios = require('axios');
const { mongoose} = require("mongoose");
const { Client } = require("../models/client.model");
const { Account } = require("../models/account.model");
const { Invoice } = require('../models/invoice.model');
const getSymbolFromCurrency = require('currency-symbol-map');
const { Transaction } = require("../models/transaction.model");
const { ManualPayment } = require("../models/manualPayment.model");
const { InvoiceRevenue } = require("../models/invoicerevenue.model");

module.exports = {
  // This function is used for fetching unpiad invoice list data
  unpaidInvoice: async (req,res) => {
    try {
      const ObjectId = mongoose.Types.ObjectId;
      const getInvoiceUnpaid = await Invoice.find({ 
        user: new ObjectId(req?.user?._id), 
        dueAmount: {$ne: 0},
        status: {$nin: ['converted','paid']}
      });

      if(!getInvoiceUnpaid) {
        return res.status(401).json({
          status: 401,
          message: "Getting error while fetching unpaid invoice list",
          data: null
        })
      }

      return res.status(201).json({
        status: 201,
        message: "Unpaid Invoice list has been fetched Successfully",
        data: getInvoiceUnpaid
      });

    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: 500,
        message: "Something went wrong with unpaid invoice api",
        data: []
      });
    }
  },
  // This function is used for add manual transaction data
  add: async (req,res) => {

    const {invoice_number,user,amountCurrencyText,invoice,notes,dueAmount,paidAmount,amount,payment_date,mode} = req.body;
    const ObjectId = mongoose.Types.ObjectId;
    if(invoice_number == "" || amount == 0) {
      return res.status(401).json({
        status:401,
        message: "Invoice Number and amount is mandatory fields",
        data:null
      })
    }

    try {

      const invoiceDetails = await Invoice.findOne({ invoice_number: invoice_number });

      if(!invoiceDetails) {
        return res.status(401).json({
          status:401,
          message: "Error while inserting invoice details!",
          data:null
        });
      }

      if(parseFloat(amount) > invoiceDetails?.dueAmount) {
        return res.status(401).json({
          status:401,
          message: "Please make sure enter amount should not be more than Invoice generated amount!",
          data:null
        });
      }

      var clientDetails = [];

      if(invoiceDetails?.userid) {
        const clientDetailsInfo = await Client.findOne({ _id: new ObjectId(invoiceDetails?.userid) });
        clientDetails.push({
          "name": clientDetailsInfo?.firstName,
          "email": clientDetailsInfo?.email
        });
      } else {
        clientDetails.push({
          "name": invoiceDetails?.othersInfo?.[0]?.name,
          "email": invoiceDetails?.othersInfo?.[0]?.email
        });
      }

      const insertData = await ManualPayment.create(
      {
        user,
        invoice,
        notes,
        clientInfo:clientDetails,
        amountCurrencyText:amountCurrencyText,
        paymentDate:payment_date,
        amount: amount,
        paymentMode: mode
      });
        
      if(!insertData) {
        console.log(insertData);
        return res.status(401).json({
          status:401,
          message: "Error while inserting invoice details!",
          data:null
        });
      }

      const UpdateData = await Invoice.findOneAndUpdate(
      {
        invoice_number: invoice_number
      },
      {
        status: amount < dueAmount ? 'partial' : 'paid',
        paidAmount: parseFloat(paidAmount) + parseFloat(amount),
        dueAmount: parseFloat(dueAmount) - parseFloat(amount)
      },
      {
        new: true,
      });

      if(!UpdateData) {
        console.log(UpdateData);
        return res.status(401).json({
          status:401,
          message: "Error while updating invoice details!",
          data:null
        })
      }

      // Add invoice into Transaction table record
      const remainingBalance = await Account.findOne({_id: invoiceDetails?.account});

      const transactionSaveDetails = await Transaction.create({
        user: invoiceDetails?.user,
        source_account:invoiceDetails?.account,
        info:`Invoice Payment Received (${invoiceDetails?.invoice_number})`,
        trans_type: "Invoice",
        from_currency:invoiceDetails?.currency,
        amount: amount,
        tr_type: 'Cash',
        extraType: "credit",
        postBalance: parseFloat(amount) + parseFloat(remainingBalance?.amount),
        status: "succeeded",
        fee:0,
        to_currency: invoiceDetails?.currency,
        upi_email: clientDetails[0]?.email,
        upi_contact: clientDetails[0]?.name,
        addedBy:"",
        amountText: `${getSymbolFromCurrency(invoiceDetails?.currency)}${amount}`,
        conversionAmount: "",
        conversionAmountText:"",
        trx:Math.floor(Math.random() * 999999999999),
        ttNumber: Math.floor(Math.random() * 999999999999),
        dashboardAmount: invoiceDetails?.currency == "USD" ? Math.abs(parseFloat(amount)) : await convertCurrencyAmount(invoiceDetails?.currency,"USD",amount)
      });

      if(!transactionSaveDetails) {
        return res.status(401).json({
          status: 401,
          message: "Transactions error while saved invoice record",
          data: null
        });
      }

      const invoiceRevenueData = await InvoiceRevenue.create({
        "user":invoiceDetails?.user,
        "invoice": invoiceDetails?._id,
        "fromCurrency": invoiceDetails?.currency,
        "toCurrency": "USD",
        "amount": amount,
        "convertAmount":  invoiceDetails?.currency == "USD" ? Math.abs(parseFloat(amount)) : await convertCurrencyAmount(invoiceDetails?.currency,"USD",amount),
        "info": "Invoice",
        "trans_type": "Manual",
        "dateadded": new Date().toISOString().replace('T', ' ').substring(0, 10)
      });
  
      if(!invoiceRevenueData) {
        return res.status(401).json({
          status: 401,
          message: "Transactions error while saved invoice Revenue record",
          data: null
        });
      }

      const totalAmount = parseFloat(amount)+parseFloat(remainingBalance?.amount);

      await Account.findByIdAndUpdate(
      {
        _id: invoiceDetails?.account
      },
      {
        amount: parseFloat(totalAmount)
      },
      {
        new: true,
      });

      return res.status(201).json({
        status: 201,
        message: "Payment has been done Successfully",
        data: UpdateData
      });

    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: 500,
        message: "Something went wrong with unpaid invoice api",
        data: []
      });
    }

  },
  // This function is used for fetching manual invoice list data
  manualInvoiceList: async (req,res) => {

    const userId = req?.user?._id;
    const ObjectId = mongoose.Types.ObjectId;

    if(!userId) { 
      return res.status(401).json({
        status:401,
        message: "User is not authorized",
        data:null
      });
    }

    try {

      const getDetails = await ManualPayment.aggregate([
      {
        $match: {
          user: new ObjectId(userId)
        }
      },
      {
        $lookup: {
          "from": "clients",
          "localField": "user",
          "foreignField": "user",
          "as": "userDetails"
        }
      },
      {
        $lookup: {
          "from": "invoices",
          "localField": "invoice",
          "foreignField": "_id",
          "as": "invoiceDetails"
        }
      },
      {
        $project: {
        _id:1,
        user:1,
        invoice:1,
        amount:1,
        paymentDate:1,
        paymentMode:1,
        clientInfo:1,
        notes:1,
        amountCurrencyText:1,
        invoiceDetails: {
          invoice_number:1,
          othersInfo:1,
          userid:1
        },
        userDetails: {
          firstName:1,
          lastName:1,
          email:1
        }
      }
     },
     ]);

      if(!getDetails) {
        console.log(getDetails);
        return res.status(401).json({
          status:401,
          message: "Error while getting invoice details!",
          data:null
        });
      }

      return res.status(201).json({
        status: 201,
        message: "Invoice List has been fetched Successfully",
        data: getDetails
      });

    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: 500,
        message: "Something went wrong with manual invoice list",
        data: []
      });
    }
  },
  // This function is used for fetching transaction invoice list data
  transactionInvoiceList: async (req,res) => {

    const userId = req?.user?._id;
    const ObjectId = mongoose.Types.ObjectId;

    if(!userId) { 
      return res.status(401).json({
        status:401,
        message: "User is not authorized",
        data:null
      });
    }

    try {

      const getDetails = await InvoiceRevenue.aggregate([
      {
        $match: {
          user: new ObjectId(userId)
        }
      },
      {
        $lookup: {
          "from": "invoices",
          "localField": "invoice",
          "foreignField": "_id",
          "as": "invoiceDetails"
        }
      },
      {
        $project: {
        _id:1,
        user:1,
        fromCurrency:1,
        convertAmount:1,
        dateadded:1,
        info:1,
        amount:1,
        trans_type:1,
        toCurrency:1,
        invoiceDetails: {
          invoice_number:1,
          total:1,
          _id:1,
          currency:1
        }
      }
     },
     ]);

      if(!getDetails) {
        console.log(getDetails);
        return res.status(401).json({
          status:401,
          message: "Error while getting invoice details!",
          data:null
        });
      }

      return res.status(201).json({
        status: 201,
        message: "Invoice List has been fetched Successfully",
        data: getDetails
      });

    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: 500,
        message: "Something went wrong with manual invoice list",
        data: []
      });
    }
  },
  // This function is used for fetching manual invoice data by their id
  manualInvoiceById: async (req,res) => {

    const userId = req?.user?._id;
    const manualId = req.params.id;
    const ObjectId = mongoose.Types.ObjectId;

    if(!userId) { 
      return res.status(401).json({
        status:401,
        message: "User is not authorized",
        data:null
      });
    }

    try {

      const getDetails = await ManualPayment.aggregate([
      {
        $match: {
          user: new ObjectId(userId),
          _id: new ObjectId(manualId)
        }
      },
      {
        $project: {
        _id:1,
        user:1,
        invoice:1,
        amount:1,
        paymentDate:1,
        paymentMode:1,
        clientInfo:1,
        notes:1,
        amountCurrencyText:1
      }
     },
     ]);
        
      if(!getDetails) {
        console.log(getDetails);
        return res.status(401).json({
          status:401,
          message: "Error while getting invoice details!",
          data:null
        });
      }

      return res.status(201).json({
        status: 201,
        message: "Invoice List has been fetched Successfully",
        data: getDetails
      });

    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: 500,
        message: "Something went wrong with manual invoice list",
        data: []
      });
    }
  },
  // This function is used for fetching invoice data by their invoice number
  getInvoiceInfoByInvoiceNumber: async (req,res) => {
    
    const invoice_number = req?.params?.id;

    try {
      
      const getDetails = await Invoice.findOne({ invoice_number: invoice_number });
        
      if(!getDetails) {
        return res.status(401).json({
          status:401,
          message: "Error while fetching invoice details!",
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
        message: "Something went wrong with unpaid invoice api",
        data: []
      });
    }

  },
  // This function is used for fetching invoice listof manual 
  invoiceListformanual: async (req,res) => {
    const { user } = req?.params?.id;
    const ObjectId = mongoose.Types.ObjectId;
    try {
      if(user == "") {
        return res.status(401).json({
          status:401,
          message: "User Id is missing!",
          data:getDetails
        })
      }

      const invoiceLists =  await Invoice.find({ 
        user: new ObjectId(req?.user?._id), 
        dueAmount: {$ne: 0},
        status: {$nin: ['converted','paid']}
      },
      {
        invoice_number:1,
        status:1,
        dueAmount:1,
        paidAmount:1,
        currency_text:1
      });

      if(!invoiceLists) {
        return res.status(401).json({
          status: 401,
          message: "Getting error while fetching unpaid invoice list",
          data: null
        });
      }

      return res.status(201).json({
        status: 201,
        message: "Unpaid Invoice list has been fetched Successfully",
        data: invoiceLists
      });

    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: 500,
        message: "Something went wrong!!!",
        data: invoiceLists
      });
    }

  }
}


// This function is for convert exchange value of one currency to other currency
async function convertCurrencyAmount(from,to,amount) {
  if(from && to && amount) {
    const options = {
      method: 'GET',
      url: 'https://currency-converter18.p.rapidapi.com/api/v1/convert',
      params: {
        from: from,
        to: to,
        amount: amount
      },
      headers: {
       'X-RapidAPI-Key': process.env.RAPID_API_KEY,
       'X-RapidAPI-Host': process.env.RAPID_API_HOST
      }
    };
     
    try {
      const response = await axios.request(options);
      if(response.data.success) {
        console.log("from", from,to,amount);
        return response.data.result.convertedAmount;
      } else {
        return 0;
      }
    } catch (error) {
      console.error(error);
    }
  }
}

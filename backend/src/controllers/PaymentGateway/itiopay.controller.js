var ip = require('ip');
const axios = require('axios');
const { mongoose} = require("mongoose");
const { User } = require('../../models/user.model');
const { Client } = require('../../models/client.model');
const { Invoice } = require('../../models/invoice.model');
const { Account } = require('../../models/account.model');
const getSymbolFromCurrency = require('currency-symbol-map');
const { Transaction } = require('../../models/transaction.model');
const { InvoiceRevenue } = require('../../models/invoicerevenue.model');
const { EcommerceInvoice } = require('../../models/Payment/Ecommerce.model');
const { EcommercePayment } = require('../../models/Payment/EcommerPayment.model');

module.exports = {
  initiatePayment: async(req,res) => {
   const axios = require('axios');
   const {user, amount, currency, cardsDetails} = req.body;

   var val = user.split('-');
   var userDataData = await User.findOne({_id: val[0]});

   if(!userDataData) {
    var userDataData = await Client.findOne({_id: val[0]});
   }

   if(!userDataData) {
    return res.status(402).json({
      status: 402,
      message: 'User are not authorized person',
      data: null
    })
   }

   var expiryDetails = cardsDetails?.expiry.split('/');

   let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: `https://gw.paywb.co/directapi?fullname=${userDataData?.name}&bill_address=${userDataData?.address}&bill_city=${userDataData?.city}&bill_country=${userDataData?.country}&bill_zip=${cardsDetails?.zipcode}&bill_state=${userDataData?.state}&bill_phone=${userDataData?.mobile}&bill_email=${userDataData?.email}&bill_amt=${amount}&bill_currency=${currency}&product_name=Invoice Payment&retrycount=5&public_key=${process.env.ITIO_PUBLIC_KEY}&terNo=${process.env.ITIO_TERN_NO}&unique_reference=Y&bill_ip=127.0.0.0.1&integration-type=s2s&source=Curl-Direct-Card-Payment&mop=CC&ccno=${cardsDetails?.number}&ccvv=${cardsDetails?.cvc}&month=${expiryDetails[0]}&year=${expiryDetails[1]}&reference=${user}`,
    headers: { 
     'Accept-Charset': 'UTF-8', 
     'Content-Type': 'application/json'
    },
   };

    axios.request(config)
    .then((response) => {
      if(response.data.Error) {
        res.status(402).json({
          status: 402,
          message: 'Error',
          data: response.data.Message
        })
      } else {
        res.status(200).json({
          status: 201,
          message: 'Success',
          data: response.data.authurl,
          transID: response.data.transID
        })
      }
    })
    .catch((error) => {
      console.log(error);
    });
  },
  invoiceinitiatePayment: async(req,res) => {
    const axios = require('axios');
    const {userid,reference, othersInfo,amount, currency, cardsDetails} = req.body;
    
    if(userid) {

      var userDataData = await Client.findOne({_id: userid});

      if(!userDataData) {
        var userDataData = await User.findOne({_id: userid});
      }
  
      if(!userDataData) {
        return res.status(402).json({
          status: 402,
          message: 'User are not authorized person',
          data: null
        })
      }

    } else {
      var dtails = await getUserDetailsByIP();
    }

    var expiryDetails = cardsDetails?.expiry.split('/');
 
    let config = {
     method: 'post',
     maxBodyLength: Infinity,
     url: `https://gw.paywb.co/directapi?fullname=${userDataData ? userDataData?.username : othersInfo?.[0]?.name}&bill_address=${userDataData ? userDataData?.address : othersInfo?.[0]?.address || "test address"}&bill_city=${userDataData ? userDataData?.city : dtails?.[0]?.city ? dtails?.[0]?.city : "Delhi"}&bill_country=${userDataData ? userDataData?.country : dtails?.[0]?.country ? dtails?.[0]?.country : "IN"}&bill_zip=${cardsDetails?.zipcode}&bill_state=${userDataData ? userDataData?.state : dtails?.[0]?.state ? dtails?.[0]?.state : "Delhi"}&bill_phone=${userDataData ? userDataData?.mobile : "9898989898"}&bill_email=${userDataData ? userDataData?.email : othersInfo?.[0]?.email}&bill_amt=${amount}&bill_currency=${currency}&product_name=Invoice Payment&retrycount=5&public_key=${process.env.ITIO_PUBLIC_KEY}&terNo=${process.env.ITIO_TERN_NO}&unique_reference=Y&bill_ip=${ip.address()}&integration-type=s2s&source=Curl-Direct-Card-Payment&mop=CC&ccno=${cardsDetails?.number}&ccvv=${cardsDetails?.cvc}&month=${expiryDetails[0]}&year=${expiryDetails[1]}&reference=${reference}`,
     headers: { 
      'Accept-Charset': 'UTF-8', 
      'Content-Type': 'application/json'
     },
    };

     axios.request(config)
     .then((response) => {
       if(response.data.Error) {
         res.status(402).json({
          status: 402,
          message: 'Error',
          data: response.data.Message
         })
       } else {
         res.status(200).json({
          status: 201,
          message: 'Success',
          data: response.data.authurl,
          transID: response.data.transID
         })
       }
     })
     .catch((error) => {
       console.log(error);
     });
  },
  checkStatus: async(req,res) => {

    if(!req.params.id) {
      return res.status(402).json({
        status: 402,
        message: 'Transaction ID is missing',
        data: null
      })
    }

    let config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: `https://gtw.online-epayment.com/fetch_trnsStatus?transID=${req.params.id}`
    };
    
    axios.request(config)
    .then((response) => {
      if(response.data.Error) {
        res.status(402).json({
          status: 402,
          message: 'Error',
          data: response.data.Message
        })
      } else {
        res.status(200).json({
          status: 201,
          message: 'Success',
          data: response.data.order_status,
          others: response.data
        })
      }
    })
    .catch((error) => {
      console.log(error);
    });

  },
  invoicecheckStatus: async(req,res) => {

    if(!req.params.id) {
      return res.status(402).json({
        status: 402,
        message: 'Transaction ID is missing',
        data: null
      })
    }

    let config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: `https://gtw.online-epayment.com/fetch_trnsStatus?transID=${req.params.id}`
    };
    
    axios.request(config)
    .then((response) => {
      console.log(response.data.order_status);
      if(response.data.Error) {
        res.status(402).json({
          status: 402,
          message: 'Error',
          data: response.data.Message
        })
      } else {
        res.status(200).json({
          status: 201,
          message: 'Success',
          data: response.data.order_status,
          others: response.data
        })
      }
    })
    .catch((error) => {
      console.log(error);
    });

  },
  invoicesaveData: async(req,res) => {

   const referencExists = await EcommercePayment.findOne({ reference: req?.body?.reference });

   if(!referencExists) {
    const invoiceId = await Invoice.findOne({reference: req?.body?.reference});
    const insertData = await EcommercePayment.create({
      orderStatus:req?.body?.order_status,
      reference:req?.body?.reference,
      transID:req?.body?.transID,
      response: req?.body?.response,
      tdate:req?.body?.tdate,
      billAmt:req?.body?.bill_amt,
      currency:req?.body?.bill_currency,
      descriptor:req?.body?.descriptor,
      status:req?.body?.status,
      invoice: invoiceId?._id
    });

    if(!insertData) {
      return res.status(401).json({
        status: 401,
        message: "Error while inserting ecommerce payment data",
        data: null
      })
    } 
    
    const orderStatusdata = req?.body?.order_status;

    if(orderStatusdata == 9 || orderStatusdata == 1) {
      await Invoice.findOneAndUpdate(
      {
        _id: invoiceId?._id
      },
      {
        transactionStatus: req?.body?.order_status,
        status: 'paid',
        dueAmount: parseFloat(invoiceId?.dueAmount) - parseFloat(req?.body?.bill_amt),
        paidAmount: parseFloat(invoiceId?.paidAmount) + parseFloat(req?.body?.bill_amt)
      },
      {
        new: true,
      });

    // Add invoice into Transaction table record
    const remainingBalance = await Account.findOne({_id: invoiceId?.account});

    var email = '';
    var contact = '';
    const ObjectId = mongoose.Types.ObjectId;
    if(invoiceId?.userid != "") {
      const detailsClient = await Client.findOne({ _id: new ObjectId(invoiceId?.userid) });
      email = detailsClient?.email;
      contact = detailsClient?.firstName;
    } else {
      email = invoiceId?.othersInfo[0]?.email;
      contact = invoiceId?.othersInfo[0]?.name;
    }

    const transactionSaveDetails = await Transaction.create({
      user: invoiceId?.user,
      source_account:invoiceId?.account,
      info:`Invoice Payment Received (${invoiceId?.invoice_number})`,
      trans_type: "Invoice",
      from_currency:invoiceId?.currency,
      amount:req?.body?.bill_amt,
      tr_type: 'ITIO PAY',
      extraType: "credit",
      postBalance: parseFloat(req?.body?.bill_amt) + parseFloat(remainingBalance?.amount),
      status: "succeeded",
      fee:0,
      to_currency: invoiceId?.currency,
      addedBy:"",
      amountText: `${getSymbolFromCurrency(invoiceId?.currency)}${req?.body?.bill_amt}`,
      conversionAmount: "",
      conversionAmountText:"",
      upi_email: email,
      upi_contact: contact,
      trx:Math.floor(Math.random() * 999999999999),
      ttNumber: Math.floor(Math.random() * 999999999999),
      dashboardAmount: invoiceId?.currency == "USD" ? Math.abs(parseFloat(req?.body?.bill_amt)) : await convertCurrencyAmount(invoiceId?.currency,"USD",req?.body?.bill_amt)
    });

    if(!transactionSaveDetails) {
      return res.status(401).json({
        status: 401,
        message: "Transactions error while saved invoice record",
        data: null
      });
    }

    const invoiceRevenueData = await InvoiceRevenue.create({
      "user":invoiceId?.user,
      "invoice": invoiceId?._id,
      "fromCurrency": invoiceId?.currency,
      "toCurrency": "USD",
      "amount": req?.body?.bill_amt,
      "convertAmount":  invoiceId?.currency == "USD" ? Math.abs(parseFloat(req?.body?.bill_amt)) : await convertCurrencyAmount(invoiceId?.currency,"USD",req?.body?.bill_amt),
      "info": "Invoice",
      "trans_type": "ITIOPAY",
      "dateadded": new Date().toISOString().replace('T', ' ').substring(0, 10)
    });

    if(!invoiceRevenueData) {
      return res.status(401).json({
        status: 401,
        message: "Transactions error while saved invoice Revenue record",
        data: null
      });
    }

    const totalAmount = parseFloat(req?.body?.bill_amt)+parseFloat(remainingBalance?.amount);

    await Account.findByIdAndUpdate(
    {
      _id: invoiceId?.account
    },
    {
      amount: parseFloat(totalAmount)
    },
    {
      new: true,
    });

    } else {
      await Invoice.findOneAndUpdate(
      {
        _id: invoiceId?._id
      },
      {
        transactionStatus: req?.body?.order_status
      },
      {
        new: true,
      });
    }

    return res.status(201).json({
      status: 201,
      message: "Successfully saved data",
      data: insertData
    });

   } else {
    return res.status(201).json({
      status: 201,
      message: "Successfully saved data",
      data: referencExists
    })
   }
  },
  saveData: async(req,res) => {
    const invoiceId = await EcommerceInvoice.findOne({reference: req?.body?.reference.split('-')[1]});
    const insertData = await EcommercePayment.create({
      user: req?.body?.reference.split('-')[0],
      orderStatus:req?.body?.order_status,
      reference:req?.body?.reference,
      transID:req?.body?.transID,
      response: req?.body?.response,
      tdate:req?.body?.tdate,
      billAmt:req?.body?.bill_amt,
      currency:req?.body?.bill_currency,
      descriptor:req?.body?.descriptor,
      status:req?.body?.status,
      invoice: invoiceId?._id
    });

    if(!insertData) {
      return res.status(401).json({
        status: 401,
        message: "Error while inserting ecommerce payment data",
        data: null
      })
    }  

    await EcommerceInvoice.findOneAndUpdate(
    {
      _id: invoiceId?._id
    },
    {
      status: req?.body?.status
    },
    {
      new: true,
    });

    return res.status(201).json({
      status: 201,
      message: "Successfully saved data",
      data: insertData
    })

  },
  callbackResponse: async(req,res) => {

    try {

      if(req.query) {
            
      const insertData = await EcommercePayment.create({
        user: req?.query?.reference[0].split('-')[0],
        orderStatus:req?.query?.order_status[0],
        reference:req?.query?.reference[0],
        transID:req?.query?.transID[0],
        response: req?.query?.response[0],
        tdate:req?.query?.tdate[0],
        billAmt:req?.query?.bill_amt[0],
        currency:req?.query?.bill_currency[0],
        descriptor:req?.query?.descriptor[0],
        status:req?.query?.status[0],
        invoice: req?.query?.reference[0].split('-')[0]
      });
      
      if(!insertData) {
        return res.status(401).json({
          status: 401,
          message: "Error while inserting ecommerce payment data",
          data: null
        })
      } else {

        const getDataValue = await EcommercePayment.findOne({_id: insertData?._id});
        if(req?.query?.status[0]) {

          var statusUPdate = '';

          if(req?.query?.status[0] == "Approved") {
            statusUPdate = "processing";
          } else if(req?.query?.status[0] == "Pending") {
            statusUPdate = "processing"
          } else if(req?.query?.status[0] == "Test") { 
            statusUPdate = "processing"
          } else if(req?.query?.status[0] == "Declined") {
            statusUPdate = "Declined"
          } else {
            statusUPdate = req?.query?.status[0];
          }

          const det = await EcommerceInvoice.findOneAndUpdate(
          {
            reference: req?.query?.reference[0].split('-')[1]
          },
          {
            status: statusUPdate
          },
          {
            new: true,
          });

          await EcommercePayment.findOneAndUpdate(
          {
            _id: getDataValue?._id
          },
          {
            invoice: det?._id
          },
          {
            new: true,
          });
        }
        var urlRed = `http://localhost:5173/ts/response?status=${req?.query?.status[0]}&reference=${req?.query?.reference[0]}&currency=${req?.query?.bill_currency[0]}&amount=${req?.query?.bill_amt[0]}&response=${req?.query?.response[0]}&descriptor=${req?.query?.descriptor[0]}`;
        res.send("<script>window.location.href='"+urlRed+"';</script>");
       }
      } else {
        return res.status(201).json({
          status: 201,
          message: "No Response from server",
          data: null
        })
      }

    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: 500,
        message: "Error while inserting invoice data",
        data: error
      })
    }
  }
}

async function getUserDetailsByIP() {
  const fetch = require('node-fetch');
  const url = 'https://user-ip-data-rest-api.p.rapidapi.com/check';
  const options = {
    method: 'GET',
    headers: {
      'x-rapidapi-key': '311afaeddamshd77a2f8d6e0aac1p1cdfc8jsnafcf611ee45f',
      'x-rapidapi-host': 'user-ip-data-rest-api.p.rapidapi.com'
    }
  };
  var details = [];
  try {
    const response = await fetch(url, options);
    const result = await response.json();
    if(result) {
      details.push({
        "country": result?.iso2,
        "city": result?.city,
        "state": result?.regionName,
        "ip": result?.ip
      });
    }

    return details;
  } catch (error) {
    console.error(error);
  }
}

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
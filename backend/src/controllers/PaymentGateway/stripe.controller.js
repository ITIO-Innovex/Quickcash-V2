const { mongoose} = require("mongoose");
const { default: axios } = require("axios");
const { Invoice } = require('../../models/invoice.model');
const { Account } = require('../../models/account.model');
const { Revenue } = require("../../models/revenue.model");
const { Transaction } = require('../../models/transaction.model');
const stripe = require('stripe')(`${process.env.STRIPE_SECRET_KEY}`);
const { InvoiceOrders } = require('../../models/invoiceorders.model');

module.exports = {
  createIntent: async(req,res) => {
    const {amount,currency,account,user,convertedAmount,fee,from_currency,to_currency} = req.body;
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount*100,
        currency: currency,
        metadata: {
          account: account ? account : 'test',
          user: user ? user : 'test',
          convertedAmount: convertedAmount ? convertedAmount : 0,
          fee: fee ? fee : 0,
          from_currency: from_currency ? from_currency : '',
          to_currency: to_currency ? to_currency : '',
          amount: amount ? amount - fee : 0
        },
        automatic_payment_methods: {
        enabled: true,
      },
    });

    if(!paymentIntent) { 
      return res.status(401).json({
        status: 401,
        message: "Error while creating payment Intent",
        data:paymentIntent
      });
    }

    return res.status(200).json({
      status: 201,
      message: "Payment has been done Successfully !!!",
      data:paymentIntent
    });
      
    } catch (err) {
      console.log(err);
      res.status(400).send(err);
    }
  },
  confirmPaymentIntent: async(req,res) => {
    
    const {
     orderDetails,
     userData,
     status,
     notes,
     pendingAmount,
     payAmount,
     paymentType
    } = req.body; 
    
      try {
  
        const insertData = await InvoiceOrders.create({
         user: userData?.orderDetails?._id,
         invoice:userData?._id,
         paidAmount:payAmount,
         remainingAmount:paymentType == "partial" ? userData?.total - pendingAmount : userData?.total,
         currency: userData?.currency,
         paymentType:paymentType,
         paymentMode:'stripe',
         paymentNotes:notes,
         transactionId:orderDetails?.id,
         orderId:orderDetails?.id,
         paymentId:orderDetails?.paymentId?.current,
         status:status,
         extraInfoPayment: orderDetails
        });
        
        if(!insertData) {
          return res.status(401).json({
            status: 401,
            message: "Error while inserting invoice data",
            data: null
          })
        }
  
        const ObjectId = mongoose.Types.ObjectId;
        var dueAmt = 0;
        if(userData?.dueAmount > 0 && pendingAmount > 0) {
          dueAmt = userData?.dueAmount - pendingAmount;
        } else if(userData?.dueAmount == 0 && paymentType == "partial") {
          dueAmt = userData?.total - pendingAmount;
        }
          
        if(status == "pending") {
          await Invoice.findByIdAndUpdate(
          {
            _id: new ObjectId(userData?._id)
          },
          {
            status: paymentType == "full" ? 'paid' : 'partial',
            dueAmount: dueAmt
          },
          {
            new: true,
          });
        }
                     
        return res.status(200).json({
          status: 201,
          message: "Payment has been done Successfully !!!",
          data:insertData
        });
  
      } catch (error) {
         console.log(error);
         return res.status(500).json({
          status: 500,
          message: "Error while inserting invoice data",
          data: error
         })
      }
  },
  confirmPaymentIntentMoney: async(req,res) => {
    
    const {
     orderDetails,
     userData,
     status,
     notes,
     pendingAmount,
     payAmount,
     paymentType
    } = req.body; 
    
      try {
  
        const insertData = await InvoiceOrders.create({
         user: userData?.orderDetails?._id,
         invoice:userData?._id,
         paidAmount:payAmount,
         remainingAmount:paymentType == "partial" ? userData?.total - pendingAmount : userData?.total,
         currency: userData?.currency,
         paymentType:paymentType,
         paymentMode:'stripe',
         paymentNotes:notes,
         transactionId:orderDetails?.id,
         orderId:orderDetails?.id,
         paymentId:orderDetails?.paymentId?.current,
         status:status,
         extraInfoPayment: orderDetails
        });

        if(!insertData) {
          return res.status(401).json({
            status: 401,
            message: "Error while inserting invoice data",
            data: null
          })
        }
  
        const ObjectId = mongoose.Types.ObjectId;
        var dueAmt = 0;
        if(userData?.dueAmount > 0 && pendingAmount > 0) {
          dueAmt = userData?.dueAmount - pendingAmount;
        } else if(userData?.dueAmount == 0 && paymentType == "partial") {
          dueAmt = userData?.total - pendingAmount;
        }
          
        if(status == "pending") {
          await Invoice.findByIdAndUpdate(
          {
            _id: new ObjectId(userData?._id)
          },
          {
            status: paymentType == "full" ? 'paid' : 'partial',
            dueAmount: dueAmt
          },
          {
            new: true,
          });
        }
                     
        return res.status(200).json({
          status: 201,
          message: "Payment has been done Successfully !!!",
          data:insertData
        });
  
      } catch (error) {
         console.log(error);
         return res.status(500).json({
          status: 500,
          message: "Error while inserting invoice data",
          data: error
         })
      }
  },
  paymentCaptureAddMoney: async(req,res) => {
    const {
      user,
      status,
      orderDetails,
      acctDetails,
      userData,
      account,
      amount,
      fee,
      amountText,
      to_currency,
      from_currency,
      convertedAmount,
      conversionAmountText
    } = req.body;

    try {

      if(await paymentValidate(orderDetails)) {
        const remainingBalance = await Account.findOne({_id: account});

        var postBalanceVal = 0;

        if(convertedAmount) {
          postBalanceVal = convertedAmount;
        } else {
          postBalanceVal = amount;
        }
        
        const insertData = await Transaction.create({
          user: user,
          source_account:account,
          transfer_account: account,
          info:"Add Money Through Stripe",
          trans_type: "Add Money",
          from_currency:from_currency,
          amount:amount,
          tr_type: 'Stripe',
          extraType: "credit",
          postBalance: status == "succeeded" ? parseFloat(postBalanceVal) + parseFloat(remainingBalance?.amount) : parseFloat(remainingBalance?.amount),
          status,
          fee:fee,
          to_currency: to_currency,
          addedBy:userData,
          amountText:amountText,
          conversionAmount: parseFloat(convertedAmount).toFixed(2),
          conversionAmountText:conversionAmountText,
          trx:Math.floor(Math.random() * 999999999999),
          ttNumber: orderDetails ? orderDetails : Math.floor(Math.random() * 999999999999),
          dashboardAmount: from_currency == "USD" ? Math.abs(parseFloat(amount)) : await convertCurrencyAmount(from_currency,"USD",amount)
        });

        if(to_currency == "USD") {
          var convertAmountRev = fee;
        } else {
          var convertAmountRev = await convertCurrencyAmount(to_currency,"USD",fee);
        }

        await Revenue.create({
          user,
          fee:fee,
          fromCurrency:from_currency,
          toCurrency:to_currency,
          amount:amount,
          viewType: "credit",
          usdRate: to_currency != "USD" ? await getCurrencyRate(to_currency,"USD") : 0,
          info: "Add Money Through Stripe",
          trans_type: "Add Money",
          convertAmount:convertAmountRev,
          status: status
        });
      
        if(!insertData) {
          return res.status(401).json({
            status: 401,
            message: "Error while inserting data",
            data: null
          })
        }

        if(remainingBalance && status == "succeeded") {
          const totalAmount = parseFloat(postBalanceVal)+parseFloat(remainingBalance?.amount);
          await Account.findByIdAndUpdate(
          {
            _id:account
          },
          {
            amount: parseFloat(totalAmount)
          },
          {
            new: true,
          });

        }
                   
        return res.status(200).json({
          status: 201,
          orderStatus: status,
          message: "Payment has been done Successfully !!!",
          data:insertData
        });
      } else {
        return res.status(403).json({
          status: 403,
          orderStatus: null,
          message: "Un Authorized Payment",
          data:null
        });
      }
    } catch (error) {
       console.log(error);
       return res.status(500).json({
        status: 500,
        message: "Error while inserting data",
        data: error
       })
    }
  },
  completePayment: async(req,res) => {
    const {
     transaction_id,
     status
    } = req.body;  
     
    try {
    
    const details = await InvoiceOrders.findOne({transactionId: transaction_id});
    
    if(!details) {
      return res.status(401).json({
        status: 401,
        message: "Error while inserting invoice data",
        data: null
      })
    }
     
    const ObjectId = mongoose.Types.ObjectId;
             
    if(status == "succeeded") {
      await Invoice.findByIdAndUpdate(
      {
        _id: new ObjectId(details?.invoice)
      },
      {
        status: details?.paymentType == "full" ? 'paid' : 'partial',
        dueAmount: details?.remainingAmount
      },
      {
        new: true,
      });

      await InvoiceOrders.findByIdAndUpdate(
      {
        _id: new ObjectId(details?._id)
      },
      {
        status: status
      },
      {
        new: true,
      });
    }
                        
    return res.status(200).json({
     status: 201,
     message: "Payment has been done Successfully !!!",
     data:null
    });
     
  } catch (error) {
    console.log(error);
     return res.status(500).json({
      status: 500,
      message: "Error while inserting invoice data",
      data: error
     })
   }
  },
  paymentCapture: async(req,res) => {
    const {
      orderDetails,
      userData,
      status,
      notes,
      pendingAmount,
      payAmount,
      paymentType
    } = req.body;  

    try {

      const insertData = await InvoiceOrders.create({
        user: userData?.orderDetails?._id,
        invoice:userData?._id,
        paidAmount:payAmount,
        remainingAmount:paymentType == "partial" ? userData?.total - pendingAmount : userData?.total,
        currency: userData?.currency,
        paymentType:paymentType,
        paymentMode:'razorpay',
        paymentNotes:notes,
        transactionId:orderDetails?.paymentId?.current,
        orderId:orderDetails?.orderId,
        paymentId:orderDetails?.paymentId?.current,
        status:status,
        extraInfoPayment: orderDetails
      });
      
      if(!insertData) {
        return res.status(401).json({
          status: 401,
          message: "Error while inserting invoice data",
          data: null
        })
      }

      const ObjectId = mongoose.Types.ObjectId;
      var dueAmt = 0;
      if(userData?.dueAmount > 0 && pendingAmount > 0) {
        dueAmt = userData?.dueAmount - pendingAmount;
      } else if(userData?.dueAmount == 0 && paymentType == "partial") {
        dueAmt = userData?.total - pendingAmount;
      }
        
      if(status == "succeeded") {
        
        await Invoice.findByIdAndUpdate(
        {
          _id: new ObjectId(userData?._id)
        },
        {
          status: paymentType == "full" ? 'paid' : 'partial',
          dueAmount: dueAmt
        },
        {
          new: true,
        })
      }
                   
      return res.status(200).json({
        status: 201,
        message: "Payment has been done Successfully !!!",
        data:insertData
      });

    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: 500,
        message: "Error while inserting invoice data",
        data: error
      })
    }
  },
  retreiveIntent: async(req,res) => {
    const {transaction_id} = req.body;
    try {
        
    const paymentIntent = await stripe.paymentIntents.retrieve(transaction_id);

    if(!paymentIntent) { 
      return res.status(401).json({
        status: 401,
        message: "Error while fetching payment Intent details",
        data:paymentIntent
      });
    }

    return res.status(200).json({
      status: 201,
      message: "Payment Intent has been fetched Successfully !!!",
      data:paymentIntent
    });
      
    } catch (err) {
       console.log(err);
       res.status(400).send(err);
    }
  },
  cryptopaymentCaptureAddMoney: async(req,res) => {
    const {
      user,
      status,
      orderDetails,
      acctDetails,
      userData,
      account,
      amount,
      fee,
      amountText,
      to_currency,
      from_currency,
      convertedAmount,
      conversionAmountText
    } = req.body;

    try {

      if(await paymentValidate(orderDetails)) {
        const remainingBalance = await Account.findOne({_id: account});

        var postBalanceVal = 0;

        if(convertedAmount) {
          postBalanceVal = convertedAmount;
        } else {
          postBalanceVal = amount;
        }
        
        const insertData = await Transaction.create({
          user: user,
          source_account:account,
          transfer_account: account,
          info:"Add Money Through Stripe",
          trans_type: "Add Money",
          from_currency:from_currency,
          amount:amount,
          tr_type: 'Stripe',
          extraType: "credit",
          postBalance: status == "succeeded" ? parseFloat(postBalanceVal) + parseFloat(remainingBalance?.amount) : parseFloat(remainingBalance?.amount),
          status,
          fee:fee,
          to_currency: to_currency,
          addedBy:userData,
          amountText:amountText,
          conversionAmount: parseFloat(convertedAmount).toFixed(2),
          conversionAmountText:conversionAmountText,
          trx:Math.floor(Math.random() * 999999999999),
          ttNumber: orderDetails ? orderDetails : Math.floor(Math.random() * 999999999999),
          dashboardAmount: from_currency == "USD" ? Math.abs(parseFloat(amount)) : await convertCurrencyAmount(from_currency,"USD",amount)
        });

        if(to_currency == "USD") {
          var convertAmountRev = fee;
        } else {
          var convertAmountRev = await convertCurrencyAmount(to_currency,"USD",fee);
        }

        await Revenue.create({
          user,
          fee:fee,
          fromCurrency:from_currency,
          toCurrency:to_currency,
          amount:amount,
          viewType: "credit",
          usdRate: to_currency != "USD" ? await getCurrencyRate(to_currency,"USD") : 0,
          info: "Add Money Through Stripe",
          trans_type: "Add Money",
          convertAmount:convertAmountRev,
          status: status
        });
      
        if(!insertData) {
          return res.status(401).json({
            status: 401,
            message: "Error while inserting data",
            data: null
          })
        }

        if(remainingBalance && status == "succeeded") {
          const totalAmount = parseFloat(postBalanceVal)+parseFloat(remainingBalance?.amount);
          await Account.findByIdAndUpdate(
          {
            _id:account
          },
          {
            amount: parseFloat(totalAmount)
          },
          {
            new: true,
          });
        }
                   
        return res.status(200).json({
          status: 201,
          orderStatus: status,
          message: "Payment has been done Successfully !!!",
          data:insertData
        });

      } else {
        return res.status(403).json({
          status: 403,
          orderStatus: null,
          message: "Un Authorized Payment",
          data:null
        });
      }
    } catch (error) {
       console.log(error);
       return res.status(500).json({
        status: 500,
        message: "Error while inserting data",
        data: error
       });
    }
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

async function getCurrencyRate(from,to) {
  if(from && to) {
    const options = {
      method: 'GET',
      url: 'https://currency-converter18.p.rapidapi.com/api/v1/convert',
      params: {
        from: from,
        to: to,
        amount: 1
      },
      headers: {
       'X-RapidAPI-Key': process.env.RAPID_API_KEY,
       'X-RapidAPI-Host': process.env.RAPID_API_HOST
      }
    };
     
    try {
      const response = await axios.request(options);
      if(response.data.success) {
        return response.data.result.convertedAmount;
      } else {
        return 0;
      }
    } catch (error) {
      console.error(error);
    }
  }
}

async function paymentValidate(tid) {
  if(tid) {
    try {
      var transaction = await stripe.paymentIntents.retrieve(tid);
      console.log("Transaction", transaction?.status);
      if(transaction?.status == "succeeded") {
        return true;
      }
    } catch (error) {
      console.log("error", error?.statusCode);
      console.log("UnAuthorized Customer");
      return false;
    }
  }
}

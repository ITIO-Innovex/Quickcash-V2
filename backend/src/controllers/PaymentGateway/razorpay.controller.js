const Razorpay = require('razorpay');
const { mongoose} = require("mongoose");
const { default: axios } = require('axios');
const {Invoice} = require('../../models/invoice.model');
const { Account } = require('../../models/account.model');
const { Revenue } = require('../../models/revenue.model');
const { Transaction } = require('../../models/transaction.model');
const {InvoiceOrders} = require('../../models/invoiceorders.model');

// const socket = require('../../server');

module.exports = {
  createOrder: async(req,res) => {
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });

    const options = {
      amount: req.body.amount,
      currency: req.body.currency,
      receipt: 'Receipt no. 10',
      payment_capture: 1
    };

    try {
        const response = await razorpay.orders.create(options)
        res.json({
          order_id: response.id,
          currency: response.currency,
          amount: response.amount,
        })
    } catch (err) {
       console.log(err);
       res.status(400).send(err.error.description);
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
  
  paymentCaptureMoney: async(req,res) => {
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
      rec_currency,
      convertedAmount,
      conversionAmountText
    } = req.body;  

    try {

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
        info:"Add Money Through UPI",
        trans_type: "Add Money",
        from_currency:rec_currency,
        amount:amount,
        tr_type: 'UPI',
        extraType: "credit",
        postBalance: status == "succeeded" ? parseFloat(postBalanceVal) + parseFloat(remainingBalance?.amount) : parseFloat(remainingBalance?.amount),
        status,
        fee:fee,
        to_currency: acctDetails?.currency,
        addedBy:userData,
        amountText:amountText,
        conversionAmount: parseFloat(convertedAmount).toFixed(2),
        conversionAmountText:conversionAmountText,
        trx:Math.floor(Math.random() * 999999999999),
        ttNumber: orderDetails?.paymentId ? orderDetails?.paymentId?.current : Math.floor(Math.random() * 999999999999),
        dashboardAmount: rec_currency == "USD" ? Math.abs(parseFloat(amount)) : await convertCurrencyAmount(rec_currency,"USD",amount)
      });

      if(acctDetails?.currency == "USD") {
        var convertAmountRev = fee;
      } else {
        var convertAmountRev = await convertCurrencyAmount(acctDetails?.currency,"USD",fee);
      }

      await Revenue.create({
        user,
        fee:fee,
        fromCurrency:rec_currency,
        toCurrency:acctDetails?.currency,
        amount:amount,
        viewType: "credit",
        usdRate: acctDetails?.currency != "USD" ? await getCurrencyRate(acctDetails?.currency,"USD") : 0,
        info: "Add money through UPI",
        trans_type: "Add Money",
        convertAmount:convertAmountRev,
        status
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
          
        updateOtherInfo(orderDetails?.paymentId?.current,insertData?._id);

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

      // const notificationData = {
      //   "info": "Add Money through UPI",
      //   "amount": amount,
      //   "createdAt": new Date()
      // }
      // await socket.ioObject.emit('addMoneyNotification',notificationData);
                   
      return res.status(200).json({
        status: 201,
        orderStatus: status,
        message: "Payment has been done Successfully !!!",
        data:insertData
      });

    } catch (error) {
      console.log(error);
      return res.status(500).json({
       status: 500,
       message: "Error while inserting invoice data",
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

async function updateOtherInfo(payment_id,account) {
  try {
    var instance = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
    await instance.payments.fetch(payment_id,{"expand[transaction]":"upi"}).then(async result => {
    if(result) {
      await Transaction.findByIdAndUpdate(
      {
        _id:account
      },
      {
        upi_email: result?.email,
        upi_contact: result?.contact,
        upi_id: result?.vpa
      },
      {
        new: true,
      })
    }
  })    
  .catch(error => {
    console.log("Inside response error", error);
  });

  } catch (error) {
    console.log("Error", error);
  }
}

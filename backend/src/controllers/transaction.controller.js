const axios = require('axios');
const moment = require('moment');
const excelJS = require("exceljs");
const Razorpay = require('razorpay');
const { mongoose } = require("mongoose");
const { Crypto } = require('../models/crypto.model');
const { Account } = require('../models/account.model');
const { Revenue } = require('../models/revenue.model');
const { Receipient } = require('../models/reciepient.model');
const { Transaction } = require('../models/transaction.model');
const stripe = require('stripe')(`${process.env.STRIPE_SECRET_KEY}`);
const { addNotification } = require('../middlewares/notification.middleware');

module.exports = {
  // This function is used to add transaction
  addTransaction: async(req,res) => {

    const {user,source_account,transfer_account,iban,bic,tr_type,receipient,info,trans_type,country,to_currency,from_currency,amount,amountText,status,addedBy} = req.body;
    
    try {
      if(trans_type == "" || amount == "" || source_account == "" || user == "") {
        return res.status(401).json({
          status: 401,
          message: "Transaction Type, user, Source Account and Country Code are mandatory",
          data: null
        })
      }

      const remainingBalance = await Account.findOne({_id: source_account});
  
      if(trans_type == "Exchange") {
        const remainingBalanceto = await Account.findOne({_id: transfer_account});
        const transaction = await Transaction.create({
          user,source_account,receipient,info,iban,bic,trans_type,tr_type,country,from_currency,status,
          transfer_account,to_currency,addedBy,ttNumber:"",trx:Math.floor(Math.random() * 999999999999)
        })  

        await Account.findByIdAndUpdate(
        {
          _id:source_account
        },
        {
          amount: parseFloat(remainingBalance?.amount) - (parseFloat(req?.body?.fromAmount) + parseFloat(req?.body?.fee))
        },
        {
          new: true,
        })

        await Account.findByIdAndUpdate(
        {
          _id:transfer_account
        },
        {
          amount: parseFloat(req?.body?.amount)+parseFloat(remainingBalanceto?.amount)
        },
        {
          new: true,
        });

        await Transaction.findByIdAndUpdate(
        {
          _id:transaction?._id
        },
        {
          amount: Math.abs(parseFloat(req?.body?.fromAmount)),
          amountText: req?.body?.fromamountText,
          postBalance: parseFloat(remainingBalance?.amount) - (parseFloat(req?.body?.fromAmount)+ parseFloat(req?.body?.fee)),
          extraType: 'debit',
          fee: req?.body?.fee,
          dashboardAmount: from_currency == "USD" ? Math.abs(parseFloat(req?.body?.fromAmount)) : await convertCurrencyAmount(from_currency,"USD",req?.body?.fromAmount)
        },
        {
          new: true,
        });

        if(to_currency == "USD") {
          var convertAmountRev = req?.body?.fee;
        } else {
          var convertAmountRev = await convertCurrencyAmount(to_currency,"USD",req?.body?.fee);
        }
        
        await Revenue.create({
          user,
          fee:req?.body?.fee,
          fromCurrency:from_currency,
          toCurrency:to_currency,
          amount,
          info,
          viewType: 'debit',
          usdRate: to_currency != "USD" ? await getCurrencyRate(to_currency,"USD") : 0,
          convertAmount:convertAmountRev,
          trans_type,
          status: "Success"
        });

        await Transaction.create({
          user,source_account:transfer_account,receipient,info,iban,bic,trans_type,tr_type,country,from_currency:from_currency,status,
          transfer_account:source_account,to_currency:to_currency,addedBy,
          ttNumber:"",
          trx:Math.floor(Math.random() * 999999999999),
          amount:req?.body?.fromAmount,
          extraType: 'credit',
          amountText: req?.body?.amountText,
          conversionAmount:req?.body?.amount, 
          conversionAmountText: req?.body?.amountText, 
          postBalance: parseFloat(req?.body?.amount) + parseFloat(remainingBalanceto?.amount),
          fee: req?.body?.fee,
          dashboardAmount: from_currency == "USD" ? Math.abs(parseFloat(req?.body?.fromAmount)) : await convertCurrencyAmount(from_currency,"USD",req?.body?.fromAmount)
        });

      } else if(trans_type == "Add Money") {
        const totalAmount = parseFloat(amount)+parseFloat(remainingBalance?.amount);
        if(tr_type != "bank-transfer") {
          const transaction = await Transaction.create({
            user,source_account,receipient,info,iban,bic,trans_type,tr_type,country,from_currency,status,
            transfer_account,to_currency,addedBy,ttNumber:"",trx:Math.floor(Math.random() * 999999999999)
          });

          await Account.findByIdAndUpdate(
          {
            _id:transfer_account
          },
          {
            amount: parseFloat(totalAmount)
          },
          {
            new: true,
          });

          await Transaction.findByIdAndUpdate(
          {
            _id:transaction?._id
          },
          {
            amount: amount,
            amountText: amountText,
            postBalance: parseFloat(totalAmount),
            extraType: 'credit',
            dashboardAmount: from_currency == "USD" ? Math.abs(parseFloat(amount)) : await convertCurrencyAmount(from_currency,"USD",amount)
          },
          {
            new: true,
          });

        } else if(tr_type == "bank-transfer") {
          const receiverAccountCurrency = await Account.findOne({ _id: transfer_account });
          if(to_currency != receiverAccountCurrency?.currency) {
            var converSionAmount = await convertCurrencyAmount(to_currency,receiverAccountCurrency?.currency,amount);
          }

          await Transaction.create({
            user,source_account,receipient,info,iban,bic,trans_type,tr_type,country,from_currency:from_currency,status,
            transfer_account,to_currency:receiverAccountCurrency?.currency,addedBy,
            ttNumber:"",
            trx:Math.floor(Math.random() * 999999999999),
            amount:req?.body?.amount,
            extraType: 'debit',
            fee: req?.body?.fee,
            conversionAmount: converSionAmount ? converSionAmount : req?.body?.conversionAmount,
            conversionAmountText: req?.body?.conversionAmountText,
            amountText: req?.body?.amountText,
            postBalance: remainingBalance?.amount,
            dashboardAmount: from_currency == "USD" ? Math.abs(parseFloat(req?.body?.amount)) : await convertCurrencyAmount(from_currency,"USD",req?.body?.amount)
          });

        }
      }
    
      return res.status(200).json({
        status: 201,
        message: "Transaction is added Successfully!!!",
        data:receipient
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
  // This function is used to update status
  updateStatus: async(req,res) => {
    const {status,source_account,amount,comment} = req.body;
    try {

      if(!req.params.id) {
        return res.status(401).json({
          status: 401,
          message: "Transaction Id is missing",
          data: null
        })
      }

      if(!status) {
        return res.status(401).json({
          status: 401,
          message: "Status is missing",
          data: null
        })
      }

      const ObjectId = mongoose.Types.ObjectId;

      const TransactionData = await Transaction.findOne({_id: new ObjectId(req.params.id)});

      if(!TransactionData) {
        return res.status(401).json({
          status: 401,
          message: "This Transaction doesn't exists",
          data: null
        })
      }

      var amountVal = 0;

      if(TransactionData?.conversionAmount) {
        amountVal = TransactionData?.conversionAmount;
      } else {
        amountVal = amount;
      }

      const remainingBalance = await Account.findOne({_id: source_account});
  
      parseFloat(amountVal)+parseFloat(remainingBalance?.amount);

      if(status == "Complete" && TransactionData?.receipient) {

        const receipientBal = await Receipient.findOne({_id: TransactionData?.receipient});

        await Receipient.findByIdAndUpdate(
        {
          _id:TransactionData?.receipient
        },
        {
          amount: parseFloat(amountVal)+parseFloat(receipientBal?.amount)
        },
        {
          new: true,
        });

        var update1 = await Account.findByIdAndUpdate(
        {
          _id:source_account
        },
        {
          amount: parseFloat(remainingBalance?.amount) - (parseFloat(TransactionData?.amount) + parseFloat(TransactionData?.fee))
        },
        {
          new: true,
        });

        await Transaction.create({
          user:TransactionData?.user,
          source_account:TransactionData?.source_account,
          transfer_account:TransactionData?.transfer_account,
          receipient:TransactionData?.receipient,
          info:TransactionData?.info,
          iban:TransactionData?.iban,
          bic:TransactionData?.bic,
          trans_type:TransactionData?.trans_type,
          tr_type:TransactionData?.tr_type,
          country:TransactionData?.country,
          from_currency:TransactionData?.from_currency,
          status:"Complete",
          to_currency:TransactionData?.to_currency,
          addedBy:TransactionData?.addedBy,
          trx:TransactionData?.trx,
          amount:TransactionData?.amount,
          extraType: 'debit',
          conversionAmount: TransactionData?.conversionAmount,
          conversionAmountText: TransactionData?.conversionAmountText,
          amountText:TransactionData?.amountText,
          fee: TransactionData?.fee,
          postBalance:parseFloat(remainingBalance?.amount) - (parseFloat(TransactionData?.amount) + parseFloat(TransactionData?.fee)),
          comment: comment,
          dashboardAmount: TransactionData?.dashboardAmount
        });

        await Transaction.findByIdAndDelete(
        {
          _id:new ObjectId(req?.params?.id)
        });

        if(TransactionData?.to_currency == "USD") {
          var convertAmountRev = req?.body?.fee;
        } else {
          var convertAmountRev = await convertCurrencyAmount(TransactionData?.to_currency,"USD",TransactionData?.fee);
        }

        await addNotification(TransactionData?.user,title=`Transaction status has been updated by the admin`,tags=`Bank Transfer Transaction Status, Bank Transfer, Admin Action`,"Bank Transfer",notifyFrom="admin",notifyType="transaction",attachment="",info=`Transaction status has been updated`);
        
        await Revenue.create({
          user:TransactionData?.user,
          fee:TransactionData?.fee,
          fromCurrency:TransactionData?.from_currency,
          toCurrency:TransactionData?.to_currency,
          amount:TransactionData?.amount,
          info:TransactionData?.info,
          viewType: TransactionData?.extraType,
          usdRate: TransactionData?.to_currency != "USD" ? await getCurrencyRate(Transaction?.to_currency,"USD") : 0,
          trans_type:TransactionData?.trans_type,
          convertAmount:convertAmountRev,
          status: "Success"
        });

      } else if(status == "Complete") {

        var update1 = await Account.findByIdAndUpdate(
        {
          _id:source_account
        },
        {
          amount: parseFloat(remainingBalance?.amount) - (parseFloat(TransactionData?.amount) + parseFloat(TransactionData?.fee))
        },
        {
          new: true,
        });

        const receiverAccount = await Account.findOne({_id: TransactionData?.transfer_account});
  
        await Transaction.create({
          user:TransactionData?.user,
          source_account:TransactionData?.transfer_account,
          transfer_account:TransactionData?.source_account,
          receipient:TransactionData?.receipient,
          info:TransactionData?.info,
          iban:TransactionData?.iban,
          bic:TransactionData?.bic,
          trans_type:TransactionData?.trans_type,
          tr_type: "Bank Transfer",
          country:TransactionData?.country,
          from_currency:TransactionData?.from_currency,
          status:"Complete",
          to_currency:TransactionData?.to_currency,
          addedBy:TransactionData?.addedBy,
          trx:TransactionData?.trx,
          amount: parseFloat(TransactionData?.conversionAmount).toFixed(2),
          extraType: 'credit',
          conversionAmount: 0,
          conversionAmountText: '',
          amountText: '',
          fee: 0,
          postBalance:parseFloat(receiverAccount?.amount) + parseFloat(TransactionData?.conversionAmount),
          comment: comment,
          dashboardAmount: TransactionData?.dashboardAmount
        });
  
        await Transaction.findByIdAndUpdate(
        {
          _id:new ObjectId(req?.params?.id)
        },
        {
          status: "Complete",
          postBalance: parseFloat(remainingBalance?.amount) - (parseFloat(TransactionData?.amount) + parseFloat(TransactionData?.fee))
        },
        {
          new: true,
        });

        await Account.findByIdAndUpdate(
        {
          _id:TransactionData?.transfer_account
        },
        {
          amount: parseFloat(receiverAccount?.amount) + parseFloat(TransactionData?.conversionAmount)
        },
        {
          new: true,
        });

        if(TransactionData?.to_currency == "USD") {
          var convertAmountRev = req?.body?.fee;
        } else {
          var convertAmountRev = await convertCurrencyAmount(TransactionData?.to_currency,"USD",TransactionData?.fee);
        }
        
        await Revenue.create({
          user:TransactionData?.user,
          fee:TransactionData?.fee,
          fromCurrency:TransactionData?.from_currency,
          toCurrency:TransactionData?.to_currency,
          amount:TransactionData?.amount,
          info:TransactionData?.info,
          viewType: TransactionData?.extraType,
          usdRate: TransactionData?.to_currency != "USD" ? await getCurrencyRate(TransactionData?.to_currency,"USD") : 0,
          convertAmount:convertAmountRev,
          trans_type:TransactionData?.trans_type,
          status: "Success"
        });

        await addNotification(TransactionData?.user,title=`Transaction status has been updated by the admin`,tags=`Bank Transfer Transaction Status, Bank Transfer, Admin Action`,"Bank Transfer",notifyFrom="admin",notifyType="transaction",attachment="",info=`Transaction status has been updated`);

      } else {
        var update1 = await Transaction.findByIdAndUpdate(
        {
          _id:new ObjectId(req?.params?.id)
        },
        {
          status: status,
          comment: comment
        },
        {
          new: true,
        });
        
        await addNotification(TransactionData?.user,title=`Transaction status has been updated by the admin`,tags=`Bank Transfer Transaction Status, Bank Transfer, Admin Action`,"Bank Transfer",notifyFrom="admin",notifyType="transaction",attachment="",info=`Transaction status has been updated`);

      }
      
      if(!update1) {
        return  res.status(401).json({
          status: 401,
          message: "Error while updating transaction data",
          data: null
        })
      }
          
      return res.status(200).json({
        status: 201,
        message: "Transaction has been updated Successfully!!!",
        data:update1
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
  // This function is used to transaction list
  transactionList: async(req,res) => {
    const user_id = req.params.id; 
    const title = req.query.title || '';
    const transactionType = req?.query?.transType || '';
    const statusFilter = req?.query?.status || '';
    const accountFilter = req?.query?.account || '';
    const startDateFilter = req?.query?.startDate || '';
    const endDateFilter = req?.query?.endDate || '';

    try {
      if(!user_id) {
        return res.status(402).json({
          status: 402,
          message: "User Id is missing",
          data: null
        })
      }

      var details = await Transaction.find({
        user:user_id,
        info: {'$regex': title, '$options' : 'i'},
        trans_type: {'$regex': transactionType, '$options' : 'i'},
        status: {'$regex': statusFilter, '$options' : 'i'}
      }).sort({"createdAt": -1});

      if(startDateFilter && endDateFilter) {
        var details = await Transaction.find({
          user:user_id,
          info: {'$regex': title, '$options' : 'i'},
          trans_type: {'$regex': transactionType, '$options' : 'i'},
          status: {'$regex': statusFilter, '$options' : 'i'},
          createdAt: {
            $gte: new Date(startDateFilter),
            $lte: moment.utc(endDateFilter).endOf('day').toDate()
          }
        }).sort({"createdAt": -1});
      }

      if(accountFilter) {
        const accountResult = details?.filter(value => value?.source_account == accountFilter);
        details = accountResult;
      }
 
      if(!details) {
        console.log(details);
        return res.status(402).json({
          status: 402,
          message: "Error while fetching transaction list!!!",
          data: null
        })
      }
 
      return res.status(201).json({
        status:201,
        message: "Transaction list is Successfully fetched",
        data: details
     })
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: 500,
        message: "Error while fetching transaction list!!!",
        data: error
      })
    }
  },
  // This function admin transation list (Admin API)
  admintransaction_all: async(req,res) => {

    const title = req.query.title || '';
    const transactionType = req?.query?.transType || '';
    const statusFilter = req?.query?.status || '';
    const accountFilter = req?.query?.account || '';
    const startDateFilter = req?.query?.startDate || '';
    const endDateFilter = req?.query?.endDate || '';

    try {

      var details = await Transaction.find({
        info: {'$regex': title, '$options' : 'i'},
        trans_type: {'$regex': transactionType, '$options' : 'i'},
        status: {'$regex': statusFilter, '$options' : 'i'},
      }).sort({ createdAt: -1});

      if(startDateFilter && endDateFilter) {
        var details = await Transaction.find({
          info: {'$regex': title, '$options' : 'i'},
          trans_type: {'$regex': transactionType, '$options' : 'i'},
          status: {'$regex': statusFilter, '$options' : 'i'},
          createdAt: {
            $gte: new Date(startDateFilter),
            $lte: moment.utc(endDateFilter).endOf('day').toDate()
          } 
        });
      }

      if(accountFilter) {
        const accountResult = details?.filter(value => value?.source_account == accountFilter);
        details = accountResult;
      }
 
      if(!details) {
        console.log(details);
        return res.status(402).json({
          status: 402,
          message: "Error while fetching transaction list!!!",
          data: null
        })
      }
 
      return res.status(201).json({
        status:201,
        message: "Transaction list is Successfully fetched",
        data: details
     })
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: 500,
        message: "Error while fetching transaction list!!!",
        data: error
      })
    }
  },
  // This function is used for fetch transaction list for admin panel
  admintransactionList: async(req,res) => {

    try {

     const details = await Transaction.aggregate([
      {
        $match: {
          tr_type:'bank-transfer'
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
          receipient:1,
          info:1,
          trans_type:1,
          country:1,
          from_currency:1,
          amount:1,
          iban:1,
          ibanText:1,
          bic:1,
          comment:1,
          source_account:1,
          amountText:1,
          to_currency:1,
          postBalance:1,
          status:1,
          trx:1,
          upi_email:1,
          upi_contact:1,
          upi_id:1,
          createdAt:1,
          userDetails: {
          _id: 1,
          name: 1,
          email: 1,
          mobile: 1,      
          country: 1,
          currency:1,
          amount:1,
          status:1,
          }
        }
      },
      {$sort: {"createdAt": -1}},
     ])
 
      if(!details) {
        return res.status(402).json({
          status: 402,
          message: "Error while fetching transaction list!!!",
          data: null
        })
      }
 
      return res.status(201).json({
        status:201,
        message: "Transaction list is Successfully fetched",
        data: details
     })
    } catch (error) {
      return res.status(500).json({
        status: 500,
        message: "Error while fetching transaction list!!!",
        data: error
      })
    }
  },
  // This function is used for fecth transaction details by their id
  transactionById: async(req,res) => {

    try {

    const transactionid = req.params.id;

    if(!transactionid) {
      return res.status(402).json({
        status: 402,
        message: "Transaction Id is missing",
        data: null
      });
    }
  
    const ObjectId = mongoose.Types.ObjectId;
    const details = await Transaction.aggregate([
    {
     $match: {
      _id: new ObjectId(transactionid)
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
      "from": "accounts",
      "localField": "source_account",
      "foreignField": "_id",
      "as": "senderAccountDetails"
     }
    },
    {
     $lookup: {
      "from": "accounts",
      "localField": "transfer_account",
      "foreignField": "_id",
      "as": "transferAccountDetails"
     }
    },
    {
     $lookup: {
      "from": "receipients",
      "localField": "transfer_account",
      "foreignField": "_id",
      "as": "recAccountDetails"
     }
    },
    {
     $project: {
      _id:1,
      user:1,
      receipient:1,
      info:1,
      trans_type:1,
      tr_type:1,
      trx:1,
      extraType:1,
      postBalance:1,
      amountText:1,
      addedBy:1,
      fee:1,
      comment:1,
      conversionAmount:1,
      conversionAmountText:1,
      upi_email:1,
      upi_contact:1,
      upi_id:1,
      updatedAt:1,
      country:1,
      from_currency:1,
      to_currency:1,
      amount:1,
      status:1,
      createdAt:1,
      userDetails: {
      _id: 1,
      name: 1,
      email: 1,
      mobile: 1,      
      address: 1,
      postalcode:1,
      state:1,
      city: 1,
      country: 1,
      defaultCurrency: 1,
      status:1,
     },
     senderAccountDetails: {
      _id:1,
      name:1,
      email: 1,
      iban:1,
      ibanText:1,
      bic_code:1,
      currency:1,
      country:1,
      address:1,
      amount:1,
      bankName:1
     },
     transferAccountDetails: {
      _id:1,
      name:1,
      email: 1,
      iban:1,
      ibanText:1,
      bic_code:1,
      country:1,
      currency:1,
      address:1,
      amount:1,
      bankName:1
     },
     recAccountDetails: {
      _id:1,
      name:1,
      email: 1,
      iban:1,
      bic_code:1,
      currency:1,
      address:1,
      amount:1,
      country:1,
      bankName:1
     }
    }
   },
   ])

   if(!details) {
    console.log(details);
    return res.status(402).json({
     status: 402,
     message: "Error while fetching transaction details!!!",
     data: null
    });
   }

   return res.status(201).json({
    status:201,
    message: "Transaction details is Successfully fetched",
    data: details
   });

  } catch (error) {
    console.log(error); 
    return res.status(500).json({
      status:500,
      message: "Something went wrong with api",
      data: error
    });
   }
  },
  // This function is used for transaction by their id (Mobile API)
  transactionByIdApi: async(req,res) => {

    try {

    const transactionid = req.params.id;

    if(!transactionid) {
      return res.status(402).json({
        status: 402,
        message: "Transaction Id is missing",
        data: null
      })
    }
  
    const ObjectId = mongoose.Types.ObjectId;
    const details = await Transaction.aggregate([
    {
     $match: {
      _id: new ObjectId(transactionid)
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
      "from": "accounts",
      "localField": "source_account",
      "foreignField": "_id",
      "as": "senderAccountDetails"
     }
    },
    {
     $lookup: {
      "from": "accounts",
      "localField": "transfer_account",
      "foreignField": "_id",
      "as": "transferAccountDetails"
     }
    },
    {
     $lookup: {
      "from": "receipients",
      "localField": "transfer_account",
      "foreignField": "_id",
      "as": "recAccountDetails"
     }
    },
    {
     $project: {
      _id:1,
      user:1,
      receipient:1,
      info:1,
      trans_type:1,
      tr_type:1,
      trx:1,
      extraType:1,
      postBalance:1,
      amountText:1,
      addedBy:1,
      fee:1,
      comment:1,
      conversionAmount:1,
      conversionAmountText:1,
      upi_email:1,
      upi_contact:1,
      upi_id:1,
      updatedAt:1,
      country:1,
      from_currency:1,
      to_currency:1,
      amount:1,
      status:1,
      createdAt:1,
      userDetails: {
      _id: 1,
      name: 1,
      email: 1,
      mobile: 1,      
      address: 1,
      postalcode:1,
      state:1,
      city: 1,
      country: 1,
      defaultCurrency: 1,
      status:1,
     },
     senderAccountDetails: {
      _id:1,
      name:1,
      email: 1,
      iban:1,
      ibanText:1,
      bic_code:1,
      currency:1,
      country:1,
      address:1,
      amount:1,
      bankName:1
     },
     transferAccountDetails: {
       _id:1,
        name:1,
       email: 1,
       iban:1,
       ibanText:1,
       bic_code:1,
       country:1,
       currency:1,
       address:1,
       amount:1,
       bankName:1
     },
     recAccountDetails: {
      _id:1,
      name:1,
      email: 1,
      iban:1,
      bic_code:1,
      currency:1,
      address:1,
      amount:1,
      country:1,
      bankName:1
     }
    }
   },
   ])

   if(!details) {
    console.log(details);
    return res.status(402).json({
     status: 402,
     message: "Error while fetching transaction details!!!",
     data: null
    });
   }

   var resultArray = [];
   if(details) {
    details?.map(item => {
      resultArray.push({
        "_id": item?._id,
        "user": item?.user,
        "trx": item?.trx,
        "receipient": item?.receipient,
        "info": item?.info,
        "trans_type": item?.trans_type,
        "tr_type": item?.tr_type,
        "extraType": item?.extraType,
        "country": item?.country,
        "from_currency": item?.from_currency,
        "to_currency": item?.to_currency,
        "amount": item?.amount,
        "postBalance": item?.postBalance,
        "amountText": item?.amountText,
        "status": item?.status,
        "addedBy": item?.addedBy,
        "fee": item?.fee,
        "conversionAmount": item?.conversionAmount,
        "conversionAmountText": item?.conversionAmountText,
        "upi_email": item?.upi_email,
        "upi_contact": item?.upi_contact,
        "upi_id": item?.upi_id,
        "comment": item?.comment,
        "createdAt": item?.createdAt,
        "updatedAt": item?.updatedAt,
        "senderAccountDetails": [{
          "_id": item?.trans_type == "Exchange" && item?.extraType == "credit" ? item?.transferAccountDetails[0]?._id : item?.senderAccountDetails[0]?._id,
          "name": item?.trans_type == "Exchange" && item?.extraType == "credit" ? item?.transferAccountDetails[0]?.name : item?.senderAccountDetails[0]?.name,
          "bankName": item?.trans_type == "Exchange" && item?.extraType == "credit" ? item?.transferAccountDetails[0]?.bankName : item?.senderAccountDetails[0]?.bankName,
          "email": item?.trans_type == "Exchange" && item?.extraType == "credit" ? item?.transferAccountDetails[0]?.email : item?.senderAccountDetails[0]?.email,
          "iban": item?.trans_type == "Exchange" && item?.extraType == "credit" ? item?.transferAccountDetails[0]?.iban : item?.senderAccountDetails[0]?.iban,
          "ibanText": item?.trans_type == "Exchange" && item?.extraType == "credit" ? item?.transferAccountDetails[0]?.ibanText : item?.senderAccountDetails[0]?.ibanText,
          "bic_code": item?.trans_type == "Exchange" && item?.extraType == "credit" ? item?.transferAccountDetails[0]?.bic_code : item?.senderAccountDetails[0]?.bic_code,
          "country": item?.trans_type == "Exchange" && item?.extraType == "credit" ? item?.transferAccountDetails[0]?.country : item?.senderAccountDetails[0]?.country,
          "currency": item?.trans_type == "Exchange" && item?.extraType == "credit" ? item?.transferAccountDetails[0]?.currency : item?.senderAccountDetails[0]?.currency,
          "amount": item?.trans_type == "Exchange" && item?.extraType == "credit" ? item?.transferAccountDetails[0]?.amount : item?.senderAccountDetails[0]?.amount,
          "address": item?.trans_type == "Exchange" && item?.extraType == "credit" ? item?.transferAccountDetails[0]?.address : item?.senderAccountDetails[0]?.address
        }],
        "transferAccountDetails": [{
          "_id": item?.trans_type == "Exchange" && item?.extraType == "credit" ? item?.senderAccountDetails[0]?._id  : item?.transferAccountDetails[0]?._id,
          "name": item?.trans_type == "Exchange" && item?.extraType == "credit" ? item?.senderAccountDetails[0]?.name : item?.transferAccountDetails[0]?.name,
          "bankName": item?.trans_type == "Exchange" && item?.extraType == "credit" ? item?.senderAccountDetails[0]?.bankName : item?.transferAccountDetails[0]?.bankName,
          "email": item?.trans_type == "Exchange" && item?.extraType == "credit" ? item?.senderAccountDetails[0]?.email : item?.transferAccountDetails[0]?.email,
          "iban": item?.trans_type == "Exchange" && item?.extraType == "credit" ? item?.senderAccountDetails[0]?.iban : item?.transferAccountDetails[0]?.iban,
          "ibanText": item?.trans_type == "Exchange" && item?.extraType == "credit" ? item?.senderAccountDetails[0]?.ibanText : item?.transferAccountDetails[0]?.ibanText,
          "bic_code": item?.trans_type == "Exchange" && item?.extraType == "credit" ? item?.senderAccountDetails[0]?.bic_code : item?.transferAccountDetails[0]?.bic_code,
          "country": item?.trans_type == "Exchange" && item?.extraType == "credit" ? item?.senderAccountDetails[0]?.country : item?.transferAccountDetails[0]?.country,
          "currency": item?.trans_type == "Exchange" && item?.extraType == "credit" ? item?.senderAccountDetails[0]?.currency : item?.transferAccountDetails[0]?.currency,
          "amount": item?.trans_type == "Exchange" && item?.extraType == "credit" ? item?.senderAccountDetails[0]?.amount : item?.transferAccountDetails[0]?.amount,
          "address": item?.trans_type == "Exchange" && item?.extraType == "credit" ? item?.senderAccountDetails[0]?.address : item?.transferAccountDetails[0]?.address
       
        }],
        "recAccountDetails": [  {
          "_id": item?.recAccountDetails[0]?._id,
          "name": item?.recAccountDetails[0]?.name,
          "email": item?.recAccountDetails[0]?.email,
          "address": item?.recAccountDetails[0]?.address,
          "iban": item?.recAccountDetails[0]?.iban,
          "bic_code": item?.recAccountDetails[0]?.bic_code,
          "country": item?.recAccountDetails[0]?.country,
          "currency": item?.recAccountDetails[0]?.currency,
          "amount": item?.recAccountDetails[0]?.amount,
          "bankName": item?.recAccountDetails[0]?.bankName
        }]
      })
    })
   }
  
   return res.status(201).json({
    status:201,
    message: "Transaction details is Successfully fetched",
    data: resultArray
   });

  } catch (error) {
    console.log(error); 
    return res.status(500).json({
      status:500,
      message: "Something went wrong with api",
      data: error
    })
   }
  },
  // This function is used for get statement for excel
  getStatement: async(req,res) => {
    try {

    const {account,user_id,days,email,name,type,startDate,endDate} = req.body;
 
    if(!user_id) {
      return res.status(402).json({
       status: 402,
       message: "User Id is missing",
       data: null
      })
    }

    if(!account) {
      return res.status(402).json({
        status: 402,
        message: "Source Account Id is missing",
        data: null
      })
    }

    const ObjectId = mongoose.Types.ObjectId;

    if(type == "custom") {
      var details = await Transaction.aggregate([
       {
        $match: {
        source_account: new ObjectId(account),
        createdAt: {
          $gte: new Date(startDate),
          $lte: moment.utc(endDate).endOf('day').toDate()
        } 
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
        receipient:1,
        info:1,
        trans_type:1,
        country:1,
        from_currency:1,
        to_currency:1,
        amount:1,
        amountText:1,
        status:1,
        createdAt:1,
        userDetails: {
        _id: 1,
        name: 1,
        email: 1,
        mobile: 1,      
        address: 1,
        city: 1,
        country: 1,
        defaultCurrency: 1,
        status:1,
      }
     }
    }
   ])
  } else {

    var details = await Transaction.aggregate([
    {
      $match: {
       source_account: new ObjectId(account),
        "createdAt": { $gt: moment().startOf('day').subtract(days, 'days').toDate() }
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
        receipient:1,
        info:1,
        trans_type:1,
        country:1,
        from_currency:1,
        to_currency:1,
        amount:1,
        amountText:1,
        status:1,
        createdAt:1,
        userDetails: {
          _id: 1,
          name: 1,
          email: 1,
          mobile: 1,      
          address: 1,
          city: 1,
          country: 1,
          defaultCurrency: 1,
          status:1,
        }
       }
      }
     ])
    }

    if(!details) {
      return res.status(402).json({
        status: 402,
        message: "Error while fetching transaction details!!!",
        data: null
      })
    }

    if(details.length > 0) {
      //generatePDFfromURL('', 'statement.pdf',details,email,name);
    }

    return res.status(201).json({
      status:201,
      message: "Statement details is Successfully fetched",
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
  // This function is used for get transaction details by their source account
  transactionBySourceAccount: async(req,res) => {
    try {
      const {account,user_id,currency} = req.body;

      if(!user_id) {
       return res.status(402).json({
        status: 402,
        message: "User Id is missing",
        data: null
       })
      }

      if(!account) {
        return res.status(402).json({
          status: 402,
          message: "Source Account Id is missing",
          data: null
        })
      }
      
      const ObjectId = mongoose.Types.ObjectId;
      const details = await Transaction.aggregate([
      {
        $match: {
          user: new ObjectId(user_id),
          source_account:new ObjectId(account),
        }
      },
      {
        $lookup: {
         "from": "accounts",
         "localField": "user",
         "foreignField": "source_account",
         "as": "accountDetails"
        }
      },
      {
        $project: {
         _id:1,
         user:1,
         receipient:1,
         info:1,
         tr_type:1,
         trans_type:1,
         extraType:1,
         country:1,
         from_currency:1,
         to_currency:1,
         amount:1,
         amountText:1,
         postBalance:1,
         status:1,
         comment:1,
         trx:1,
         conversionAmount:1,
         conversionAmountText:1,
         fee:1,
         createdAt:1,
         accountDetails: {
           _id: 1,
          name: 1,
          email: 1,
          mobile: 1, 
          ibanText:1,     
          country: 1,
          currency:1,
          amount:1,
          status:1,
        }
        }
      },
      {$sort: {"createdAt": -1}},
     ])

     if(!details) {
      return res.status(402).json({
       status: 402,
       message: "Error while fetching transaction details!!!",
       data: null
      })
     }

     return res.status(201).json({
       status:201,
       message: "Transaction details is Successfully fetched",
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
  // This function is used for send transaction details to the user
  sendTransaction: async(req,res) => {
    const {user,source_account,iban,bic,tr_type,receipient,info,trans_type,country,to_currency,from_currency,amount,amountText,status,addedBy} = req.body;
    try {
      if(trans_type == "" || amount == "" || source_account == "" || user == "") {
        return res.status(401).json({
          status: 401,
          message: "Transaction Type, User, Source Account and Country Code are mandatory",
          data: null
        })
      }

      const remainingBalance = await Account.findOne({_id: source_account});
  
      if(trans_type == "Add Money") {
        const remainingBalanceto = await Receipient.findOne({_id: receipient});
        const transaction = await Transaction.create({
          user,source_account,receipient,info,iban,bic,trans_type: tr_type == "rbank-transfer" ? "External Transfer" : "Beneficiary Transfer Money",tr_type: tr_type == "rbank-transfer" ? "bank-transfer" : tr_type,country,from_currency,status,
          transfer_account:receipient,to_currency,addedBy,trx:Math.floor(Math.random() * 999999999999)
        });

        await Transaction.findByIdAndUpdate(
        {
          _id:transaction?._id
        },
        {
          amount: parseFloat(req?.body?.amount),
          amountText:amountText,
          postBalance: parseFloat(remainingBalance?.amount),
          extraType: 'debit',
          fee: req?.body?.fee,
          conversionAmount: req?.body?.conversionAmount,
          conversionAmountText: req?.body?.conversionAmountText,
          dashboardAmount: from_currency == "USD" ? Math.abs(parseFloat(req?.body?.amount)) : await convertCurrencyAmount(from_currency,"USD",req?.body?.amount)
        },
        {
          new: true,
        });
      } 
    
      return res.status(200).json({
        status: 201,
        message: "Transaction is added Successfully!!!",
        data:receipient
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
  // This function is used for export excel details
  exportExcelForTransaction: async(req,res) => {
    const workbook = new excelJS.Workbook();  // Create a new workbook
    const worksheet = workbook.addWorksheet("Transactions"); // New Worksheet
    const path = "./public";  // Path to download excel
    // Column for data in excel. key must match data key
    worksheet.columns = [
    { header: "S no.", key: "s_no", width: 10 }, 
    { header: "Date", key: "createdAt", width: 20 },
    { header: "Info", key: "info", width: 20 },
    { header: "Transaction Type", key: "trans_type", width: 20 },
    { header: "From Currency", key: "from_currency", width: 20 },
    { header: "Received Currency", key: "to_currency", width: 20 },
    { header: "Amount", key: "amountText", width: 20 },
    { header: "Status", key: "status", width: 20 },
    ];

    const invoiceData = await Transaction.find({user: req.params.id});

    // Looping through User data
    let counter = 1;
    invoiceData.forEach((user) => {
      user.s_no = counter;
      worksheet.addRow(user); // Add data in worksheet
      counter++;
    });

    // Making first line in excel bold
      worksheet.getRow(1).eachCell((cell) => {
        cell.font = { bold: true };
      });
      try {
        await workbook.xlsx.writeFile(`${path}/transactions.xlsx`)
        .then(() => {
          res.send({
            status: "success",
            message: "file successfully downloaded",
            path: `${path}/transactions.xlsx`,
          });
        });
      } catch (err) {
          res.send({
          status: "error",
          message: "Something went wrong",
        });
        }
  },
  // This function is used for export excel transaction statement of the user
  exportExcelForTransactionStatement: async(req,res) => {
 
    const transactionType = req?.query?.transType || '';
    const statusFilter = req?.query?.status || '';
    const accountFilter = req?.query?.account || '';
    const startDateFilter = req?.query?.startDate || '';
    const endDateFilter = req?.query?.endDate || '';

    const workbook = new excelJS.Workbook();  // Create a new workbook
    const worksheet = workbook.addWorksheet("Statement"); // New Worksheet
    const path = "./public";  // Path to download excel
    // Column for data in excel. key must match data key
    worksheet.columns = [
    { header: "S no.", key: "s_no", width: 10 }, 
    { header: "Date", key: "createdAt", width: 20 },
    { header: "Info", key: "info", width: 20 },
    { header: "Transaction Type", key: "trans_type", width: 20 },
    { header: "From Currency", key: "from_currency", width: 20 },
    { header: "Received Currency", key: "to_currency", width: 20 },
    { header: "Amount", key: "amountText", width: 20 },
    { header: "Status", key: "status", width: 20 },
    ];

    try {
      var invoiceData = await Transaction.find({
        user:req.params.id,
        trans_type: {'$regex': transactionType, '$options' : 'i'},
        status: {'$regex': statusFilter, '$options' : 'i'},
      });

      if(startDateFilter && endDateFilter) {
        var invoiceData = await Transaction.find({
          user:req.params.id,
          trans_type: {'$regex': transactionType, '$options' : 'i'},
          status: {'$regex': statusFilter, '$options' : 'i'},
          createdAt: {
            $gte: new Date(startDateFilter),
            $lte: moment.utc(endDateFilter).endOf('day').toDate()
          } 
        });
      }
  
      if(accountFilter) {
        const accountResult = invoiceData?.filter(value => value?.source_account == accountFilter);
        invoiceData = accountResult;
      }
  
      // Looping through User data
      let counter = 1;
      invoiceData.forEach((user) => {
        user.s_no = counter;
        worksheet.addRow(user); // Add data in worksheet
        counter++;
      });
  
      // Making first line in excel bold
        worksheet.getRow(1).eachCell((cell) => {
          cell.font = { bold: true };
        });

        try {
          await workbook.xlsx.writeFile(`${path}/Statements.xlsx`)
          .then(() => {
            res.send({
              status: "success",
              message: "file successfully downloaded",
              path: `${path}/Statements.xlsx`,
            });
          });
        } catch (err) {
            console.log(err);
            res.send({
            status: "error",
            message: "Something went wrong",
          });
        }
        
    } catch (error) {
      console.log(error);
      res.send({
        status: "error",
        message: "Something went wrong",
      });
    }

  },
  // This function is used for export excel for crypto transaction
  exportExcelForCryptoTransaction: async(req,res) => {
    const workbook = new excelJS.Workbook();  // Create a new workbook
    const worksheet = workbook.addWorksheet("CryptoTransactions"); // New Worksheet
    const path = "./public";  // Path to download excel
    // Column for data in excel. key must match data key
    worksheet.columns = [
    { header: "S no.", key: "s_no", width: 10 }, 
    { header: "Date Of Transaction", key: "createdAt", width: 20 },
    { header: "Coin", key: "coin", width: 20 },
    { header: "No Of Coins", key: "noOfCoins", width: 20 },
    { header: "Type", key: "side", width: 20 },
    { header: "Currency", key: "currencyType", width: 20 },
    { header: "Amount", key: "amount", width: 20 },
    { header: "Status", key: "status", width: 20 },
    ];

    const invoiceData = await Crypto.find({ user: req.params.id, coin: req.params.name});

    // Looping through User data
    let counter = 1;
    invoiceData.forEach((user) => {
      user.s_no = counter;
      worksheet.addRow(user); // Add data in worksheet
      counter++;
    });

    // Making first line in excel bold
      worksheet.getRow(1).eachCell((cell) => {
        cell.font = { bold: true };
      });
      try {
        await workbook.xlsx.writeFile(`${path}/cryptotransactions.xlsx`)
        .then(() => {
          res.send({
            status: "success",
            message: "file successfully downloaded",
            path: `${path}/cryptotransactions.xlsx`,
          });
        });
      } catch (err) {
          res.send({
          status: "error",
          message: "Something went wrong",
        });
        }
  },
  // This function is used for admin export transactions statement
  adminexportExcelForTransactionStatement: async(req,res) => {
 
    const transactionType = req?.query?.transType || '';
    const statusFilter = req?.query?.status || '';
    const accountFilter = req?.query?.account || '';
    const startDateFilter = req?.query?.startDate || '';
    const endDateFilter = req?.query?.endDate || '';

    const workbook = new excelJS.Workbook();  // Create a new workbook
    const worksheet = workbook.addWorksheet("Statement"); // New Worksheet
    const path = "./uploads";  // Path to download excel
    // Column for data in excel. key must match data key
    worksheet.columns = [
    { header: "S no.", key: "s_no", width: 10 }, 
    { header: "Date", key: "createdAt", width: 20 },
    { header: "Info", key: "info", width: 20 },
    { header: "Transaction Type", key: "trans_type", width: 20 },
    { header: "From Currency", key: "from_currency", width: 20 },
    { header: "Received Currency", key: "to_currency", width: 20 },
    { header: "Amount", key: "amountText", width: 20 },
    { header: "Status", key: "status", width: 20 },
    ];

    var invoiceData = await Transaction.find({
      trans_type: {'$regex': transactionType, '$options' : 'i'},
      status: {'$regex': statusFilter, '$options' : 'i'},
    });

    if(startDateFilter && endDateFilter) {
      var invoiceData = await Transaction.find({
        trans_type: {'$regex': transactionType, '$options' : 'i'},
        status: {'$regex': statusFilter, '$options' : 'i'},
        createdAt: {
          $gte: new Date(startDateFilter),
          $lte: moment.utc(endDateFilter).endOf('day').toDate()
        } 
      });
    }

    if(accountFilter) {
      const accountResult = invoiceData?.filter(value => value?.source_account == accountFilter);
      invoiceData = accountResult;
    }

    console.log(invoiceData);

    // Looping through User data
    let counter = 1;
    invoiceData.forEach((user) => {
      user.s_no = counter;
      worksheet.addRow(user); // Add data in worksheet
      counter++;
    });

    // Making first line in excel bold
      worksheet.getRow(1).eachCell((cell) => {
        cell.font = { bold: true };
      });
      try {
        await workbook.xlsx.writeFile(`${path}/Statements.xlsx`)
        .then(() => {
          res.send({
            status: "success",
            message: "file successfully downloaded",
            path: `${path}/Statements.xlsx`,
          });
        });
      } catch (err) {
          res.send({
          status: "error",
          message: "Something went wrong",
        });
      }
  },
  // This function is used for get details of transaction by user account id and currency
  accountByUserandCurrency: async(req,res) => {
    const {user,currency} = req.body;

    try {
      if(!user || !currency) {
        return res.status(400).json({
          status:400,
          message: "User / Currency is missing",
          data: null
        })
      }

      const results = await Account.findOne({
        currency: currency,
        user: user
      });

      if(!results) {
        return res.status(400).json({
          status:400,
          message: "Error while fetching details",
          data: null
        })
      }

      return res.status(201).json({
        status:201,
        message: "Account Number is successfully fetched",
        data: results?._id
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
  // This is used for exchange transfer
  getExchangeValues: async(req,res) => {

    const {from_currency,to_currency,amount} = req.body;

    const user = req?.user?._id;
    
    try {
      if(user == "" || from_currency == "" || to_currency == "" || amount == "") {
        return res.status(401).json({
          status: 401,
          message: "User From Currency, To Currency and Amount fields are mandatory",
          data: null
        })
      }

      if(amount == 0) {
        return res.status(401).json({
          status: 401,
          message: "Amount should be more than zero",
          data: null
        })
      }

      const amountValue = parseFloat(amount);

      // Number.isNaN() doesn't attempt to convert the parameter to a number, so non-numbers always return false.

      if(Number.isNaN(amountValue)) {
        return res.status(401).json({
          status: 401,
          message: "Amount should be in float / integer String values are not allowed",
          data: null
        });
      }

      const getValues = await convertCurrencyAmount(from_currency,to_currency,amountValue);

      if(!getValues) {
        console.log(getValues);
        return res.status(401).json({
          status: 401,
          message: "Something went wrong with Exchange api",
          data: null
        })
      }

      return res.status(200).json({
        status: 201,
        message: "Success",
        data:getValues
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
  // This function is used for get exchange rate
  getExchangeRate: async(req,res) => {

    const {from_currency,to_currency} = req.body;

    const user = req?.user?._id;
    
    try {
      if(user == "" || from_currency == "" || to_currency == "") {
        return res.status(401).json({
          status: 401,
          message: "User From Currency and To Currency fields are mandatory",
          data: null
        })
      }

      const getValues = await getCurrencyRate(from_currency,to_currency);

      if(!getValues) {
        console.log(getValues);
        return res.status(401).json({
          status: 401,
          message: "Somewthing went wrong with Exchange api",
          data: null
        })
      }

      return res.status(200).json({
        status: 201,
        message: "Success",
        data:getValues
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
  addMoneyTrnsactionForApp: async(req,res) => {
    const {
      user,
      status,
      paymentId,
      paymentGateway,
      amount,
      fee,
      amountText,
      from_currency,
      to_currency,
      convertedAmount,
      conversionAmountText
    } = req.body;  

    console.log("Transaction from APP", req?.body);

    try {

      if(user == "" || status == "" || paymentGateway == "") {
        return res.status(403).json({
          status: 403,
          message: "Parameters are missing",
          data:null
        });
      }

      if(paymentGateway == "Stripe") {
        if(!await paymentValidate(paymentId)) {
          return res.status(403).json({
            status: 403,
            orderStatus: null,
            message: "Un Authorized Payment",
            data:null
          });
        }
      }

      const accountInfo = await Account.findOne({user: user, currency: to_currency});

      var postBalanceVal = 0;

      if(convertedAmount) {
        postBalanceVal = convertedAmount;
      } else {
        postBalanceVal = amount;
      }
        
      const insertData = await Transaction.create({
        user: user,
        source_account:accountInfo?._id,
        info:"Add Money Through UPI",
        trans_type: "Add Money",
        from_currency:to_currency,
        amount:amount,
        tr_type: paymentGateway == "Razorpay" ? 'UPI' : "Stripe",
        extraType: "credit",
        postBalance: status == "succeeded" ? parseFloat(postBalanceVal) + parseFloat(accountInfo?.amount) : parseFloat(accountInfo?.amount),
        status,
        fee:fee,
        to_currency: from_currency,
        addedBy:"",
        amountText:amountText,
        conversionAmount: parseFloat(convertedAmount).toFixed(2),
        conversionAmountText:conversionAmountText,
        trx:Math.floor(Math.random() * 999999999999),
        ttNumber: paymentId ? paymentId : Math.floor(Math.random() * 999999999999),
        dashboardAmount: from_currency == "USD" ? Math.abs(parseFloat(amount)) : await convertCurrencyAmount(from_currency,"USD",amount)
      });

      if(accountInfo?.currency == "USD") {
        var convertAmountRev = fee;
      } else {
        var convertAmountRev = await convertCurrencyAmount(accountInfo?.currency,"USD",fee);
      }

      await Revenue.create({
        user,
        fee:fee,
        fromCurrency:to_currency,
        toCurrency:from_currency,
        amount:amount,
        viewType: "credit",
        usdRate: accountInfo?.currency != "USD" ? await getCurrencyRate(accountInfo?.currency,"USD") : 0,
        info: paymentGateway == "razorpay" ? "Add money through UPI" : "Add Money Through Stripe",
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

      if(accountInfo && status == "succeeded") {
        const totalAmount = parseFloat(postBalanceVal)+parseFloat(accountInfo?.amount);
          
        if(paymentGateway == "Razorpay") {
          updateOtherInfo(paymentId,insertData?._id)
        } 

        await Account.findByIdAndUpdate(
        {
          _id:accountInfo?._id
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

// This function is used to convert amount of one currency to other currency

// For example:- 

// If we want to convert USD to INR then we will pass argument like 
// From   = USD
// To     = INR
// Amount = 10000

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

// This function is used to get any specific currency rate like if we have USD currency and want to check that currency amount in INR in that case we use this function.

// From  =  USD
// To    =  INR

// That function will return current market currency rate.

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
        return parseFloat(response.data.result.convertedAmount).toFixed(3);
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


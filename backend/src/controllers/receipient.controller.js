const axios = require('axios');
const { Account } = require('../models/account.model');
const { Receipient } = require('../models/reciepient.model');
const { Transaction } = require('../models/transaction.model');
const { addNotification } = require('../middlewares/notification.middleware');

module.exports = {
  // This function is used for add Receipient
  addReceipient: async(req,res) => {
    const {name,user,email,address,mobile,iban,bic_code,country,rtype,currency,status,amount,bankName} = req.body;
    try {

      if(name == "" || iban == "" || bic_code == "" || user == "" || rtype == "" || bankName == "") {
        return res.status(401).json({
          status: 401,
          message: "Name, Iban , Bic Code, Bank Name and Address are mandatory",
          data: null
        });
      }

      if(country == "") {
        return res.status(401).json({
          status: 401,
          message: "Please Enter amount",
          data: null
        });
      }

      const ReceipientExists = await Receipient.findOne({iban});
    
      if(ReceipientExists) {
        return res.status(401).json({
          status: 401,
          message: "Account number is already added in our record",
          data: null
        });
      }
    
      const receipient = await Receipient.create({
        user,
        name,
        email,
        mobile,
        address,
        iban,
        bic_code,
        country,
        rtype,
        currency,
        amount,
        bankName,
        status
      });
    
      if(!receipient) {
        return  res.status(401).json({
          status: 401,
          message: "Error while inserting receipient data",
          data: null
        });
      }

      await addNotification(user,title=`Receipient has been added by the ${req?.user?.name}`,tags=`New Rceipient, Bank Tranfer, ${req?.user?.name}`,"New Receipient Request has been added",notifyFrom="user",notifyType="receipient",attachment="",info=`${req?.user?.name} New Recepient has been added`);
          
      return res.status(200).json({
        status: 201,
        message: "Receipient is added Successfully!!!",
        data:receipient
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
  addAPIReceipient: async(req,res) => {
    const {name,user,email,address,mobile,fee,iban,bic_code,from_currency,to_currency,status,amount,bankName} = req.body;
    try {

      if(name == "" || iban == "" || bic_code == "" || user == "" || bankName == "") {
        return res.status(401).json({
          status: 401,
          message: "Name, Iban , Bic Code, Bank Name and Address are mandatory",
          data: null
        });
      }

      const ReceipientExists = await Receipient.findOne({iban});
    
      if(ReceipientExists) {
        return res.status(401).json({
          status: 401,
          message: "Account number is already added in our record",
          data: null
        });
      }

      if(amount == "" || fee == "") {
        return res.status(401).json({
          status: 401,
          message: "Amount or fee is missing",
          data: null
        });
      }
    
      const receipient = await Receipient.create({
        user,
        name,
        email,
        mobile,
        address,
        iban,
        bic_code,
        country:"",
        rtype:"Individual",
        currency:to_currency,
        amount,
        bankName,
        status: true
      });
    
      if(!receipient) {
        return res.status(401).json({
          status: 401,
          message: "Error while inserting receipient data",
          data: null
        });
      }

      const accountInfo = await Account.findOne({ user:user, currency: from_currency });

      await Receipient.findOne({_id: receipient?._id});

      await Transaction.create({
        user,
        source_account:accountInfo?._id,
        receipient:receipient?._id,
        info: "Bank Transfer",
        iban,
        bic:bic_code,
        trans_type: "External Transfer",
        tr_type: "bank-transfer",
        country:'',
        from_currency,
        status,
        transfer_account:receipient?._id,
        to_currency,
        addedBy:"",
        trx:Math.floor(Math.random() * 999999999999),
        amount: parseFloat(req?.body?.amount),
        amountText:req?.body?.amountText,
        postBalance: parseFloat(accountInfo?.amount),
        extraType: 'debit',
        fee: req?.body?.fee,
        conversionAmount: req?.body?.conversionAmount,
        conversionAmountText: req?.body?.conversionAmountText,
        dashboardAmount: from_currency == "USD" ? Math.abs(parseFloat(req?.body?.amount)) : await convertCurrencyAmount(from_currency,"USD",req?.body?.amount)
      });
   
      await addNotification(user,title=`Receipient has been added by the ${req?.user?.name}`,tags=`New Rceipient, Bank Tranfer, ${req?.user?.name}`,"New Receipient Request has been added",notifyFrom="user",notifyType="receipient",attachment="",info=`${req?.user?.name} New Recepient has been added`);
          
      return res.status(200).json({
        status: 201,
        message: "Receipient is added Successfully!!!",
        data:receipient
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
  directAPIReceipient: async(req,res) => {
    const {user,fee,currency,receipient,amount,amountText,conversionAmount,conversionAmountText} = req.body;
    try {

      if(user == "" || receipient == "") {
        return res.status(401).json({
          status: 401,
          message: "User, Receipient, Currency are mandatory",
          data: null
        });
      }

      const ReceipientExists = await Receipient.findOne({_id:receipient});
    
      if(!ReceipientExists) {
        return res.status(401).json({
          status: 401,
          message: "Beneficiary does not exists",
          data: null
        });
      }

      if(amount == "" || fee == "") {
        return res.status(401).json({
          status: 401,
          message: "Amount or fee is missing",
          data: null
        });
      }

      const accountInfo = await Account.findOne({ user:user, currency: currency });

      await Transaction.create({
        user,
        source_account:accountInfo?._id,
        receipient:ReceipientExists?._id,
        info: "Bank Transfer",
        iban:ReceipientExists?.iban,
        bic:ReceipientExists?.bic_code,
        trans_type: "Beneficiary Transfer Money",
        tr_type: "bank-transfer",
        country:ReceipientExists?.country,
        from_currency:currency,
        status: "pending",
        transfer_account:ReceipientExists?._id,
        to_currency: currency,
        addedBy:"",
        trx:Math.floor(Math.random() * 999999999999),
        amount: parseFloat(amount),
        amountText:amountText,
        postBalance: parseFloat(accountInfo?.amount),
        extraType: 'debit',
        fee: fee,
        conversionAmount: conversionAmount,
        conversionAmountText: conversionAmountText,
        dashboardAmount: currency == "USD" ? Math.abs(parseFloat(amount)) : await convertCurrencyAmount(currency,"USD",amount)
      });
    
      return res.status(200).json({
        status: 201,
        message: "Bank Transfer transaction has been submitted Successfully!!!",
        data:receipient
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
  // This function is used for fetch Receipient List
  receipientList: async(req,res) => {
      
    const user_id = req.params.id; 
    const title = req.query.title || '';

    try {
      if(!user_id) {
        return res.status(402).json({
          status: 402,
          message: "User Id is missing",
          data: null
        });
      }
 
      const details = await Receipient.find({
        user:user_id,
        $or:[
          {'name':{'$regex': title, '$options' : 'i'}},
          {'iban':{'$regex': title, '$options' : 'i'}},
        ]
      });
 
      if(!details) {
        return res.status(402).json({
          status: 402,
          message: "Error while fetching receipient list!!!",
          data: null
        });
      }
 
      return res.status(201).json({
        status:201,
        message: "receipient list is Successfully fetched",
        data: details
      });

     } catch (error) {
        return res.status(500).json({
          status: 500,
          message: "Error while fetching receipient list!!!",
          data: error
        });
     }
  },
  // This function is used for get Receipient details by their id
  receipientById: async(req,res) => {
      
    try {
      const user_id = req.params.id;
  
      if(!user_id) {
        return res.status(402).json({
          status: 402,
          message: "User Id is missing",
          data: null
        });
      }
  
      const details = await Receipient.findOne({_id: user_id});
  
      if(!details) {
        return res.status(402).json({
          status: 402,
          message: "Error while fetching receipient details!!!",
          data: null
        });
      }
  
      return res.status(201).json({
        status:201,
        message: "Reciepient list is Successfully fetched",
        data: details
      });

    } catch (error) {
      return res.status(500).json({
        status:500,
        message: "Something went wrong with api",
        data: error
      })
    }
  },
  // This function is used uodate Receipient info
  updateReciepientInfo: async(req,res) => {
    
    try {
              
      const {name,user_id,email,address,mobile,iban,bic_code,country,currency,status,amount,type} = req.body;

      if(user_id == "") {
        return res.status(401).json({
          status: 401,
          message: "All fields are mandatory!!!",
          data: null
        });
      }
        
      const UpdateDetails = await Receipient.findByIdAndUpdate(
      {
        _id:user_id
      },
      {
        name,
        email,
        address,
        mobile,
        iban,
        bic_code,
        country,
        currency,
        status,
        amount,
        rtype:type
      },
      {
        new: true,
      });
        
      if(!UpdateDetails) {
        return  res.status(401).json({
          status:401,
          message: "Error while updating receipient details!",
          data:null
        });
      }
        
      return res.status(201).json({
        status:201,
        message: "Receipient Details is updated successfully",
        data:UpdateDetails
      });
      
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
const { mongoose } = require("mongoose");
const { CoinPair } = require('../../models/Admin/coinpair.model');

module.exports = {
  addCoin: async(req,res) => {
    const {
      baseCurrency,baseCurrencyValue,quoteCurrency,
      quoteCurrencyValue,commission,coinStatus,
      p2p_active,botStatus,buyerFee,sellerFee,
      minimumPrice,maximumPrice,minimumQuantity,
      maximumQuantity,marketPrice,marketUp
    } = req.body;
    try {
        
      if(baseCurrency == "" || quoteCurrency == "") {
        return res.status(401).json({
          status: 401,
          message: "All * mark fields are mandatory",
          data: null
        })
      }

      // const CoinPairExists = await CoinPair.findOne({coin:coin});

      // if(CoinPairExists) {
      //   return res.status(401).json({
      //     status: 401,
      //     message: "Coin is already added in our record",
      //     data: null
      //   })
      // }
    
      const coin = await CoinPair.create({
        baseCurrency,baseCurrencyValue,quoteCurrency,
        quoteCurrencyValue,commission,coinStatus,
        p2p_active,botStatus,buyerFee,sellerFee,
        minimumPrice,maximumPrice,minimumQuantity,
        maximumQuantity,marketPrice,marketUp
      })
    
      if(!coin) {
        return res.status(401).json({
          status: 401,
          message: "Error while inserting or inserting coin pair data",
          data: null
        })
      }
                 
      return res.status(200).json({
        status: 201,
        message: "Coin Pair is added Successfully!!!",
        data:coin
      })

    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: 500,
        message: "Something went wrong with api2",
        data: error
      })
    }
  },
  coinList: async(req,res) => {

  const title = req.query.title || '';
  const ObjectId = mongoose.Types.ObjectId;

  try {

   const coinDetails = await CoinPair.find({});

   if(!coinDetails) {
     return res.status(402).json({
       status: 402,
       message: "Error while fetching coin pair list!!!",
       data: null,
     })
   }
 
    return res.status(201).json({
      status:201,
      message: "Coin Pair list is Successfully fetched",
      data: coinDetails,
    })

  } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: 500,
        message: "Error while fetching card list!!!",
        data: error
      })
    }
  },
  coinById: async(req,res) => {
      
  try {
    const coin_id = req.params.id;
    if(!coin_id) {
     return res.status(402).json({
      status: 402,
      message: "Coin Id is missing",
      data: null
    })
  }
  
  const details = await CoinPair.find({_id: coin_id});
  if(!details) {
    return res.status(402).json({
      status: 402,
      message: "Error while fetching coin details!!!",
      data: null
    })
  }
  
  return res.status(201).json({
    status:201,
    message: "Coin details is Successfully fetched",
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
  updateCoin: async(req,res) => {
    const {
      baseCurrency,baseCurrencyValue,quoteCurrency,
      quoteCurrencyValue,commission,coinStatus,
      p2p_active,botStatus,buyerFee,sellerFee,
      minimumPrice,maximumPrice,minimumQuantity,
      maximumQuantity,marketPrice,marketUp, coinpair_id
    } = req.body;

    try {
             
    if(baseCurrency == "" || coinpair_id == "") {
      return res.status(401).json({
       status: 401,
       message: "All red star mark * fields are mandatory!!!",
       data: null
      })
    }
    
    const UpdateData = await CoinPair.findByIdAndUpdate(
    {
     _id:coinpair_id
    },
    {
      baseCurrency,baseCurrencyValue,quoteCurrency,
      quoteCurrencyValue,commission,coinStatus,
      p2p_active,botStatus,buyerFee,sellerFee,
      minimumPrice,maximumPrice,minimumQuantity,
      maximumQuantity,marketPrice,marketUp
    },
    {
     new: true,
    })
      
    if(!UpdateData) {
      console.log(UpdateData);
      return  res.status(401).json({
        status:401,
        message: "Error while updating coin details!",
        data:null
      })
    }
      
  return res.status(201).json({
    status:201,
    message: "Coin details has been updated successfully"
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
  deleteCoin: async(req,res) => {
  try {
    
    const coin_id = req.params.id;
             
    if(coin_id == "") {
      return res.status(401).json({
        status: 401,
        message: "Coin Id is missing",
        data: null
      })
    }

    const deletedData = await CoinPair.deleteOne({_id: coin_id});

    if(!deletedData) {
      return  res.status(401).json({
        status:401,
        message: "Error while updating coin details!",
        data:null
      })
    }
      
    return res.status(201).json({
      status:201,
      message: "Coin data has been deleted successfully"
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
}

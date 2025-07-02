const { Revenue } = require('../models/revenue.model');

module.exports = {
  // fetch revenue list
  revenueList: async(req,res) => {

    try {

      const details = await Revenue.aggregate([
      {
        $match: {
          status: {$ne: ''}
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
          fee:1,
          fromCurrency:1,
          toCurrency:1,
          amount:1,
          info:1,
          trans_type:1,
          status:1,
          convertAmount:1,
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
      {$sort: {_id: -1}}
     ])
 
      if(!details) {
        return res.status(402).json({
          status: 402,
          message: "Error while fetching revenue list!!!",
          data: null
        })
      }

      var sumTotal = 0;
      for (const item of details) {
        sumTotal = sumTotal + item?.convertAmount;
      }
 
      return res.status(201).json({
        status:201,
        message: "Revenue list is Successfully fetched",
        data: details,
        total:sumTotal
     })
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: 500,
        message: "Error while fetching revenue list!!!",
        data: error
      })
    }
  },
  // This function is used for fetch revenue by user
  revenueByUser: async(req,res) => {

    const user_id = req.params.id;

    try {

      const details = await Revenue.find({
        status: {$ne: ''},
        user: user_id
      });

      if(!details) {
        return res.status(402).json({
          status: 402,
          message: "Error while fetching revenue list!!!",
          data: null
        });
      }

      var debitFeeTotal = 0;
      var depositTotal = 0;
      var debitTotal = 0;
      var earningTotal = 0;
      var investingTotal = 0;
      for (const item of details) {
        
        if(item?.usdRate == 0) {
          debitFeeTotal = parseFloat(debitFeeTotal) + parseFloat(item?.convertAmount);
        } else {
          debitFeeTotal = parseFloat(debitFeeTotal) + parseFloat(item?.fee);
        }

        if(item?.trans_type == "Add Money") {
          if(item?.usdRate == 0) {
            depositTotal = parseFloat(depositTotal) + parseFloat(item?.amount);
          } else {
            depositTotal = parseFloat(depositTotal) + (parseFloat(item?.amount)*parseFloat(item?.usdRate));
          }
        }

        if(item?.viewType == "debit") {
          if(item?.usdRate == 0) {
            debitTotal = parseFloat(debitTotal) + parseFloat(item?.amount);
          } else {
            debitTotal = parseFloat(debitTotal) + (parseFloat(item?.fee) + (parseFloat(item?.amount)*parseFloat(item?.usdRate)));
          }
        }

        if(item?.info == "Crypto buy") {
          if(item?.usdRate == 0) {
            investingTotal = parseFloat(investingTotal) + parseFloat(item?.amount);
          } else {
            investingTotal = parseFloat(investingTotal) + (parseFloat(item?.amount)*parseFloat(item?.usdRate));
          }
        }

        if(item?.info == "Crypto sell") {
          if(item?.usdRate == 0) {
            earningTotal = parseFloat(earningTotal) + parseFloat(item?.amount);
          } else {
            earningTotal = parseFloat(earningTotal) + (parseFloat(item?.amount)*parseFloat(item?.usdRate));
          }
        }
      }

      const data = {
        "debitTotal": debitTotal,
        "debitFeeTotal": debitFeeTotal,
        "depositTotal": depositTotal,
        "earningTotal": earningTotal,
        "investingTotal": investingTotal,
        "debitPer": (debitTotal / depositTotal) * 100,
        "investingPer": (investingTotal / depositTotal) * 100,
        "earningPer": (earningTotal / depositTotal) * 100
      }
 
      return res.status(201).json({
        status:201,
        message: "Revenue list is Successfully fetched",
        data:data
      });

    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: 500,
        message: "Error while fetching revenue list!!!",
        data: error
      });
    }
  }
}



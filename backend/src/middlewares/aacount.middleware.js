const { Account } = require("../models/account.model");

module.exports  = {
  verifyAccountWithUser: async(req,res,next) => {

    try {
      const result = await Account.find({
        user: req?.user?._id,
        _id: req?.body?.source_account
      });
    
      if(result.length == 0) {
        return res.status(402).json({
          status: 402,
          message: "Account does not match with user Account List",
          data: null
        });
      }

      next();

    } catch (error) {
      console.log("error verify account api", error);
      return res.status(401).json({
        status:401,
        message: "Account middleware error",
        data: null
      });
    }
  }
}
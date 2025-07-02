const jwt = require("jsonwebtoken");
const { User } = require("../models/user.model");

module.exports  = {
  verifyToken: async(req,res,next) => {
       
    try {
    
      const token = req.headers?.authorization.replace("Bearer ","");
    
      if(!token) {
        return res.status(401).json({
          status:401,
          message: "Please provide Auth token",
          data: null
        });
      }
 
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      req.userId = decoded.data.id;
      
      if(!decoded) {
        return res.status(401).json({
          status:401,
          message: "Invalid Access token",
          data: null
        });
      }
 
      const user = await User.findById({_id: decoded.data.id}).select("-password");
 
      if(!user) {
        return res.status(401).json({
          status:401,
          message: "Invalid Access token / Invalid User",
          data: null
        });
      }
 
      req.user = user;
      next();
 
    } catch (error) {
      return res.status(403).json({
        status:403,
        message: "Token has been expired / Missing Token",
        data: null
      });
    }
    
  },
  validateToken: async (req, res, next) => {
    try {
      const token = req.headers?.authorization?.replace("Bearer ", "");

      if (!token) {
        return next();
      }

      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      const user = await User.findById({ _id: decoded.data.id }).select("-password");

      if (user) {
        req.user = {
          ...(JSON.parse(JSON.stringify(user))),
          Name: user.name,
          Email: user.email
        };
      }
    } catch (err) {
      console.log('Error', err);
    }

    return next();
  }
}
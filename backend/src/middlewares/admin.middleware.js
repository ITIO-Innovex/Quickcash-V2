const jwt = require("jsonwebtoken");
const { Admin } = require("../models/Admin/admin.model");

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
         
      if(!decoded) {
        return res.status(401).json({
          status:401,
          message: "Invalid Access token",
          data: null
        });
      }
 
      const user = await Admin.findById({_id: decoded.data.id}).select("-password");
 
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
       console.log("error auth api", error);
       return res.status(401).json({
        status:401,
        message: "Token has been expired or missing",
        data: null
      });
    }
  },
  verifySecondaryToken: async(req,res,next) => {
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
      
      if(!decoded) {
        return res.status(401).json({
         status:401,
         message: "Invalid Access token",
         data: null
        });
      }

      const user = await Admin.findById({_id: decoded.data.id}).select("-password");

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
       console.log("error auth api", error);
       return res.status(403).json({
        status:403,
        message: "Token has been expired",
        data: null
       });
    }
  }
}
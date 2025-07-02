var ip = require('ip');
const { mongoose} = require("mongoose");
const { UserSession } = require('../models/usersession.model');

module.exports = {
  // This function is used to insert user session data by logged in user
  addSession: async(req,res) => {
    const {user,device,OS,status,isActiveNow} = req.body;
    try {
      if(user == "" || device == "" || OS == "") {
        return res.status(401).json({
         status: 401,
         message: "All fields are mandatory",
         data: null
        })
      }
    
      const users = await UserSession.create({
        user,device,OS,ipAddress:ip.address(),status,isActiveNow
      })
    
      if(!users) {
        return  res.status(401).json({
         status: 401,
         message: "Error while inserting or creating data",
         data: null
        })
      }
    
      const createdUserSession = await UserSession.findById({_id: users._id});
    
      if(!createdUserSession) {
        return res.status(401).json({
         status: 401,
         message: "Getting error while creating session data",
         data: null
        })
      }

      return res.status(201).json({
        status: 201,
        message: "Session Data",
        data: createdUserSession
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
  // This function is used for update session of loggedin user
  updateUserStatus: async(req,res) => {
    const {user,isActiveNow} = req.body;
    try {
      if(user == "") {
        return res.status(401).json({
          status: 401,
          message: "All fields are mandatory",
          data: null
        })
      }
      const ObjectId = mongoose.Types.ObjectId;
      const UpdateSession = await UserSession.findByIdAndUpdate(
      {
        _id:new ObjectId(user)
      },
      {
        isActiveNow
      },
      {
        new: true,
      })
  
      if(!UpdateSession) {
        console.log(UpdateSession);
        return res.status(401).json({
          status: 401,
          message: "Error while updating session data",
          data: null
        })
      }
               
      return res.status(200).json({
        status: 201,
        message: "User Session data has been saved !!!",
        data:UpdateSession
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
  // This function is used for getting session details
  getSessionById: async(req,res) => {
    try {
      const user_id = req.params.id;
      if(!user_id) {
        return res.status(401).json({
          status: 401,
          message: "User Id is missing",
          data: null
        })
      }

      const dataDetails = await UserSession.find({ user: user_id }).sort({createdAt: -1}).limit(5);

      if(!dataDetails) {
        return res.status(401).json({
          status: 401,
          message: "Error while fetching user session data",
          data: null
        })
      }

      return res.status(201).json({
        status: 201,
        message: "Success",
        data: dataDetails
      })

    } catch (error) {
      console.log(error)
      return res.status(500).json({
        status: 500,
        message: "Error while updating session data",
        data: null
      })
    }
  }
}

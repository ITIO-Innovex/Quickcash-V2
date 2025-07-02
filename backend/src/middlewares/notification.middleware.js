const socket = require("../server");
const { Notification } = require("../models/notification.model");

module.exports  = {
  addNotification: async(user,title,tags="",message="",notifyFrom,notifyType,attachment="",info) => {
    
    try {
       
      const notify = await Notification.create({
        user,
        title,
        tags,
        message,
        notifyFrom,
        notifyType,
        attachment
      });

      const notifyData = {
        "info": info,
        "user": user,
        "type": notifyType,
        "createdAt": new Date().toJSON()
      }
          
      if(!notify) {
        return false;
      } else {
        if(notifyFrom == "admin") {
          await socket.ioObject.emit('newNotification',notifyData);
        } else if(notifyFrom == "user") {
          await socket.ioObject.emit('adminNotification',notifyData);
        } else {
           await socket.ioObject.emit('adminNotification',notifyData);
           await socket.ioObject.emit('newNotification',notifyData);
        }
        return true;
      }

    } catch (error) {
      console.log("Error while inserting notification", error);
    }
  },
  getAdminNotifications: async(req,res,next) => {
    try {
      const result = await Notification.aggregate([
        {
          $match: {
            read: false,
            notifyFrom: {
              $in: ['admin', 'all']
            }
          }
        },
        {
          $lookup: {
            "from": "users",
            "localField":"user",
            "foreignField": "_id",
            "as": "userDetails"
          }
        },
        {
          $project: {
            _id:1,
            user:1,
            title:1,
            tags:1,
            attachment:1,
            message:1,
            notifyFrom:1,
            notifyType:1,
            read:1,
            createdAt:1,
            userDetails: {
            name: 1
          }
        }
      },
      {
        $sort: {_id: -1}
      },
      { 
        $limit : 10 
      }
    ]);
      
    if(!result) {
      return res.status(402).json({
        status: 402,
        message: "Error while fetching notification list!!!",
        data: null
      })
    }

    req.notify = result;
    next();
 
    return res.status(201).json({
      status:201,
      message: "Notification list is Successfully fetched",
      data: result
    });

    } catch (error) {
      console.log("error auth api", error);
      return res.status(401).json({
        status:401,
        message: "Notification middleware error",
        data: null
      })
    }
  },
  getUserUnreadNotifications: async(req,res,next) => {

    try {
      const result = await Notification.aggregate([
      {
        $match: 
        {
          'readBy': {'$nin': [req?.user?._id]},
          'notifyFrom': {'$in': ["admin","all"]}
        }
      },
      {
        $lookup: {
          "from": "users",
          "localField":"user",
          "foreignField": "_id",
          "as": "userDetails"
        }
      },
      {
        $project: {
          _id:1,
          user:1,
          title:1,
          tags:1,
          attachment:1,
          message:1,
          notifyFrom:1,
          notifyType:1,
          read:1,
          createdAt:1,
          readBy:1,
          userDetails: {
           name: 1
          }
        }
      },
      {
        $sort: {_id: -1}
      }
     ]);
      
      if(!result) {
        return res.status(402).json({
          status: 402,
          message: "Error while fetching notification list!!!",
          data: null
        });
      }

      var usersGroup = new Array();
      result?.map(item => {
        if(item?.notifyType == "user") {
          usersGroup.push(item?.user);
        }
      });

      req.notify = result;
      next();
 
      return res.status(201).json({
        status:201,
        message: "Notification list is Successfully fetched",
        data: result,
        usersGroup:usersGroup
      });

    } catch (error) {
      console.log("error auth api", error);
      return res.status(401).json({
        status:401,
        message: "Notification middleware error",
        data: null
      });
    }
  },
  getAdminUnreadNotifications: async(req,res,next) => {
    console.log("Ganesh",req?.user?._id);
    try {
      const result = await Notification.aggregate([
      {
        $match: 
        {
          'readBy': {'$nin': [req?.user?._id]},
          'notifyFrom': {'$in': ["user","all"]}
        }
      },
      {
        $lookup: {
          "from": "users",
          "localField":"user",
          "foreignField": "_id",
          "as": "userDetails"
        }
      },
      {
        $project: {
          _id:1,
          user:1,
          title:1,
          tags:1,
          attachment:1,
          message:1,
          notifyFrom:1,
          notifyType:1,
          read:1,
          createdAt:1,
          readBy:1,
          userDetails: {
           name: 1
          }
        }
      },
      {
        $sort: {_id: -1}
      }
     ]);
      
      if(!result) {
        return res.status(402).json({
          status: 402,
          message: "Error while fetching notification list!!!",
          data: null
        })
      }

      req.notify = result;
      next();
 
      return res.status(201).json({
        status:201,
        message: "Notification list is Successfully fetched",
        data: result
      });

    } catch (error) {
      console.log("error auth api", error);
      return res.status(401).json({
        status:401,
        message: "Notification middleware error",
        data: null
      });
    }
  },
  getAllAdminNotification: async(req,res,next) => {
    try {
      const result = await Notification.aggregate([
        {$match: { 'notifyFrom': {'$in': ["user","all"]}}},
        {
          $lookup: {
            "from": "users",
            "localField":"user",
            "foreignField": "_id",
            "as": "userDetails"
          }
        },
        {
          $project: {
            _id:1,
            user:1,
            title:1,
            tags:1,
            attachment:1,
            message:1,
            notifyFrom:1,
            notifyType:1,
            read:1,
            createdAt:1,
            userDetails: {
             name: 1
            }
          }
        },
        {
          $sort: {_id: -1}
        }
      ]);
      
      if(!result) {
        return res.status(402).json({
          status: 402,
          message: "Error while fetching notification list!!!",
          data: null
        })
      }

      req.notify = result;
      next();
 
      return res.status(201).json({
        status:201,
        message: "Notification list is Successfully fetched",
        data: result
      });

    } catch (error) {
      console.log("error auth api", error);
      return res.status(401).json({
        status:401,
        message: "Notification middleware error",
        data: null
      });
    }
  },
  getAllUserNotification: async(req,res,next) => {
    try {
      const result = await Notification.aggregate([
      {
        $match: { 
          "$or": [{
            "notifyFrom": {'$in': ["admin","all"]},
          }, 
          {
            'user': req?.user?._id
          }]
        }
      },
      {
        $lookup: {
          "from": "users",
          "localField":"user",
          "foreignField": "_id",
          "as": "userDetails"
        }
      },
      {
        $project: {
          _id:1,
          user:1,
          title:1,
          tags:1,
          attachment:1,
          message:1,
          notifyFrom:1,
          notifyType:1,
          read:1,
          createdAt:1,
          userDetails: {
           name: 1
          }
        }
      },
      {
        $sort: {_id: -1}
      }
    ]);
      
    if(!result) {
      return res.status(402).json({
        status: 402,
        message: "Error while fetching notification list!!!",
        data: null
      });
    }

    req.notifyto = result;
    next();
 
    return res.status(201).json({
      status:201,
      message: "Notification list is Successfully fetched",
      data: result
    });

    } catch (error) {
      console.log("error auth api", error);
      return res.status(401).json({
        status:401,
        message: "Notification middleware error",
        data: null
      });
    }
  }
}

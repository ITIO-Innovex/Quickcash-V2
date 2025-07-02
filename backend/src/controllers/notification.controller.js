const { mongoose} = require("mongoose");
const socket = require('../../src/server');
const { Notification } = require('../models/notification.model');

module.exports = {
  // This function is used for add notification data
  addNotification: async(req,res) => {
    const {user,message,notifyFrom,notifyType,title,tags,content} = req.body;
      try {
        if(user == "" || message == "") {
          return res.status(401).json({
            status: 401,
            message: "All fields are mandatory",
            data: null
          });
        }

        let Image1  = '';

        if(req.files.attachment) {
          Image1 = req.files.attachment[0].filename;
        }
    
        const notify = await Notification.create({
          user,
          title,
          tags,
          content,
          message,
          notifyFrom,
          notifyType,
          attachment:Image1
        });
    
        if(!notify) {
          return res.status(401).json({
            status: 401,
            message: "Error while inserting notification data",
            data: null
          });
        }

        const notifyData = {
          "info": `${title}`,
          "user": user,
          "type": notifyType,
          "createdAt": new Date().toJSON()
        }

        await socket.ioObject.emit('newNotification',notifyData);
                 
        return res.status(200).json({
          status: 201,
          message: "Notification data has been inserted into the records !!!",
          data:notify
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
  // This function is used for fetching notification list
  list: async(req,res) => {
      
    const user_id = req.params.id; 
    const ObjectId = mongoose.Types.ObjectId;

    try {
      if(!user_id) {
       return res.status(402).json({
        status: 402,
        message: "User Id is missing",
        data: null
      });
     }

     const listDetails = await Notification.find({
      "$or": [{
       "notifyFrom": "admin"
      }, 
      {
       "notifyFrom": "all"
      }]
     });

     if(!listDetails) {
      return res.status(402).json({
        status: 402,
        message: "Error while fetching notification list!!!",
        data: null,
      });
     }
 
     return res.status(201).json({
       status:201,
       message: "Notification list are fetched Successfully",
       data: listDetails,
     });

     } catch (error) {
        console.log(error);
        return res.status(500).json({
          status: 500,
          message: "Error while fetching notification list!!!",
          data: error
        });
     }
  },
  // This function is used for fetching details by their id
  detailsById: async(req,res) => {
      
    const noti_id = req.params.id; 
    const ObjectId = mongoose.Types.ObjectId;

    try {
      if(!noti_id) {
       return res.status(402).json({
        status: 402,
        message: "Notification Id is missing",
        data: null
      });
     }

     const details = await Notification.find({_id: new ObjectId(noti_id)});

     if(!details) {
      return res.status(402).json({
        status: 402,
        message: "Error while fetching notification list!!!",
        data: null,
      });
     }

     //global.io.emit("newNotification", details);
    
     return res.status(201).json({
       status:201,
       message: "Notification list are fetched Successfully",
       data: details,
     });

     } catch (error) {
        console.log(error);
        return res.status(500).json({
          status: 500,
          message: "Error while fetching notification list!!!",
          data: error
        });
     }
  },
  // This function is used for update data
  updateRead: async(req,res) => {
    const {user} = req.body;
    const ObjectId = mongoose.Types.ObjectId;
    try {

      if(user == "") {
        return res.status(401).json({
          status: 401,
          message: "User Id missing",
          data: null
        })
      }

      const notifyData = await Notification.find({
        "$or": [{
          "notifyFrom": {'$in': ["admin","all"]},
        }, 
        {
          "user": user
        }]
      });

      if(notifyData) {
        for (const element of notifyData) {
          if(element?.read == true) {
            if(!element?.readBy.includes(user)) {
              element?.readBy.push(new ObjectId(user));
              var updateRead = await Notification.findByIdAndUpdate({_id: element?._id},{readBy: element?.readBy},{new: true});
            }
          } else {
            var updateRead = await Notification.findByIdAndUpdate({_id: element?._id},{readBy: new ObjectId(user),read: true},{new: true});
          } 
        }
      }  
    
      if(!updateRead) {
        return res.status(401).json({
          status: 401,
          message: "Error while updating notification read data",
          data: null
        })
      }
                 
      return res.status(200).json({
        status: 201,
        message: "Notification message data has been updated as read !!!",
        data: updateRead
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
  // This function is used for fetching data (for admin)
  adminUpdateRead: async(req,res) => {
    const {user} = req.body;
    const ObjectId = mongoose.Types.ObjectId;
    try {

      if(user == "") {
        return res.status(401).json({
          status: 401,
          message: "User Id missing",
          data: null
        })
      }

      const notifyData = await Notification.find({
        "notifyFrom": {'$in': ["user","all"]}
      });

      if(notifyData) {
        for (const element of notifyData) {
          if(element?.read == true) {
            if(!element?.readBy.includes(user)) {
              element?.readBy.push(new ObjectId(user));
              var updateRead = await Notification.findByIdAndUpdate({_id: element?._id},{readBy: element?.readBy},{new: true});
            }
          } else {
            var updateRead = await Notification.findByIdAndUpdate({_id: element?._id},{readBy: new ObjectId(user),read: true},{new: true});
          } 
        }
      }  
    
      if(!updateRead) {
        return res.status(401).json({
          status: 401,
          message: "Error while updating notification read data",
          data: null
        });
      }
                 
      return res.status(200).json({
        status: 201,
        message: "Notification message data has been updated as read !!!",
        data: updateRead
      });

    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: 500,
        message: "Something went wrong with api",
        data: error
      });
    }
  }
}

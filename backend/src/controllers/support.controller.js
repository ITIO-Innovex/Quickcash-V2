const socket = require('../server');
const { mongoose } = require("mongoose");
const { Support }  = require('../models/support.model');
const { ChatHistory } = require("../models/chathistory.model");
const { addNotification } = require("../middlewares/notification.middleware");

module.exports = {
  // This function is used to add/insert support into the table
  addSupport: async(req,res) => {
    const {user,subject,message,status} = req.body;
    try {
    
      if(user == "" || subject == "" || message == "") {
        return res.status(401).json({
          status: 401,
          message: "All fields are mandatory",
          data: null
        })
      }
    
      const support = await Support.create({
        user,
        ticketId: req?.ticketid,
        subject,
        message:message,
        status: "open"
      })
    
      if(!support) {
        return res.status(401).json({
          status: 401,
          message: "Error while inserting or inserting support data",
          data: null
        })
      }

      await addNotification(user,title=`Ticket has been raised by the ${req?.user?.name}`,tags=`Ticket, ${req?.user?.name}`,"Ticket has been raised",notifyFrom="user",notifyType="ticket",attachment="",info=`${req?.user?.name} Ticket has been raised for ${subject}`);

      const replyMessage = await ChatHistory.create({
        user,
        support:support?._id,
        from: "User",
        to: "Admin",
        message
      })
    
      if(!replyMessage) {
        return res.status(401).json({
          status: 401,
          message: "Error while inserting or inserting chat data",
          data: null
        })
      }
                 
      return res.status(200).json({
        status: 201,
        message: "support ticket has been added !!!",
        data:support
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
  // This function is used to fetch list data
  list: async(req,res) => {
      
   const user_id = req.params.id; 
   const ObjectId = mongoose.Types.ObjectId;
   const page = req.query.page || 1;
   const size = req.query.size || 10;

   try {
   
    if(!user_id) {
      return res.status(402).json({
        status: 402,
        message: "User Id is missing",
        data: null
      })
    }

    const options = {
      page: page,
      limit: size,
      collation: {
        locale: 'en',
      },
    };

    var condition = {user: new ObjectId(user_id)};

    Support.paginate(condition, options)
    .then((data) => {
      return res.status(201).json({
        totalItems: data.totalDocs,
        data: data.docs,
        totalPages: data.totalPages,
        currentPage: data.page,
        nextPage: data.hasNextPage,
        prevPage: data.hasPrevPage
      });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials.",
      });
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: 500,
      message: "Error while fetching support ticket list!!!",
      data: error
    })
   }
  },
  // This function is used to fetch data by their id
  listbyId: async(req,res) => {
      
    const ticket_id = req.params.id; 
    const ObjectId = mongoose.Types.ObjectId;
 
    try {
    
     if(!ticket_id) {
       return res.status(402).json({
         status: 402,
         message: "Ticket Id is missing",
         data: null
       })
     }

    const listDetails = await Support.aggregate([
      {
        $match: {
          _id: new ObjectId(ticket_id)
        }
      },
      {
        $lookup: {
          "from": "chathistories",
          "localField": "_id",
          "foreignField": "support",
          "as": "chat"
        }
      },
      {
        $project: {
          _id:1,
          user:1,
          ticketId:1,
          subject:1,
          message:1,
          status:1,
          createdAt:1,
          chat: {
          _id: 1,
          from: 1,
          to: 1,
          user: 1,      
          message: 1,
          attachment:1,
          createdAt:1
          }
        }
      },
      {$sort: {_id: -1}}
     ])
 
     if(!listDetails) {
       return res.status(402).json({
         status: 402,
         message: "Error while fetching support ticket list!!!",
         data: null,
       })
     }
  
     return res.status(201).json({
       status:201,
       message: "list are fetched Successfully",
       data: listDetails,
     })
 
   } catch (error) {
     console.log(error);
     return res.status(500).json({
       status: 500,
       message: "Error while fetching support ticket list!!!",
       data: error
     })
    }
  },
  // This function is used to update support status
  updateSupportStatus: async(req,res) => {
    const {support_id,status} = req.body;
    try {
      if(support_id == "" || status == "") {
        return res.status(401).json({
          status: 401,
          message: "Support Id or status is missing",
          data: null
        })
      }

      const UpdateData = await Support.findByIdAndUpdate(
      {
        _id:support_id
      },
      {
        status
      },
      {
        new: true,
      })
    
      if(!UpdateData) {
        return  res.status(401).json({
         status:401,
         message: "Error while updating Support Request!",
         data:null
        })
      }

      await addNotification(user,title=`Ticket status has been updated by the admin`,tags=`Ticket, Status Update`,"Ticket Status has been updated",notifyFrom="admin",notifyType="ticket",attachment="",info=`Ticket status has been updated by the admin`);
    
      return res.status(201).json({
        status:201,
        data:UpdateData,
        message: "Support request has been updated successfully"
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
  // This function is used to update request status
  updateRequestStatus: async(req,res) => {
    const {status,comment,user} = req.body;
    try {

      const support_id = req.params.id;

      if(!support_id) {
        return res.status(401).json({
          status: 401,
          message: "Support Id is missing",
          data: null
        });
      }

      if(status == "" || comment == "") {
        return res.status(401).json({
          status: 401,
          message: "status/comment is required",
          data: null
        });
      }

      const UpdateData = await Support.findByIdAndUpdate(
      {
       _id:support_id
      },
      {
       status,
       comment: comment ? comment : ''
      },
      {
       new: true,
      })
    
      if(!UpdateData) {
        return  res.status(401).json({
         status:401,
         message: "Error while updating Support Ticket Request!",
         data:null
        });
      }

      const replyMessage = await ChatHistory.create({
        user,
        support:support_id,
        from: "Admin",
        to: "User",
        message:comment
      });

      console.log("user",replyMessage);
    
      return res.status(201).json({
        status:201,
        data:UpdateData,
        message: "Support Ticket data has been updated successfully"
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
  // This function is used to update History
  updateHistory: async(req,res) => {
    try {
      const id = req.params.id;
      if(!id) {
        return res.status(401).json({
          status: 401,
          message: "Support id is missing",
          data: null
        });
      }
      const details = await Support.find({_id:id});

      if(!details) {
        return  res.status(401).json({
         status:401,
         message: "Error while fetching history!",
         data:null
        });
      }
  
      return res.status(201).json({
        status:201,
        data:details[0].history,
        message: "History has been fetched successfully"
      });

    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status:500,
        data:details,
        message: "error"
      });
    }
  },
  // This function is used to reply ticket
  replyTicket: async(req,res) => {
    const {user,from,to,message,support} = req.body;
    try {
    
      if(user == "" || message == "") {
        return res.status(401).json({
          status: 401,
          message: "All fields are mandatory",
          data: null
        });
      }

      let Image1  = '';

      if(req.files?.attachment) {
        Image1 = req.files.attachment[0].filename;
      }
    
      const replyMessage = await ChatHistory.create({
        user,
        support,
        from,
        to,
        message,
        attachment: Image1
      });
    
      if(!replyMessage) {
        return res.status(401).json({
          status: 401,
          message: "Error while inserting or inserting support data",
          data: null
        });
      }

      if(from == "User") {
        console.log("Socket Message shoot for user ", support);
        await socket.ioObject.emit('notifyToAdminNewMsg',support);
      } else {
        console.log("Socket Message shoot for admin ", support);
        await socket.ioObject.emit('notifyToUserNewMsg',support);
      }
           
      return res.status(200).json({
        status: 201,
        message: "Success",
        data:replyMessage
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

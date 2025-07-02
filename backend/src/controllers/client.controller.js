const { mongoose} = require("mongoose");
const { Client } = require("../models/client.model");
const { Invoice } = require("../models/invoice.model");

module.exports = {
  // Add Client controller function
  addClient: async(req,res) => {
    const {user,firstName,lastName, mobile, email,postalCode,notes,address,country,state,city} = req.body;
    try {
      if(firstName == "" || user == "" || mobile == "" || email == "" || postalCode == "" || address == "" || country == "" || state == "" || city == "") {
        return res.status(401).json({
          status: 401,
           message: "All Star marked fields are mandatory",
          data: null
        })
      }

      let Image1  = '';

      if(req?.files?.profilePhoto) {
        Image1 = req.files.profilePhoto[0].filename;
      }

      const emailExists = await Client.findOne({ email: email });

      if(emailExists) {
        return res.status(401).json({
          status: 401,
          message: "Email Address is already exists",
          data: null
        })
      }
    
      const client = await Client.create({
        user,
        firstName,
        lastName, 
        mobile, 
        email,
        postalCode,
        notes,
        address,
        country,
        state,
        city,
        profilePhoto: Image1
      })
    
      if(!client) {
        return res.status(401).json({
          status: 401,
          message: "Error while inserting client data",
          data: null
        })
      }
                 
      return res.status(200).json({
        status: 201,
        message: "Client has been added Successfully!!!",
        data:client
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
  // get all client list according to userwise
  clientList: async(req,res) => {

    const user_id = req.params.id; 
    const title = req.query.title || '';
    const ObjectId = mongoose.Types.ObjectId;

    try {
            
      if(!user_id) {
        return res.status(402).json({
          status: 402,
          message: "User Id is missing",
          data: null
        })
      }

      const clientDetails = await Client.aggregate([
      {
        $match: {
          user: new ObjectId(user_id),
          firstName: {'$regex': title, '$options' : 'i'}
        }
        },
        {
          $lookup: {
            "from": "invoices",
            "localField": "_id",
            "foreignField": "userid",
            "as": "invoiceDetails"
          }
        },
        {
          $project: {
            _id:1,
            user:1,
            firstName:1,
            lastName:1,
            email:1,
            mobile:1,
            address:1,
            country:1,
            city:1,
            state:1,
            postalCode:1,
            notes:1,
            profilePhoto:1,
            status:1,
            createdAt:1,
            invoiceDetails: {
              _id:1
            }
          },
        }
      ]);

      if(!clientDetails) {
        return res.status(402).json({
          status: 402,
          message: "Error while fetching client list!!!",
          data: null,
        });
      }
 
      return res.status(201).json({
        status:201,
        message: "Client list is Successfully fetched",
        data: clientDetails,
      });

    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: 500,
        message: "Error while fetching client list!!!",
        data: error
      });
    }
  },
  // get client details by their id
  clientById: async(req,res) => {
      
    try {
    
      const client_id = req.params.id;
  
      if(!client_id) {
        return res.status(402).json({
          status: 402,
          message: "Client Id is missing",
          data: null
        });
      }
  
      const details = await Client.findOne({_id: client_id});
  
      if(!details) {
        console.log(details);
        return res.status(402).json({
          status: 402,
          message: "Error while fetching client details!!!",
          data: null
        });
      }
  
      return res.status(201).json({
        status:201,
        message: "Client details is Successfully fetched",
        data: details
      });

    } catch (error) {
       console.log("error", error);
       return res.status(500).json({
        status:500,
        message: "Something went wrong with api",
        data: error
      });
    }
  },
  getInvoiceNumbertoClient: async(req,res) => {
      
    try {
    
      const client_id = req.params.id;
  
      if(!client_id) {
        return res.status(402).json({
          status: 402,
          message: "Client Id is missing",
          data: null
        })
      }
  
      const clientInvoice = await Invoice.find({ userid: client_id });
  
      if(!clientInvoice) {
        return res.status(402).json({
          status: 402,
          message: "Error while fetching client details!!!",
          data: null
        })
      }
  
      return res.status(201).json({
        status:201,
        message: "Client details is Successfully fetched",
        data: clientInvoice?.length
      })

    } catch (error) {
       return res.status(500).json({
        status:500,
        message: "Something went wrong with api",
        data: error
      })
    }
  },
  // update client details
  updateClient: async(req,res) => {
   try {
              
    const {user,firstName,lastName, mobile, email,postalCode,notes,address,country,state,city} = req.body;

    const client_id = req?.params?.id;
              
    if(firstName == "" || user == "" || mobile == "" || email == "" || postalCode == "" || address == "" || country == "" || state == "" || city == "") {
      return res.status(401).json({
        status: 401,
        message: "All red star mark * fields are mandatory!!!",
        data: null
      })
    }

    let Image1  = '';
    if(req?.files?.profilePhoto) {
      Image1 = req.files.profilePhoto[0].filename;
    }

    if(Image1) {
      await Client.findByIdAndUpdate(
      {
        _id:client_id
      },
      {
        profilePhoto:Image1
      },
      {
        new: true,
      });
    }
    
    const UpdateData = await Client.findByIdAndUpdate(
    {
      _id:client_id
    },
    {
      user,
      firstName,
      lastName, 
      mobile, 
      email,
      postalCode,
      notes,
      address,
      country,
      state,
      city
    },
    {
      new: true,
    })
      
    if(!UpdateData) {
      console.log(UpdateData);
      return res.status(401).json({
        status:401,
        message: "Error while updating client details!",
        data:null
      })
    }
      
    return res.status(201).json({
      status:201,
      message: "User Client details has been updated successfully"
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
  // Delete client data permanently
  deleteClient: async(req,res) => {
      
    try {
            
     const client_id = req.params.id;
           
    if(client_id == "") {
      return res.status(401).json({
        status: 401,
        message: "Client Id is missing",
        data: null
      })
    }

    // Check if client has been included in any invoice
    // if yes , then don't allow to delete
    // if no, then allow to delete

    const clientUsedInAnyInvoice = await Invoice.findOne({ userid: client_id });

    if(clientUsedInAnyInvoice) {
      return res.status(401).json({
        status:401,
        message: "Client wouldn't allow to delete as it is used in invoice",
        data:null
      })
    }

    const deletedData = await Client.deleteOne({_id: client_id});

    if(!deletedData) {
      return res.status(401).json({
        status:401,
        message: "Error while deleting client details!",
        data:null
      })
    }
      
    return res.status(201).json({
      status:201,
      message: "Client Data has been deleted successfully"
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


// This function will calculate the number of Invoices related to Client

async function getInvoiceNumbertoClient(userid) {
  const clientInvoice = await Invoice.find({ userid: userid });
  if(!clientInvoice) {
    return 0;
  } else {
    return clientInvoice?.length;
  }
}

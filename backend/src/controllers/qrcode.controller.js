const { mongoose} = require("mongoose");
const { QrCode } = require('../models/qrcode.model');

module.exports = {
  // This function is used for add payment qr data
  addQrCode: async(req,res) => {
  const {
    user,
    title,
    isDefault
  } = req.body;

  try {
            
    if(user == "" || title == "") {
      return res.status(401).json({
        status: 401,
        message: "All fields are mandatory",
        data: null
      })
    }

    let Image1  = '';

    if(req?.files?.qrCodeImage) {
      Image1 = req.files.qrCodeImage[0].filename;
    }

    if(isDefault == "yes") {
      await QrCode.updateMany(
      {},
      {
        IsDefault: "no"
      },
      {
        new: true,
      })
    }
   
    const userCompan = await QrCode.create({
      user,
      title,
      image: Image1,
      IsDefault:isDefault,
    })
    
    if(!userCompan) {
      return res.status(401).json({
        status: 401,
        message: "Error while inserting or inserting card data",
        data: null
      })
    }
                 
    return res.status(200).json({
      status: 201,
      message: "QrCode details is added Successfully!!!",
      data:userCompan
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
  // This function is used for fetching qr code list
  qrCodeList: async(req,res) => {

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

    const qrCodeDetails = await QrCode.find({user: new ObjectId(user_id)})

    if(!qrCodeDetails) {
      return res.status(402).json({
        status: 402,
        message: "Error while fetching qr Code list!!!",
        data: null,
      })
    }
 
    return res.status(201).json({
      status:201,
      message: "Qr Code list is Successfully fetched",
      data: qrCodeDetails,
    })

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: 500,
      message: "Error while fetching qr code list!!!",
      data: error
    })
  }
  },
  // This function is used for fetching data by their id
  qrCodeById: async(req,res) => {
      
  try {
         
    const user_id = req.params.id;
  
    if(!user_id) {
      return res.status(402).json({
        status: 402,
        message: "User Id is missing",
        data: null
      })
    }
  
    const details = await QrCode.findOne({_id: user_id});
  
    if(!details) {
      return res.status(402).json({
        status: 402,
        message: "Error while fetching qr Code details!!!",
        data: null
      })
    }
  
    return res.status(201).json({
      status:201,
      message: "Payment Qr Code details is Successfully fetched",
      data: details
    })
  } catch (error) {
    return res.status(500).json({
      status:500,
      message: "Something went wrong with api",
      data: error
    })
  }
  },
  // This function is used for update qr code data
  updateQrCode: async(req,res) => {
  try {
            
    const {
      user,
      title,
      isDefault
    } = req.body;
       
    const company_id =  req.params.id;

    let Image1  = '';

    if(req?.files?.qrCodeImage) {
      Image1 = req.files.qrCodeImage[0].filename;
    }
              
    if(user == "" || title == "") {
      return res.status(401).json({
        status: 401,
        message: "All fields are mandatory",
        data: null
      });
    }

    if(Image1) {
      await QrCode.findByIdAndUpdate(
      {
        _id:company_id
      },
      {
        image:Image1
      },
      {
        new: true,
      })
    }

    if(isDefault == "yes") {
      await QrCode.updateMany(
      {},
      {
        IsDefault: "no"
      },
      {
        new: true,
      })
    }

    const UpdateData = await QrCode.findByIdAndUpdate(
    {
      _id:company_id
    },
    {
      user,
      title,
      IsDefault:isDefault
    },
    {
      new: true,
    })
      
    if(!UpdateData) {
      console.log(UpdateData);
      return  res.status(401).json({
        status:401,
        message: "Error while updating qr Code details!",
        data:null
      })
    }
      
    return res.status(201).json({
      status:201,
      data:UpdateData,
      message: "Payment QR Code details has been updated successfully"
    })
  } catch (error) {
    console.log("Error", error);
    return res.status(401).json({
      status:401,
      message: error,
      data:null
    })    
  }
  },
  // This function is used for detete qr code data by their id
  deleteQrCode: async(req,res) => {
  try {
              
    const qrCode_id = req.params.id;
            
    if(qrCode_id == "") {
      return res.status(401).json({
        status: 401,
        message: "Qr Code Id is missing",
        data: null
      })
    }

    const deletedData = await QrCode.deleteOne({_id: qrCode_id});

    if(!deletedData) {
      return  res.status(401).json({
        status:401,
        message: "Error while updating qr Code details!",
        data:null
      })
    }
        
    return res.status(201).json({
      status:201,
      message: "QR Code data has been deleted successfully"
    })
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
const {BsUser} = require( '../models/bsUser.model');
const BsKyc = require('../models/bsKyc.model');
const {sendMail} = require('../middlewares/mail.middleware');
const { mongoose} = require("mongoose");
const multer = require('multer');
const path = require('path');

// Storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/kyc');
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG and PDF allowed.'), false);
  }
};
const upload = multer({ storage, fileFilter });



// New: Get business registration progress for the current user
const getBusinessRegistrationProgress = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(400).json({ message: 'User Id not found, Token is missing' });
    }
    const bsUser = await BsUser.findOne({ userId });
    if (!bsUser) {
      return res.status(200).json({
        currentStep: 0,
        isCompleted: false,
        formData: {},
        message: 'No business registration started yet.'
      });
    }

    // Determine progress based on which fields are filled
    let currentStep = 0;
    let isCompleted = false;
    const formData = {};

    // Step 0: Personal Info
    if (bsUser.name && bsUser.email && bsUser.country) {
      formData.fullName = bsUser.name;
      formData.email = bsUser.email;
      formData.country = bsUser.country;
      currentStep = 1;
    }
    // Step 1: Email Verification
    if (bsUser.isEmailVerified) {
      currentStep = 2;
    }
    // Step 2: Business Details
    if (bsUser.businessDetails && bsUser.businessDetails.businessName) {
      formData.businessName = bsUser.businessDetails.businessName;
      formData.businessType = bsUser.businessDetails.businessType;
      formData.companyRegistrationNumber = bsUser.businessDetails.registrationNumber;
      formData.industryActivity = bsUser.businessDetails.industry;
      formData.countryOfIncorporation = bsUser.businessDetails.incorporationCountry;
      formData.website = bsUser.businessDetails.website;
      currentStep = 3;
    }
    // Step 3: Business Address
    if (bsUser.address && bsUser.address.streetAddress1) {
      formData.streetAddress = bsUser.address.streetAddress1;
      formData.city = bsUser.address.city;
      formData.state = bsUser.address.state;
      formData.zipCode = bsUser.address.postalCode;
      formData.addressCountry = bsUser.address.country;
      currentStep = 4;
    }
    // Step 4: Identity Verification (KYC docs)
    if (bsUser.kycDocuments && bsUser.kycDocuments.length > 0) {
      // Just mark as completed, you can expand this as needed
      formData.documentType = bsUser.kycDocuments[0].docType;
      formData.document = bsUser.kycDocuments[0].fileName;
      currentStep = 5;
    }
    // Step 5: Setup Complete (bank info)
    if (bsUser.isSetupComplete) {
      isCompleted = true;
      currentStep = 6;
    }

    res.status(200).json({
      currentStep,
      isCompleted,
      formData
    });
  } catch (err) {
    console.error('Error fetching business registration progress:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = {
createUser: async (req, res) => {
    try {
      const { name, email, country } = req.body;
  
      if (!name || !email || !country) {
        return res.status(400).json({ message: 'All fields are required' });
      }
  
      // Check if a business account already exists for this user
      const existingUser = await BsUser.findOne({ userId: req.userId });
  
      if (existingUser) {
        return res.status(409).json({
          message: 'You cannot have more than one business account',
          error: true,
        });
      }
      console.log('🧹 Cleaning expired OTPs...');
      const cleanResult = await BsUser.updateMany(
      { otpExpiry: { $lte: new Date() } },
      { $unset: { otp: "", otpExpiry: "" } }
    );
      const otp = Math.floor(100000 + Math.random()*900000).toString();
      const otpExpiry = new Date(Date.now()+10*60*1000); 

    // console.log('🔐 Generated OTP:', otp);
    // console.log('⏳ OTP Expiry Time:', otpExpiry.toISOString());
      // If not exists, create a new business user
      const bsUser = new BsUser({
        userId: req.userId,
        name,
        email,
        country,
        otp,
        otpExpiry,
      });
      await bsUser.save();

      const otpEmailBody = `
       <div style="font-family: Arial, sans-serif; color: #333;">
       <h2>Hello ${name}</h2>
       <p>Thankyou For Registering With US !</p>
       <p><strong>Your OTP is:</strong> <span style="font-size: 18px; color:#2c3e50;">${otp}</span></p>
       <p>This OTP is valid for 15 minutes</p>
        <p>Regards,<br>Quick Cash Team</p> ;`

       const emailSent = await sendMail(email, 'your OTP Code - Quick Cash ', otpEmailBody);
       console.log('Email Sent');

       if(!emailSent){
        return res.status(500).json({ message:'failed to send the OTP '})
       }

       res.status(201).json({
        message: 'Business user saved successfully , OTP sent to mail',
        bsUser,
      });
  
    } catch (error) {
      console.error('Create BS User Error:', error.message);
      res.status(500).json({
        message: 'Server error',
        error: error.message,
      });
    }
},  
verifyOtp: async (req,res) => {
  try{
    const {otp} = req.body;
    const userId = req.userId;

    if(!otp){
      return res.status(400).json({message: 'OTP is required'});
    }

    const user  = await BsUser.findOne({userId});

    if(!user){
      return res.status(404).json({message:'Business user not found'});
    }

    if (!user.otp || !user.otpExpiry || user.otpExpiry < new Date()) {
      return res.status(410).json({message: 'Otp expired . Please request a new one.'});
    }

    if(user.otp != otp){
      return res.status(401).json({message: 'Invalid OTP . Please try again'});
    }

    user.isEmailVerified = true;
    user.emailVerifiedAt = new Date();
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    return res.status(200).json({message:'OTP verfied successfully'});

  }catch (err) {
  console.error('OTP Verification Error:', err.message); 
  res.status(500).json({
    message: 'Server error during OTP verification',
    error: err.message, 
  });
}
},
checkBusinessUserExists: async (req, res) => {
  try {
    const { emailVerified } = req.body;

    // Check if email is verified
    if (!emailVerified) {
      return res.status(400).json({ message: 'Email not verified', verified: false });
    }

    // Find the user by their userId
    const existingUser = await BsUser.findOne({ userId: req.userId });

    if (existingUser) {
      // Update the isEmailVerified field if the user exists
      existingUser.isEmailVerified = true;
      await existingUser.save();

      return res.status(200).json({
        message: 'Business user already exists and email is verified',
        exists: true,
        data: existingUser,
      });
    } else {
      return res.status(200).json({
        message: 'No business user found',
        exists: false,
      });
    }
  } catch (error) {
    console.error('Check BS User Error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
},
addBusinessDetails : async (req, res) => {
  try {
    const { businessName, businessType, registrationNumber, industry, incorporationCountry, website } = req.body;

    const bsUser = await BsUser.findOne({ userId: req.userId });

    if (!bsUser) {
      return res.status(404).json({ message: 'Business user not found' });
    }

    // Update businessDetails in the BsUser document
    bsUser.businessDetails = {
      businessName,
      businessType,
      registrationNumber: registrationNumber || '', 
      industry,
      incorporationCountry,
      website: website || '', 
    };

    // Save the updated BsUser document
    await bsUser.save();

    return res.status(200).json({
      message: 'Business details updated successfully',
      data: bsUser,
    });
  } catch (error) {
    console.error('Error updating business details:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
},
addBusinessAddress : async (req, res) => {
  try {
    const { streetAddress1, city,state, postalCode, businessCountry } = req.body;

    const bsUser = await BsUser.findOne({ userId: req.userId });

    if (!bsUser) {
      return res.status(404).json({ message: 'Business user not found' });
    }

    // Update address field in the document
    bsUser.address = {
      streetAddress1,
      city,
      state,
      postalCode,
      country: businessCountry,
    };

    await bsUser.save();

    return res.status(200).json({
      message: 'Business address updated successfully',
      data: bsUser.address,
    });
  } catch (error) {
    console.error('Error updating business address:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
},
addRepresentativeInfo : async (req, res) => {
  try {
    const { representativeName, dob, nationality, role, phone } = req.body;

    const bsUser = await BsUser.findOne({ userId: req.userId });

    if (!bsUser) {
      return res.status(404).json({ message: 'Business user not found' });
    }

    bsUser.representative = {
      fullName: representativeName,
      dob,
      nationality,
      role,
      phone,
    };

    await bsUser.save();

    return res.status(200).json({
      message: 'Representative info updated successfully',
      data: bsUser.representative,
    });
  } catch (error) {
    console.error('Error updating representative info:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
},
addBankInfo : async (req, res) => {
  try {
    const { bankName, accountNumber, swiftBic, currency } = req.body;

    const bsUser = await BsUser.findOne({ userId: req.userId });

    if (!bsUser) {
      return res.status(404).json({ message: 'Business user not found' });
    }

    // Step 1: Update bank info
    bsUser.bank = {
      bankName,
      accountNumber,
      swiftBic,
      currency,
    };
    bsUser.isSetupComplete = true;

    await bsUser.save();

    // Step 2: Check if KYC entry exists
    const existingKyc = await BsKyc.findOne({ userId: req.userId });
    console.log(' Existing KYC:', existingKyc ? 'Found' : 'Not Found');

    // Step 3: Create if not exists
    if (!existingKyc) {
      const kycEntry = new BsKyc({
        userId: req.userId,
        name:bsUser.name,
        email:bsUser.email,
        kycDocuments: bsUser.kycDocuments,
        businessDetails: bsUser.businessDetails,
        address: bsUser.address,
        representative: bsUser.representative,
        status: 'pending',
        bank: bsUser.bank,
      });

      await kycEntry.save();
    }

    return res.status(200).json({
      message: 'Bank details updated successfully',
      bankInfo: bsUser.bank,
    });
  } catch (error) {
    console.error(' Error updating bank info & creating KYC:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
},
getBusinessUser : async (req, res) => {
  try {
    const userId = req.userId; 

    const businessUser = await BsUser.findOne({ userId });

    if (!businessUser) {
      return res.status(404).json({
        message: 'Business account not found for this user',
      });
    }

    res.status(200).json({
      message: 'Business account fetched successfully',
      businessUser,
    });
  } catch (error) {
    console.error('Get Business User Error:', error.message);
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
},
listBusinessKyc: async (req, res) => {
  try {
    const users = await BsUser.find({}).sort({ createdAt: -1 });
    res.status(200).json({ data: users });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
},
uploadKycDocument: async (req, res) => {

  try {
    const userId = req.userId;

    const file = req.file;
// console.log(req.file, "file")
    if (!file) return res.status(400).json({ error: 'No file uploaded' });

    const updatedUser = await BsUser.findOneAndUpdate(
      { userId: userId }, 
      {
        $push: {
          kycDocuments: {
            fileName: file.filename,
            path: file.path,
            docType: req.body.docType || 'id',
          }
        }
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json({ message: 'Document uploaded successfully', user: updatedUser });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Something went wrong during upload' });
  }
},
getBusinessProfile : async (req, res) => {
  try{
      const userId  = req.userId;
      if(!userId){
        return res.status(400).json({message: 'User Id not found , Token is missing'});
      }
      const bsKyc = await BsKyc.findOne({userId});
      
      if(!bsKyc){
        return res.status(404).json({message: 'No business account found for this user'});
      }

      const {
      name,
      email,
      status,
      businessDetails,
      address,
      representative,
      bank,
    } = bsKyc;

    return res.status(200).json({
      name,
      email,
      status,
      businessDetails,
      address,
      representative,
      bank,
    })
  } catch(err){
    console.err('Error fetching business user profile :' , err);
    return res.status(500).json({message: 'Server error'});
  }
},
upload,
  getBusinessRegistrationProgress,
};
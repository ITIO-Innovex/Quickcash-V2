const { mongoose, Schema } = require('mongoose');

const bsUserSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },

  // Step 1 - Personal Info
  name: { type: String, trim: true },
  email: { type: String, lowercase: true, trim: true },
  country: { type: String },
   otp: String,
  otpExpiry: Date,

  // Step 2 - Email Verified
  isEmailVerified: { type: Boolean, default: false },
  emailVerifiedAt: { type: Date },

  businessDetails: {
    businessName: { type: String },
    businessType: { type: String },
    registrationNumber: { type: String },
    industry: { type: String }, 
    incorporationCountry: { type: String },
    website: { type: String },
  },

  // Step 4 - Business Address
  address: {
    streetAddress1: String,
    city: String,
    state: String,
    postalCode: String,
    country: String,
  },

  // Step 5 - Representative
  representative: {
    fullName: String,
    dob: Date,
    nationality: String,
    role: String,
    phone: String,
  },

  // Step 6 - KYC
  kycStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending',
  },

  kycDocuments: [
    {
      fileName: String,
      path: String, 
      uploadedAt: { type: Date, default: Date.now },
      docType: { type: String, enum: ['passport', 'id', 'license'], default: 'id' },
    }
  ],  
  // Step 7 - Bank Info
  bank: {
    bankName:String,
    accountNumber: String,
    swiftBic:String,
    currency:String,
  },

  // Status
  isSetupComplete: { type: Boolean, default: false },
},
{
  timestamps: true,
});

const BsUser = mongoose.model('BsUser', bsUserSchema);
module.exports = { BsUser };

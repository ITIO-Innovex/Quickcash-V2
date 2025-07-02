const mongoose = require('mongoose');

const bsKycSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, trim: true },
  email: { type: String, lowercase: true, trim: true },
  kycDocuments: [
    {
      fileName: String,
      path: String,
      uploadedAt: { type: Date, default: Date.now },
      docType: {
        type: String,
        enum: ['passport', 'id', 'license'],
        default: 'id',
      },
    },
  ],

  businessDetails: {
    businessName: String,
    businessType: String,
    registrationNumber: String,
    industry: String,
    incorporationCountry: String,
    website: String,
  },

  address: {
    streetAddress1: String,
    city: String,
    state: String,
    postalCode: String,
    country: String,
  },

  representative: {
    fullName: String,
    dob: Date,
    nationality: String,
    role: String,
    phone: String,
  },

  bank: {
    bankName:String,
    accountNumber: String,
    swiftBic:String,
    currency:String,
  },
  
  status: {
    type: String,
    enum: ['pending', 'completed', 'declined'],
    default: 'pending',
  },
  
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('BsKyc', bsKycSchema);

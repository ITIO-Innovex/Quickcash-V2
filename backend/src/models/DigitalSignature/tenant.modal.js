const mongoose = require('mongoose');

const tenantSchema = new mongoose.Schema({
  UserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  ContactNumber: {
    type: String,
  },
  TenantName: {
    type: String,
    required: true,
  },
  EmailAddress: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  IsActive: {
    type: Boolean,
    default: true,
  },
  CreatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  PinCode: {
    type: String,
  },
  Country: {
    type: String,
  },
  State: {
    type: String,
  },
  City: {
    type: String,
  },
  Address: {
    type: String,
  }
}, {
  timestamps: true 
});

const Tenant = mongoose.model('Tenant', tenantSchema);

module.exports = Tenant;

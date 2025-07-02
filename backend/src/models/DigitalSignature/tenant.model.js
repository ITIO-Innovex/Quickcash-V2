const mongoose = require('mongoose');

const tenantSchema = new mongoose.Schema({
  tenantName: {
    type: String,
    required: true
  },
  emailAddress: {
    type: String,
    required: true
  },
  contactNumber: {
    type: String
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  fileAdapters: [{
    type: String
  }],
  pfxFile: {
    type: String
  }
}, {
  timestamps: true
});

// Check if the model exists before creating a new one
const Tenant = mongoose.models.Tenant || mongoose.model('Tenant', tenantSchema);

module.exports = Tenant; 
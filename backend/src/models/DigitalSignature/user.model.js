const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String
  },
  company: {
    type: String
  },
  role: {
    type: String,
    required: true
  },
  password: {
    type: String
  },
  pincode: {
    type: String
  },
  country: {
    type: String
  },
  state: {
    type: String
  },
  city: {
    type: String
  },
  address: {
    type: String
  },
  jobTitle: {
    type: String
  },
  timezone: {
    type: String
  },
  isContactEntry: {
    type: Boolean,
    default: false
  },
  isDisabled: {
    type: Boolean,
    default: false
  },
  userRole: {
    type: String
  },
  documentCount: {
    type: Number,
    default: 0
  },
  emailCount: {
    type: Number,
    default: 0
  },
  tourStatus: [{
    loginTour: {
      type: Boolean,
      default: true
    }
  }],
  teamIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  }],
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Check if the model exists before creating a new one
const User = mongoose.models.User || mongoose.model('User', userSchema);

module.exports = User;

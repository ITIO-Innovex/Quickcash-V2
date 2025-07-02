const mongoose = require('mongoose');

const driveSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['folder', 'file'],
    required: true
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Drive',
    default: null
  },
  fileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'File',
    default: null
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant'
  },
  isStarred: {
    type: Boolean,
    default: false
  },
  isTrashed: {
    type: Boolean,
    default: false
  },
  sharedWith: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    permission: {
      type: String,
      enum: ['view', 'edit'],
      default: 'view'
    }
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
driveSchema.index({ createdBy: 1, parentId: 1 });
driveSchema.index({ createdBy: 1, isTrashed: 1 });
driveSchema.index({ 'sharedWith.user': 1 });

// Check if the model exists before creating a new one
const Drive = mongoose.models.Drive || mongoose.model('Drive', driveSchema);

module.exports = Drive; 
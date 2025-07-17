const mongoose = require('mongoose');

const KycMethodSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ['manual', 'sumsub'],
    },
    isDefault: {
      type: Boolean,
      required: true,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: null, 
    },
  },
  {
    timestamps: true, 
  }
);

module.exports = mongoose.model('KycMethod', KycMethodSchema);

const { mongoose, Schema } = require("mongoose");

const transferMethodSchema = new mongoose.Schema({
  methodId: {
    type: String,
    required: true,
    unique: true,
    enum: ['sepa', 'swift', 'ach']
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  fee: {
    type: Number,
    required: true,
    default: 0
  },
  time: {
    type: String,
    required: true
  },
  region: {
    type: String,
    required: true
  },
  currency: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  formFields: {
    type: Schema.Types.Mixed,
    required: true
  },
  validationRules: {
    type: Schema.Types.Mixed,
    required: true
  },
  supportedCountries: {
    type: [String],
    default: []
  }
}, {
  timestamps: true
});

const TransferMethod = mongoose.model("TransferMethod", transferMethodSchema);
module.exports = { TransferMethod }; 
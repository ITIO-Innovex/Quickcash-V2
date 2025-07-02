const { mongoose , Schema } = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

// This is the blueprint of Fee Structure table schema

const feeStructureSchema = new mongoose.Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User" // This is pointed to User table foreign id field is user
  },
  type: {
    type: Schema.Types.ObjectId,
    ref: "FeeType"
  },
  commissionType: {
    type: String,
    default: 'percentage'
  },
  value: {
    type: Number,
    default: 0
  },
  minimumValue: {
    type: Number,
    default: 0
  }
},
{
  timestamps: true
});

feeStructureSchema.plugin(mongoosePaginate);
const FeeStructure = mongoose.model("FeeStructure", feeStructureSchema);
module.exports = { FeeStructure };
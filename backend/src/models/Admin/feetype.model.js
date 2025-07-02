const { mongoose } = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

const feeTypeSchema = new mongoose.Schema({
  description: {
    type: String,
    required: false,
    default: ''
  },
  title: {
    type: String,
    required: false,
    default: ''
  },
  slug: {
    type: String,
    required: false,
    default: ''
  },
  status: {
    type: String,
    default: ''
  }
},
{
  timestamps: true
});

feeTypeSchema.plugin(mongoosePaginate);
const FeeType = mongoose.model("FeeType", feeTypeSchema);
module.exports = { FeeType };
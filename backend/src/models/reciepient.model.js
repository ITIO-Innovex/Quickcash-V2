const { mongoose,Schema} = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

const receipientSchema = new mongoose.Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  name: {
    type: String,
    default: ''
  },
  email: { 
    type: String,
    default: ''
  },
  rtype: { 
    type: String,
    default: ''
  },
  mobile: {
    type: String,
    default: ''
  },
  address: {
    type: String,
    default: ''
  },
  iban: {
    type: String,
    default: ''
  },
  bic_code: {
    type: String,
    default: ''
  },
  country: {
    type: String,
    default: ''
  },
  currency: {
    type: String,
    default: ''
  },
  amount: {
    type: Number,
    default:0.00
  },
  bankName: {
    type: String,
    default: ''
  },
  status: {
    type: Boolean,
    default: false
  }
},
{
  timestamps: true
});

receipientSchema.plugin(mongoosePaginate);
const Receipient = mongoose.model("Receipient", receipientSchema);
module.exports = { Receipient };
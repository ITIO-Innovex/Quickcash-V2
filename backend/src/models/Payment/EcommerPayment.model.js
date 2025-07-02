const { mongoose,Schema} = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

const eCommerceSchema = new mongoose.Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  invoice: {
    type: Schema.Types.ObjectId,
    ref: "EcommercePayment"
  },
  orderStatus: {
    type: String,
    required: false,
    default: null
  },
  reference: {
    type: String,
    required: false,
    default: null
  },
  transID: {
    type: String,
    required: false,
    default: null
  },
  response: {
    type: String,
    required: false,
    default: null
  },
  tdate: {
    type: String,
    required: false,
    default: null
  },
  billAmt: {
    type: Number,
    required: false,
    default: null
  },
  currency: {
    type: String,
    required: false,
    default: null
  },
  descriptor: {
    type: String,
    required: false,
    default: null
  },
  status: {
    type: String,
    required: false,
    default: null
  }
},
{
  timestamps: true
});

eCommerceSchema.plugin(mongoosePaginate);
const EcommercePayment = mongoose.model("EcommercePayment", eCommerceSchema);
module.exports = { EcommercePayment };
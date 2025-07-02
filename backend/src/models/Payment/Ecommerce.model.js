const { mongoose,Schema} = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

const eCommerceInvoiceSchema = new mongoose.Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  userType: {
    type: String,
    required: false,
    default: null
  },
  title: {
    type: String,
    required: false,
    default: null
  },
  url: {
    type: String,
    required: false
  },
  reference: {
    type: String,
    required: false,
    default: null
  },
  amount: {
    type: Number,
    required: false,
    default: 0
  },
  amounttext: {
    type: String,
    required: false
  },
  dueDate: {
    type: String,
    required: false,
    default: null
  },
  comment: {
    type: String,
    required: false,
    default: null
  },
  currency: {
    type: String,
    required: false,
    default: null
  },
  status: {
    type: String,
    required: false,
    default: null
  },
  createdBy: {
    type: String,
    required:false,
    default: null
  }
},
{
  timestamps: true
});

eCommerceInvoiceSchema.plugin(mongoosePaginate);
const EcommerceInvoice = mongoose.model("EcommerceInvoice", eCommerceInvoiceSchema);
module.exports = { EcommerceInvoice };
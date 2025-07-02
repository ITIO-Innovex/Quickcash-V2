const { mongoose, Schema } = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

const invoiceOrersSchema = new mongoose.Schema({
  paidAmount: {
    type: Number,
    default:0
  },
  remainingAmount: {
    type: Number,
    default:0
  },
  paymentType: {
    type: String,
    default:''
  },
  paymentMode: {
    type: String,
    default:''
  },
  paymentNotes: {
    type: String,
    default:''
  },
  transactionId: {
    type: String,
    default:''
  },
  orderId: {
    type: String,
    default: ''
  },
  paymentId: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    default: 'pending'
  },
  currency: {
    type: String,
    default: ''
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  invoice: {
    type: Schema.Types.ObjectId,
    ref: "Invoice"
  },
  extraInfoPayment: {
    type: Array,
    default: []
  }
},
{
  timestamps: true
});

invoiceOrersSchema.plugin(mongoosePaginate);
const InvoiceOrders = mongoose.model("InvoiceOrders", invoiceOrersSchema);
module.exports = { InvoiceOrders };
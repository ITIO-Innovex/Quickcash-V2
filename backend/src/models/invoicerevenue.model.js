const { mongoose,Schema} = require("mongoose");

const mongoosePaginate = require('mongoose-paginate-v2');

const InvoiceRevenueSchema = new mongoose.Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  invoice: {
    type: Schema.Types.ObjectId,
    ref: "Invoice"
  },
  fromCurrency : {
    type: String,
    required:false,
    default:null,
  },
  toCurrency: {
    type: String,
    required:false,
    default:null,
  },
  amount: {
    type: Number,
    default: 0
  },
  convertAmount: {
    type: Number,
    default: 0
  },
  dateadded: {
    type: String,
    default: ''
  },
  info: {
    type: String,
    required:false,
    default:'',
  },
  trans_type: {
    type: String,
    default: ''
  }
},
{
  timestamps: true
});

InvoiceRevenueSchema.plugin(mongoosePaginate);
const InvoiceRevenue = mongoose.model("InvoiceRevenue", InvoiceRevenueSchema);
module.exports = { InvoiceRevenue };
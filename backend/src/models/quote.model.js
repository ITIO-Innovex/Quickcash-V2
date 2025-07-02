const { mongoose,Schema} = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

const quoteSchema = new mongoose.Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  account: {
    type: Schema.Types.ObjectId,
    ref: "Account"
  },
  userid: {
    type: String,
    default: ''
  },
  reference: {
    type: String,
    default: ''
  },
  url: {
    type: String,
    default: ''
  },
  othersInfo: {
    type:Array,
    required:false,
    default: []
  },
  quote_number: {
    type: String,
    required:false,
    default:''
  },
  invoice_date: {
    type: String,
    required:false,
    default:''
  },
  due_date: {
    type: String,
    required:false,
    default:''
  },
  status: {
    type: String,
    required:false,
    default:'created',
  },
  invoice_country: {
    type: String,
    required:false,
    default: ''
  },
  currency: {
    type: String,
    required: false,
    default: ''
  },
  productsInfo: {
    type:Array,
    required:false,
    default: []
  },
  discount: {
    type: Number,
    required: false,
    default: ''
  },
  discount_type: {
    type: String,
    required: false,
    default: ''
  },
  tax: {
    type: Array,
    required: false,
    default: []
  },
  subTotal: {
    type: Number,
    required: false,
    default: 0.00
  },
  sub_discount: {
    type: Number,
    required: false,
    default: 0.00
  },
  sub_tax: {
    type: Number,
    required: false,
    default: 0.00
  },
  total: {
    type: Number,
    required: false,
    default: 0
  },
  note: {
    type: String,
    required:false,
    default: ''
  },
  terms: {
    type: String,
    required:false,
    default: ''
  },
  currency_text: {
    type: String,
    required: false,
    default: ''
  }
},
{
  timestamps: true
});

quoteSchema.plugin(mongoosePaginate);
const Quote = mongoose.model("Quote", quoteSchema);
module.exports = { Quote

 };
const { mongoose,Schema} = require("mongoose");

const mongoosePaginate = require('mongoose-paginate-v2');

const transactionSchema = new mongoose.Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  source_account: {
    type: Schema.Types.ObjectId,
    ref: "Account"
  },
  transfer_account: {
   type: Schema.Types.ObjectId,
   ref: "Account"
  },
  trx: {
    type: String,
    required:false,
    default: ''
  },
  receipient: {
    type: String,
    required:false,
    default:null
  },
  info: {
    type: String,
    required:false,
    default:null,
  },
  trans_type: {
    type: String,
    tim:true,
    required: true,
    default: null
  },
  tr_type: {
    type: String,
    required: false,
    default: null
  },
  extraType: {
    type: String,
    required:false,
    default: null
  },
  iban: {
    type: String,
    required: false,
    default: null
  },
  bic: {
    type: String,
    required: false,
    default: null
  },
  country: {
    type: String,
    required:false,
    default:null,
  },
  from_currency: {
    type: String,
    required: false,
    default: null
  },
  to_currency: {
    type: String,
    required: false,
    default: null
  },
  amount: {
    type: Number,
    required:false,
    default:0.00
  },
  postBalance: {
    type: Number,
    required:false,
    default:0.00
  },
  amountText: {
    type:String,
    required:false,
    default:null
  },
  status: {
    type: String,
    required: false,
    default: null
  },
  addedBy: {
    type: String,
    required: false,
    default: null
  },
  fee: {
    type: Number,
    required: false,
    default: 0
  },
  conversionAmount: {
    type: Number,
    required:false,
    default: 0
  },
  conversionAmountText: {
    type:String,
    required:false,
    default:null
  },
  upi_email: {
    type: String,
    default: ''
  },
  upi_contact: {
    type: String,
    default: ''
  },
  upi_id: {
    type: String,
    default: ''
  },
  comment: {
    type: String,
    default: ''
  },
  ttNumber: {
    type: String,
    default: Math.floor(Math.random() * 999999999999)
  },
  dashboardAmount: {
    type: Number,
    required:false,
    default: 0
  }
},
{
  timestamps: true
});

transactionSchema.plugin(mongoosePaginate);
const Transaction = mongoose.model("Transaction", transactionSchema);
module.exports = { Transaction };
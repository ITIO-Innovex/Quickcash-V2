const { mongoose,Schema} = require("mongoose");

const mongoosePaginate = require('mongoose-paginate-v2');

const revenueSchema = new mongoose.Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  fee: {
    type: Number,
    default: 0
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
  info: {
    type: String,
    required:false,
    default:'',
  },
  trans_type: {
    type: String,
    default: ''
  },
  viewType: {
    type: String,
    default: ''
  },
  usdRate: {
    type: Number,
    default:0
  },
  status: {
    type: String,
    default: ''
  }
},
{
  timestamps: true
});

revenueSchema.plugin(mongoosePaginate);
const Revenue = mongoose.model("Revenue", revenueSchema);
module.exports = { Revenue };
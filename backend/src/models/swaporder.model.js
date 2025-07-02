const { mongoose,Schema} = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

const swapOrdersSchema = new mongoose.Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  account: {
    type: Schema.Types.ObjectId,
    ref: "Account"
  },
  coinPair: {
    type: String,
    required: false,
    default: ''
  },
  side: {
    type: String,
    default: null
  },
  amount: {
    type: Number,
    default: ''
  },
  noOfCoins: {
    type: String,
    default: ''
  },
  currency: {
    type: String,
    required: false,
    default:'',
  },
  orderType: {
    type: String,
    required: false,
    default:'',
  },
  marketPrice: {
    type: Number,
    default: ''
  },
  limitPrice: {
    type: Number,
    default: ''
  },
  stopPrice: {
    type: Number,
    default: ''
  },
  status: {
    type: String,
    required: false,
    default: ''
  }
},
{
  timestamps: true
});

swapOrdersSchema.plugin(mongoosePaginate);
const SwapOrder = mongoose.model("SwapOrder", swapOrdersSchema);
module.exports = { SwapOrder };
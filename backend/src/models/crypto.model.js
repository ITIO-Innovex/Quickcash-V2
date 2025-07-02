const { mongoose,Schema} = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

const cryptoSchema = new mongoose.Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  account: {
    type: Schema.Types.ObjectId,
    ref: "Account"
  },
  fee: { 
    type: Number,
    default: 0
  },
  coin: {
    type: String,
    required: false,
    default: ''
  },
  walletAddress: {
    type: String,
    default: null
  },
  paymentType: {
    type: String,
    default: ''
  },
  currencyType: {
    type: String,
    default: ''
  },
  amount: {
    type: Number,
    required: false,
    default: 0,
  },
  noOfCoins: {
    type: String,
    required: false,
    default: 0.0000000,
  },
  side: {
    type: String,
    required: false,
    default:'',
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

cryptoSchema.plugin(mongoosePaginate);
const Crypto = mongoose.model("Crypto", cryptoSchema);
module.exports = { Crypto };
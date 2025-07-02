const { mongoose,Schema} = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

const walletSchema = new mongoose.Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  account: {
    type: Schema.Types.ObjectId,
    ref: "Account"
  },
  currency: {
    type: String,
    required: false,
    default: ''
  },
  transactionType: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    required: false,
    default:'',
  },
  transactionFee: {
    type: String,
    required: false,
    default:'',
  },
  transactionAmount: {
    type: String,
    required: false,
    default:0,
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

walletSchema.plugin(mongoosePaginate);

const Wallet = mongoose.model("Wallet", walletSchema);
module.exports = { Wallet };
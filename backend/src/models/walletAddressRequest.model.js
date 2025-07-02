const { mongoose,Schema} = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

const walletAddressRequestSchema = new mongoose.Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  coin: {
    type: String,
    required: false,
    default: ''
  },
  noOfCoins: {
    type: String,
    default: 0.0000000,
  },
  walletAddress: {
    type: String,
    default: ''
  },
  comment: {
    type: String,
    required: false,
    default: ''
  },
  history: {
    type: Array,
    required: false,
    default: []
  },
  status: {
    type: String,
    required: false,
    default: 'pending'
  }
},
{
  timestamps: true
});


walletAddressRequestSchema.plugin(mongoosePaginate);

const WalletAddressRequest = mongoose.model("WalletAddressRequest", walletAddressRequestSchema);
module.exports = { WalletAddressRequest };
const { mongoose } = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

const coinpairSchema = new mongoose.Schema({
  baseCurrency: {
    type: String,
    required: false,
    default: ''
  },
  baseCurrencyValue: {
    type: Number,
    default: ''
  },
  quoteCurrency: {
    type: String,
    default: ''
  },
  quoteCurrencyValue: {
    type: Number,
    default: 0
  },
  commission: {
    type: Number,
    default: 0
  },
  coinStatus: {
    type: String,
    default: ''
  },
  p2p_active: {
    type: String,
    default: ''
  },
  botStatus: {
    type: String,
    default: ''
  },
  buyerFee: {
    type: Number,
    default: 0.00
  },
  sellerFee: {
    type: Number,
    default: 0.00
  },
  minimumPrice: {
    type: Number,
    default: 0.00
  },
  maximumPrice: {
    type: Number,
    default: 0.00
  },
  minimumQuantity: {
    type: Number,
    default: 0
  },
  maximumQuantity: {
    type: Number,
    default: 0
  },
  marketPrice: {
    type: Number,
    default: 0.00
  },
  marketUp: {
    type: Number,
    default: 0.00
  }
},
{
  timestamps: true
});

coinpairSchema.plugin(mongoosePaginate);
const CoinPair = mongoose.model("CoinPair", coinpairSchema);
module.exports = { CoinPair };
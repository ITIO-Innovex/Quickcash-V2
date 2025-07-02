const { mongoose,Schema} = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

const currencyListSchema = new mongoose.Schema({
  CurrencyCode: {
    type: String,
    default: ''
  },
  CurrencyName: {
    type: String,
    default: ''
  }
},
{
  timestamps: true
});

currencyListSchema.plugin(mongoosePaginate);
const CurrencyList = mongoose.model("CurrencyList", currencyListSchema);
module.exports = { CurrencyList };
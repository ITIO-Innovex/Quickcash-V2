const { mongoose } = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

const currencySchema = new mongoose.Schema({
  base_code: {
    type: String,
    tim:true,
    required: true,
    index:true,
    unique:true
  },
  currencyName: {
    type: String,
    default: ''
  },
  time_last_update_unix: {
    type: String,
    required: false,
    default:null,
  },
  time_last_update_words: {
    type: String,
    required: false,
    default:null,
  },
  result: {
    type: String,
    required: false,
    default:null,
  },
  conversion_rates: {
    type: Array,
    required:false,
    default:null,
  },
  status: {
    type: Boolean,
    required: false,
    default: true
  },
  defaultc: {
    type: Boolean,
    default: false
  }
},
{
  timestamps: true
});

currencySchema.plugin(mongoosePaginate);
const Currency = mongoose.model("Currency", currencySchema);
module.exports = { Currency };
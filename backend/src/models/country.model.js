const { mongoose,Schema} = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

const countrySchema = new mongoose.Schema({
  id: {
    type: Number,
    default: ''
  },
  name: {
    type: String,
    default: ''
  },
  iso3: {
    type: String,
    default: ''
  },
  iso2: {
    type: String,
    default: ''
  },
  numeric_code: {
    type: String,
    default: ''
  },
  phone_code: {
    type: String,
    default: ''
  },
  capital: {
    type: String,
    default: ''
  },
  currency: {
    type: String,
    default: ''
  },
  currency_name: {
    type: String,
    default: ''
  },
  currency_symbol: {
    type: String,
    default: ''
  },
  tld: {
    type: String,
    default: ''
  },
  native: {
    type: String,
    default: ''
  },
  region: {
    type: String,
    default: ''
  },
  region_id: {
    type: String,
    default: ''
  },
  subregion: {
    type: String,
    default: ''
  },
  subregion_id: {
    type: String,
    default: ''
  },
  nationality: {
    type: String,
    default: ''
  },
  timezones: {
    type: String,
    default: ''
  },
  latitude: {
    type: String,
    default: ''
  },
  longitude: {
    type: String,
    default: ''
  },
  emoji: {
    type: String,
    default: ''
  },
  emojiU: {
    type: String,
    default: ''
  }
},
{
  timestamps: true
});


countrySchema.plugin(mongoosePaginate);

const Countries = mongoose.model("Countries", countrySchema);
module.exports = { Countries };
const { mongoose } = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

const citiesSchema = new mongoose.Schema({
  id: {
    type: Number,
    default: ''
  },
  name: {
    type: String,
    default: ''
  },
  state_id: {
    type: String,
    default: ''
  },
  state_code: {
    type: String,
    default: ''
  },
  state_name: {
    type: String,
    default: ''
  },
  country_id: {
    type: String,
    default: ''
  },
  country_code: {
    type: String,
    default: ''
  },
  country_name: {
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
  wikiDataId: {
    type: String,
    default: ''
  }
},
{
  timestamps: true
});


citiesSchema.plugin(mongoosePaginate);

const Cities = mongoose.model("cities", citiesSchema);
module.exports = { Cities };
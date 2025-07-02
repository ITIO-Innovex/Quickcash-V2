const { mongoose,Schema} = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

const statesSchema = new mongoose.Schema({
  id: {
    type: Number,
    default: ''
  },
  name: {
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
  state_code: {
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
  }
},
{
  timestamps: true
});


statesSchema.plugin(mongoosePaginate);

const States = mongoose.model("States", statesSchema);
module.exports = { States };
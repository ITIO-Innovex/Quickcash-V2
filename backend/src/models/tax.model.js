const { mongoose,Schema} = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

const taxSchema = new mongoose.Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  Name: {
    type: String,
    required: false,
    default: null
  },
  taxvalue: {
    type: Number,
    default: null
  },
  IsDefault: {
    type: String,
    required: false,
    default:null,
  },
},
{
  timestamps: true
});

taxSchema.plugin(mongoosePaginate);
const Tax = mongoose.model("Tax", taxSchema);
module.exports = { Tax };
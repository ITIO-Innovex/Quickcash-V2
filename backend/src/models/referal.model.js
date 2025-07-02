const { mongoose,Schema} = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

const referalSchema = new mongoose.Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  type: {
    type: String,
    required: false,
    default: ''
  },
  referral_code: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    required: false,
    default: 'active'
  }
},
{
  timestamps: true
});


referalSchema.plugin(mongoosePaginate);

const Referal = mongoose.model("Referal", referalSchema);
module.exports = { Referal };
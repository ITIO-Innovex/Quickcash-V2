const { mongoose,Schema} = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

const referalUserSchema = new mongoose.Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  referedByUser: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  referral_code: {
    type: String,
    default: ''
  }
},
{
  timestamps: true
});


referalUserSchema.plugin(mongoosePaginate);

const ReferalUser = mongoose.model("ReferalUser", referalUserSchema);
module.exports = { ReferalUser };
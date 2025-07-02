const { mongoose,Schema} = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

const userSessionSchema = new mongoose.Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  device: {
    type: String,
    required: false,
  },
  OS: {
    type: String,
    required: false,
  },
  ipAddress: {
    type: String,
    required: false,
  },
  status: {
    type: String,
    required: false,
  },
  isActiveNow: {
    type: Boolean,
    required: false,
    default: 0
  },
},
{
  timestamps: true
});

userSessionSchema.plugin(mongoosePaginate);
const UserSession = mongoose.model("UserSession", userSessionSchema);
module.exports = { UserSession };
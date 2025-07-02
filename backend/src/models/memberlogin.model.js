const { mongoose,Schema} = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

const memberloginSchema = new mongoose.Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  member: {
    type: Schema.Types.ObjectId,
    ref: "Member"
  },
  ip_address: {
    type:String,
    required:false,
    default: null
  },
  source: {
    type: String,
    required:false,
    default:null
  },
  country: {
    type: String,
    required:false,
    default:null
  },
  region: {
    type: String,
    required:false,
    default:null
  },
  allinfo: {
    type: String,
    required:false,
    default:null
  }
},
{
  timestamps: true
});

memberloginSchema.plugin(mongoosePaginate);
const Memberlogin = mongoose.model("Memberlogin", memberloginSchema);
module.exports = { Memberlogin };
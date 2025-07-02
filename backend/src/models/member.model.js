const { mongoose,Schema} = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

const memberSchema = new mongoose.Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  username: {
    type: String,
    required: false,
    default: null
  },
  mobile: {
    type: Number,
    unique: false,
    default: null
  },
  permissionlist: {
    type: Array,
    required:false,
    default:[]
  },
  email: {
    type: String,
    trim:true,
    required: false,
    unique:false,
    default: null
  },
  date_from: {
    type: Date,
    required: false,
    default:null,
  },
  date_to: {
    type: Date,
    required: false,
    default:null,
  },
  comment: {
    type: String,
    required:false,
    default:null
  },
  otp: {
    type: String,
    required:false,
    default: null
  },
  address: {
    type: String,
    required:false,
    default:"xyz apartment"
  },
  city: {
    type: String,
    required:false,
    default:"test"
  },
  state: {
    type: String,
    required: false,
    default:"test"
  },
  country: {
    type: String,
    required: false,
    default:"IN"
  }
},
{
  timestamps: true
});

memberSchema.plugin(mongoosePaginate);
const Member = mongoose.model("Member", memberSchema);
module.exports = { Member };
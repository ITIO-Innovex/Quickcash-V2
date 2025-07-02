const { mongoose,Schema } = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

const clientSchema = new mongoose.Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  firstName: {
    type: String,
    required: true,
    default: ''
  },
  lastName: {
    type: String,
    required: true,
    default: ''
  },
  mobile: {
    type: Number,
    unique: false,
    default: ''
  },
  email: {
    type: String,
    trim:true,
    required: false,
    unique:false,
    default: ''
  },
  postalCode: {
    type: String,
    required: false,
    default:'',
  },
  notes: {
    type: String,
    required:false,
    default:''
  },
  address: {
    type: String,
    required:false,
    default:""
  },
  city: {
    type: String,
    required:false,
    default:""
  },
  state: {
    type: String,
    required: false,
    default:""
  },
  country: {
    type: String,
    required: false,
    default:""
  },
  profilePhoto: {
    type: String,
    required:false,
    default: ''
  },
  status: {
    type: Boolean,
    default: true
  }
},
{
  timestamps: true
});

clientSchema.plugin(mongoosePaginate);
const Client = mongoose.model("Client", clientSchema);
module.exports = { Client };
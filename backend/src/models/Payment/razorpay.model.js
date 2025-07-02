const { mongoose,Schema} = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

const razorPaySchema = new mongoose.Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  name: {
    type: String,
    required: false,
    default: null
  },
  mobile: {
    type: Number,
    unique: false,
    default: null
  },
  email: {
    type: String,
    tim:true,
    required: false,
    unique:false,
    default: null
  },
  iban: {
    type: String,
    required: false,
    default:null,
  },
  bic_code: {
    type: String,
    required: false,
    default:null,
  },
  country: {
    type: String,
    required:false,
    default:null,
  },
  currency: {
    type: String,
    required: false,
    default: null
  },
  amount: {
    type: Number,
    required:false,
    default:0
  },
  comment: {
    type: String,
    required:false,
    default:null
  },
  defaultAccount: {
    type: Boolean,
    required:false,
    default: false
  },
  status: {
    type: Boolean,
    required: false,
    default: null
  }
},
{
  timestamps: true
});

razorPaySchema.plugin(mongoosePaginate);
const Account = mongoose.model("Account", razorPaySchema);
module.exports = { Account };
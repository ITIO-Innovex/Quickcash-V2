const { mongoose,Schema} = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

const accountSchema = new mongoose.Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  name: {
    type: String,
    required: false,
    default: ''
  },
  mobile: {
    type: Number,
    unique: false,
    default: ''
  },
  bankName: {
    type: String,
    required: false,
    default: '',
  },
  email: {
    type: String,
    required: false,
    default: ''
  },
  iban: {
    type: String,
    required: false,
    default:null,
  },
  ibanText: {
    type: String,
    default: ''
  },
  bic_code: {
    type: Number,
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
  address: {
    type: String,
    required:false,
    default:''
  },
  defaultAccount: {
    type: Boolean,
    required:false,
    default: false
  },
  status: {
    type: Boolean,
    default: true
  }
},
{
  timestamps: true
});

accountSchema.plugin(mongoosePaginate);
const Account = mongoose.model("Account", accountSchema);
module.exports = { Account };
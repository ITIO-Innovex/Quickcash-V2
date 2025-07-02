const { mongoose,Schema} = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

const userCompanySchema = new mongoose.Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  businessType: {
    type: String,
    required: false,
    default: null
  },
  businessRegistrationNumber: {
    type: String,
    unique: true,
    default: null
  },
  taxIdentificationNumber: {
    type: String,
    required: false,
    default:null,
  },
  tradingAddress: {
    type: String,
    required: false,
    default:null,
  },
  country: {
    type: String,
    required: false,
    default:null,
  },
  businessRegistrationDocument: {
    type: String,
    required: false,
    default:'',
  },
  proofoftradingAddress: {
    type: String,
    required: false,
    default:'',
  },
  taxID: {
    type: String,
    required: false,
    default: ''
  }
},
{
  timestamps: true
});

userCompanySchema.plugin(mongoosePaginate);
const UserCompany = mongoose.model("UserCompany", userCompanySchema);
module.exports = { UserCompany };
const { mongoose,Schema} = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

const kycSchema = new mongoose.Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  email: {
    type: String,
    required: false,
    default: ''
  },
  primaryPhoneNumber: {
    type: Number,
    default: 0
  },
  secondaryPhoneNumber: {
    type: Number,
    required: false,
    default:0,
  },
  documentType: {
    type: String,
    required: false,
    default:'',
  },
  documentNumber: {
    type: String,
    required: false,
    default: '',
  },
  documentPhotoFront: {
    type: String,
    required: false,
    default: '',
  },
  documentPhotoBack: {
    type: String,
    required: false,
    default: '',
  },
  addressDocumentType: {
    type: String,
    required: false,
    default: '',
  },
  addressProofPhoto: {
    type: String,
    required: false,
    default: '',
  },
  history: {
    type: Array,
    required: false,
    default: []
  },
  comment: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    required: false,
    default: ''
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  phonePVerified: {
    type: Boolean,
    default: false
  },
  phoneSVerified: {
    type: Boolean,
    default: false
  }
},
{
  timestamps: true
});

kycSchema.plugin(mongoosePaginate);

const Kyc = mongoose.model("Kyc", kycSchema);
module.exports = { Kyc };
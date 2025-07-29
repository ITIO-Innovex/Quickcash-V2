const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { mongoose,Schema} = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    tim:true,
    required: true,
    index:true
  },
  email: {
    type: String,
    required: true,
    trim:true,
    unique:true,
    index:true
  },
  password: {
    type: String,
    required: false,
    trim: true
  },
  mobile: {
    type: Number,
    required: false,
    default: null
  },
  address: {
    type: String,
    required:false,
    default:null
  },
  gender: {
    type: String,
    required:false,
    default:''
  },
  dob: {
    type: String,
    required: false,
    default: null, // or remove default altogether
  },
  city: {
    type: String,
    required:false,
    default:null
  },
  state: {
    type: String,
    required: false,
    default:null
  },
  country: {
    type: String,
    required: false,
    default:null
  },
  defaultCurrency: {
    type: String,
    required: true,
    default: null
  },
  status: {
    type: Boolean,
    required: false,
    default: true
  },
  suspend: {
    type: Boolean,
    required: false,
    default: false
  },
  kycstatus: {
    type: Boolean,
    required: false,
    default: false
  },
  postalcode: {
    type: String,
    required: false,
    default: null
  },
  ownerTitle: {
    type: String,
    required: false,
    default: null
  },
  ownertaxid: {
    type: String,
    required: false,
    default: null
  },
  owneridofindividual: {
    type: String,
    required: false,
    default: null
  },
  ownerbrd: {
    type: String,
    required: false,
    default: null
  },
  ownerProfile: {
    type: String,
    required: false,
    default: null
  },
  vaultAccountId: {
    type: String,
    default: ''
  },
  resetToken: {
    type: String,
    required: false,
    default: ''
  },
  referalCode: {
    type: String,
    default: ''
  },
  deleteRequest: {
    type: Boolean,
    required: false,
    default: false
  },
  emailStatement: {
    type: Boolean,
    required: false,
    default: false
  },
  otp: { type: String },
  otpCreatedAt: { type: Date },
},
{
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if(!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.isPasswordCorrect = async function(password) {
  return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateAccessToken = function() {
  const dataSend = {
    id: this._id,
    email: this.email,
    name: this.name,
    defaultcurr: this.defaultCurrency
  }
 
 try {
   return jwt.sign({
     expiresIn: '1d',
     data: dataSend
   },process.env.ACCESS_TOKEN_SECRET);
 } catch (error) {
    console.log("Error while generating Access Token", error);
 }
} 

userSchema.plugin(mongoosePaginate);
const User = mongoose.model("User", userSchema);
module.exports = { User };
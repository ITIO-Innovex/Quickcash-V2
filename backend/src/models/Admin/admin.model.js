const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { mongoose} = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

const adminSchema = new mongoose.Schema({
  fname: {
    type: String,
    tim:true,
    required: true,
    index:true
  },
  lname: {
    type: String,
    tim:true,
    required: false,
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
  status: {
    type: Boolean,
    required: false,
    default: false
  },
  profileAvatar: {
    type: String,
    default: '',
    required: false
  },
  resetToken: {
    type: String,
    required: false,
    default: ''
  },
  twofa: {
    type: Boolean,
    required: false,
    default: false
  },
  otp: {
    type: String,
    required: false,
    default: ''
  },
  superadmin: {
    type: Boolean,
    required: false,
    default: false
  },
  autoresettime: {
    type: String,
    required: false,
    default: ''
  }
},
{
  timestamps: true
});

adminSchema.pre('save', async function(next) {
  if(!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

adminSchema.methods.isPasswordCorrect = async function(password) {
  return await bcrypt.compare(password, this.password);
}

adminSchema.methods.generateAccessToken = function() {
  const dataSend = {
    id: this._id,
    email: this.email,
    name: this.name
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

adminSchema.plugin(mongoosePaginate);
const Admin = mongoose.model("Admin", adminSchema);
module.exports = { Admin };
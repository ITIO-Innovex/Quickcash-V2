const { mongoose,Schema} = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

const notificationSchema = new mongoose.Schema({
  user: { 
    type: Schema.Types.ObjectId,
    ref: "User",
    default: ''
  },
  title: {
    type: String,
    default: ''
  },
  tags: [String],
  attachment: {
    type: String,
    default: ''
  },
  message: {
    type: String,
    default: ''
  },
  notifyFrom: {
    type: String,
    enum : ['user','admin', 'all'],
    default: 'all'
  },
  notifyType: {
    type: String,
    enum : ['kyc','login', 'general','all', 'user', 'newuser','account','invoice','crypto','ticket','receipient', 'transaction'],
    default: 'general'
  },
  read: {
    type: Boolean,
    default: false
  },
  readBy : {
    type: Array,
    default: []
  }
},
{
  timestamps: true
});


notificationSchema.plugin(mongoosePaginate);

const Notification = mongoose.model("Notification", notificationSchema);
module.exports = { Notification };
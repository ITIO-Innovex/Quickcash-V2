const { mongoose,Schema} = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

const chatHistorySchema = new mongoose.Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  support: {
    type: Schema.Types.ObjectId,
    ref: "Support"
  },
  from: {
    type: String,
    required: false,
    default: 'User'
  },
  to: {
    type: String,
    required: false,
    default: 'Admin'
  },
  message: {
    type: String,
    default: ''
  },
  attachment: {
    type: String,
    default: ''
  },
},
{
  timestamps: true
});


chatHistorySchema.plugin(mongoosePaginate);

const ChatHistory = mongoose.model("ChatHistory", chatHistorySchema);
module.exports = { ChatHistory };
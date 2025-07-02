const { mongoose,Schema} = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

const supportSchema = new mongoose.Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  ticketId: {
    type: String,
    unique: true,
    default: Date.now()+""+Math.floor(Math.random()*10000000)
  },
  subject: {
    type: String,
    required: false,
    default: ''
  },
  message: {
    type: String,
    default: ''
  },
  history: {
    type: Array,
    required: false,
    default: []
  },
  status: {
    type: String,
    default: 'Pending'
  }
},
{
  timestamps: true
});


supportSchema.plugin(mongoosePaginate);

const Support = mongoose.model("Support", supportSchema);
module.exports = { Support };
const { mongoose,Schema} = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

const qrCodeSchema = new mongoose.Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  title: {
    type: String,
    required: false,
    default: ''
  },
  image: {
    type: String,
    default: ''
  },
  IsDefault: {
    type: String,
    required: false,
    default: '',
  },
},
{
  timestamps: true
});

qrCodeSchema.plugin(mongoosePaginate);
const QrCode = mongoose.model("QrCode", qrCodeSchema);
module.exports = { QrCode };
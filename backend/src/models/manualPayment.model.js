const { mongoose,Schema} = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

// Invoice Manual Payment model Schema

const manualPaymentSchema = new mongoose.Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  invoice: {
    type: Schema.Types.ObjectId,
    ref: "Invoice"
  },
  clientInfo: {
    type: Array,
    default: []
  },
  amount: {
   type: Number,
   default: 0
  },
  amountCurrencyText: {
    type: String,
    default: ''
  },
  paymentDate: {
   type: Date,
   default: ''
  },
  paymentMode: {
   type: String,
   default: 'Cash'
  },
  notes: {
   type: String,
   default: ''
  }
},
{
  timestamps: true
});

manualPaymentSchema.plugin(mongoosePaginate);
const ManualPayment = mongoose.model("ManualPayment", manualPaymentSchema);
module.exports = { ManualPayment };
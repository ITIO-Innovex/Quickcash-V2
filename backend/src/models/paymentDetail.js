const { mongoose, Schema } = require('mongoose');

const paymentDetailSchema = new Schema({
  tradeId: { type: String, required: true, index: true },
  paymentType: { type: String, required: true },
  accountNo: { type: String, required: true },
  accountName: { type: String, required: true },
  bankName: { type: String, required: true },
  bankAddress: { type: String, required: true },
  ifscCode: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, {
  timestamps: true
});

const PaymentDetail = mongoose.model('PaymentDetail', paymentDetailSchema);
module.exports = PaymentDetail;

const { Schema, model } = require('mongoose');

const P2POrderSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['BUY', 'SELL'], required: true },
  asset: { type: String, required: true },
  currency: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  limitFrom: { type: Number, required: true },
  limitTo: { type: Number, required: true },
  postExpiry: { type: Date, required: true },
  paymentMethods: [{ type: String, required: true }],
  termsAccepted: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = model('P2POrder', P2POrderSchema);

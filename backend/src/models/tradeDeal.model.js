const { Schema, model } = require('mongoose');

const TradeDealSchema = new Schema({
  order: { type: Schema.Types.ObjectId, ref: 'P2POrder', required: true },

  buyer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  seller: { type: Schema.Types.ObjectId, ref: 'User', required: true },

  amount: { type: Number, required: true },
  totalPrice: { type: Number, required: true },

  status: {
    type: String,
    enum: ['PENDING', 'PAID', 'RELEASED', 'CANCELLED'],
    default: 'PENDING'
  },

  paymentProof: { type: String }, // Optional: URL or filename
  chat: [{ sender: String, message: String, timestamp: Date }],

  createdAt: { type: Date, default: Date.now }
});

module.exports = model('TradeDeal', TradeDealSchema);
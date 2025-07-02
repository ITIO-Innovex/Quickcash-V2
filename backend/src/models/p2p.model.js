const { Schema, model } = require('mongoose');

const p2pTradeSchema = new Schema({
  buyer: { type: Schema.Types.ObjectId, ref: 'User' },
  seller: { type: Schema.Types.ObjectId, ref: 'User' },
  coin: { type: String, required: true },
  currency: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'pending'
  },
  tradeType: { type: String, enum: ['buy', 'sell'], required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = model('P2PTrade', p2pTradeSchema);

const mongoose = require('mongoose');

const SwapCoinSchema = new mongoose.Schema({
  coin: { type: String, required: true, unique: true },  // e.g., "SOL", "USDT"
  name: { type: String, required: true },               // e.g., "Solana", "Tether"
  coingecko_id: { type: String, required: true, unique: true }, // e.g., "solana", "tether"
  network: { type: String, required: false },           // e.g., "BEP20", "ERC20"
  logo: { type: String, required: false },             // Optional coin logo
  updatedAt: { type: Date, default: Date.now }          // Last updated timestamp
});

module.exports = mongoose.model('SwapCoin', SwapCoinSchema);

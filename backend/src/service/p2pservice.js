const P2PTrade = require('../models/p2p.model');
const { User } = require('../models/user.model');

exports.createTrade = async (data) => {
  const newTrade = new P2PTrade(data);
  await newTrade.save();
  return newTrade;
};

exports.getUserTrades = async (userId) => {
  return await P2PTrade.find({
    $or: [{ buyer: userId }, { seller: userId }]
  }).sort({ createdAt: -1 });
};

exports.completeTrade = async (tradeId, userId) => {
  const trade = await P2PTrade.findById(tradeId);
  if (!trade) throw new Error('Trade not found');
  if (trade.status !== 'pending') throw new Error('Trade already processed');

  // Here, you'd update user wallets accordingly

  trade.status = 'completed';
  await trade.save();
  return trade;
};

exports.searchPublicTrades = async ({ coin, currency, tradeType }) => {
  const filter = { status: 'pending' };

  if (coin) filter.coin = coin;
  if (currency) filter.currency = currency;
  if (tradeType) filter.tradeType = tradeType;

  return await P2PTrade.find(filter).sort({ createdAt: -1 });
};

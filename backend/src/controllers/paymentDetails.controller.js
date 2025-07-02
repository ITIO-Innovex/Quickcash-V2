const PaymentDetail = require('../models/paymentDetail');

const upsertPaymentDetail = async (req, res) => {
  const userId = req.user.id;
  const {
    tradeId, paymentType, accountNo, accountName,
    bankName, bankAddress, ifscCode, recipient,
  } = req.body;

  try {
    const detail = await PaymentDetail.findOneAndUpdate(
      { tradeId, createdBy: userId },
      { paymentType, accountNo, accountName, bankName, bankAddress, ifscCode, recipient },
      { upsert: true, new: true }
    );
    res.status(200).json(detail);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

const getIncomingPaymentDetails = async (req, res) => {
  const userId = req.user.id;
  try {
    const incoming = await PaymentDetail.find({ recipient: userId })
      .populate('createdBy', 'name')
      .sort('-createdAt');
    res.status(200).json(incoming);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  upsertPaymentDetail,
  getIncomingPaymentDetails
};

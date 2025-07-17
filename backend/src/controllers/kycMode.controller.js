const KycMethod = require('../models/kycMode.model');

// Create or update Sumsub KYC configuration
exports.setSumsubKycConfig = async (req, res) => {
  try {
    const { kycProvider, kycStatus, apiKey, otherKey, otherKey2, otherJsonData, isDefault } = req.body;
    // Upsert the sumsub KYC method
    const updated = await KycMethod.findOneAndUpdate(
      { type: 'sumsub' },
      {
        type: 'sumsub',
        isDefault: isDefault === undefined ? false : isDefault,
        details: {
          kycProvider,
          kycStatus,
          apiKey,
          otherKey,
          otherKey2,
          otherJsonData,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    return res.status(200).json({ success: true, data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Get current Sumsub KYC configuration
exports.getSumsubKycConfig = async (req, res) => {
  try {
    const config = await KycMethod.findOne({ type: 'sumsub' });
    if (!config) {
      return res.status(404).json({ success: false, message: 'Sumsub KYC config not found' });
    }
    return res.status(200).json({ success: true, data: config });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Update Sumsub KYC configuration (PUT)
exports.updateSumsubKycConfig = async (req, res) => {
  try {
    const { kycProvider, kycStatus, apiKey, otherKey, otherKey2, otherJsonData, isDefault } = req.body;
    const updated = await KycMethod.findOneAndUpdate(
      { type: 'sumsub' },
      {
        $set: {
          isDefault: isDefault === undefined ? false : isDefault,
          details: {
            kycProvider,
            kycStatus,
            apiKey,
            otherKey,
            otherKey2,
            otherJsonData,
          },
        },
      },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Sumsub KYC config not found' });
    }
    return res.status(200).json({ success: true, data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}; 
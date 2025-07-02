const Sign = require('../model/sign.model');
const mongoose = require('mongoose');

exports.storeSignature = async (req, res) => {
  try {
    const { base64, userId, documentId } = req.body;

    if (!base64 || !userId) {
      return res.status(400).json({ error: 'base64 and userId are required.' });
    }

    // Validate userId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid userId format.' });
    }

    // Create signature object with only required fields
    const signatureData = {
      base64,
      userId
    };

    // Only add documentId if it's provided and valid
    if (documentId && mongoose.Types.ObjectId.isValid(documentId)) {
      signatureData.documentId = documentId;
    }

    const newSignature = new Sign(signatureData);
    const savedSignature = await newSignature.save();

    return res.status(201).json({
      message: 'Signature stored successfully',
      data: savedSignature,
    });
  } catch (error) {
    console.error('Error storing signature:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getSignature = async (req, res) => {
  try {
    const signatureRecord = await Sign.findOne({ userId: req.user._id }).sort({ createdAt: -1 });

    return res.status(201).json({
      message: 'Signature stored successfully',
      data: signatureRecord,
    });
  } catch (error) {
    console.error('Error storing signature:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
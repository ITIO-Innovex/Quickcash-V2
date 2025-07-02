const BsKyc = require('../models/bsKyc.model'); 
const {BsUser} = require( '../models/bsUser.model');
module.exports = {

  getAllKycEntries: async (req, res) => {
    try {
      const { status } = req.query;
  
      const query = {};
      if (status) {
        query.status = status;
      }
  
      const kycEntries = await BsKyc.find(query).sort({ createdAt: -1 }); 
      console.log('Total KYC entries:', kycEntries.length);
  
      return res.status(200).json({
        message: 'KYC entries fetched successfully',
        data: kycEntries,
      });
    } catch (error) {
      console.error('Error fetching KYC entries:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  },
  getKycById: async (req, res) => {
    try {
      const { id } = req.params;
      const kycEntry = await BsKyc.findById(id);
  
      if (!kycEntry) {
        return res.status(404).json({ message: 'KYC entry not found' });
      }
  
      return res.status(200).json({
        message: 'KYC entry fetched successfully',
        data: kycEntry,
      });
    } catch (error) {
      console.error('Error fetching KYC by ID:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  } ,
  updateKycStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
  
      const kyc = await BsKyc.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      );
  
      if (!kyc) {
        return res.status(404).json({ message: 'KYC entry not found' });
      }
  
      const user = await BsUser.findOneAndUpdate(
        { userId: kyc.userId },
        { kycStatus: status }
      );
  
      if (!user) {
        return res.status(404).json({ message: 'User not found for KYC' });
      }
  
      return res.status(200).json({
        message: 'KYC status updated successfully',
        data: kyc,
      });
    } catch (error) {
      console.error('Error updating KYC status:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }  
}

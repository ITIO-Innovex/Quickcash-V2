const { TransferMethod } = require('../models/transferMethod.model');
const { Transaction } = require('../models/transaction.model');
const { Account } = require('../models/account.model');

module.exports = {
  // Get all active transfer methods
  getTransferMethods: async (req, res) => {
    try {
      const transferMethods = await TransferMethod.find({ isActive: true }).sort({ createdAt: 1 });
      
      return res.status(200).json({
        status: 200,
        message: "Transfer methods retrieved successfully",
        data: transferMethods
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: 500,
        message: "Something went wrong",
        data: error.message
      });
    }
  },

  // Get transfer method by ID
  getTransferMethodById: async (req, res) => {
    try {
      const { methodId } = req.params;
      const transferMethod = await TransferMethod.findOne({ methodId, isActive: true });
      
      if (!transferMethod) {
        return res.status(404).json({
          status: 404,
          message: "Transfer method not found",
          data: null
        });
      }

      return res.status(200).json({
        status: 200,
        message: "Transfer method retrieved successfully",
        data: transferMethod
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: 500,
        message: "Something went wrong",
        data: error.message
      });
    }
  },

  // Create transfer method (Admin only)
  createTransferMethod: async (req, res) => {
    try {
      const {
        methodId,
        title,
        description,
        icon,
        fee,
        time,
        region,
        currency,
        formFields,
        validationRules
      } = req.body;

      // Check if method already exists
      const existingMethod = await TransferMethod.findOne({ methodId });
      if (existingMethod) {
        return res.status(400).json({
          status: 400,
          message: "Transfer method already exists",
          data: null
        });
      }

      const transferMethod = await TransferMethod.create({
        methodId,
        title,
        description,
        icon,
        fee,
        time,
        region,
        currency,
        formFields,
        validationRules
      });

      return res.status(201).json({
        status: 201,
        message: "Transfer method created successfully",
        data: transferMethod
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: 500,
        message: "Something went wrong",
        data: error.message
      });
    }
  },

  // Update transfer method (Admin only)
  updateTransferMethod: async (req, res) => {
    try {
      const { methodId } = req.params;
      const updateData = req.body;

      const transferMethod = await TransferMethod.findOneAndUpdate(
        { methodId },
        updateData,
        { new: true, runValidators: true }
      );

      if (!transferMethod) {
        return res.status(404).json({
          status: 404,
          message: "Transfer method not found",
          data: null
        });
      }

      return res.status(200).json({
        status: 200,
        message: "Transfer method updated successfully",
        data: transferMethod
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: 500,
        message: "Something went wrong",
        data: error.message
      });
    }
  },

  // Delete transfer method (Admin only)
  deleteTransferMethod: async (req, res) => {
    try {
      const { methodId } = req.params;

      const transferMethod = await TransferMethod.findOneAndUpdate(
        { methodId },
        { isActive: false },
        { new: true }
      );

      if (!transferMethod) {
        return res.status(404).json({
          status: 404,
          message: "Transfer method not found",
          data: null
        });
      }

      return res.status(200).json({
        status: 200,
        message: "Transfer method deleted successfully",
        data: transferMethod
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: 500,
        message: "Something went wrong",
        data: error.message
      });
    }
  },

  // Validate transfer form data
  validateTransferForm: async (req, res) => {
    try {
      const { methodId, formData } = req.body;

      const transferMethod = await TransferMethod.findOne({ methodId, isActive: true });
      if (!transferMethod) {
        return res.status(404).json({
          status: 404,
          message: "Transfer method not found",
          data: null
        });
      }

      const validationRules = transferMethod.validationRules;
      const errors = {};

      // Validate required fields
      for (const [fieldName, rules] of Object.entries(validationRules)) {
        if (rules.required && (!formData[fieldName] || formData[fieldName].trim() === '')) {
          errors[fieldName] = `${fieldName} is required`;
        }

        // Validate field length
        if (rules.minLength && formData[fieldName] && formData[fieldName].length < rules.minLength) {
          errors[fieldName] = `${fieldName} must be at least ${rules.minLength} characters`;
        }

        if (rules.maxLength && formData[fieldName] && formData[fieldName].length > rules.maxLength) {
          errors[fieldName] = `${fieldName} must be at most ${rules.maxLength} characters`;
        }

        // Validate amount
        if (fieldName.includes('amount') && formData[fieldName]) {
          const amount = parseFloat(formData[fieldName]);
          if (isNaN(amount) || amount <= 0) {
            errors[fieldName] = 'Amount must be a positive number';
          }
        }

        // Validate IBAN format
        if (fieldName === 'iban' && formData[fieldName]) {
          const ibanRegex = /^[A-Z]{2}[0-9]{2}[A-Z0-9]{4}[0-9]{7}([A-Z0-9]?){0,16}$/;
          if (!ibanRegex.test(formData[fieldName].replace(/\s/g, ''))) {
            errors[fieldName] = 'Invalid IBAN format';
          }
        }

        // Validate SWIFT/BIC format
        if (fieldName === 'swiftCode' && formData[fieldName]) {
          const swiftRegex = /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/;
          if (!swiftRegex.test(formData[fieldName])) {
            errors[fieldName] = 'Invalid SWIFT/BIC format';
          }
        }

        // Validate routing number (ACH)
        if (fieldName === 'routingNumber' && formData[fieldName]) {
          const routingRegex = /^[0-9]{9}$/;
          if (!routingRegex.test(formData[fieldName])) {
            errors[fieldName] = 'Routing number must be 9 digits';
          }
        }
      }

      if (Object.keys(errors).length > 0) {
        return res.status(400).json({
          status: 400,
          message: "Validation failed",
          data: errors
        });
      }

      return res.status(200).json({
        status: 200,
        message: "Form validation successful",
        data: { isValid: true }
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: 500,
        message: "Something went wrong",
        data: error.message
      });
    }
  },

  // Get recommended transfer method based on destination
  getRecommendedMethod: async (req, res) => {
    try {
      const { destinationCountry, destinationCurrency } = req.query;
      
      if (!destinationCountry || !destinationCurrency) {
        return res.status(400).json({
          status: 400,
          message: "Destination country and currency are required",
          data: null
        });
      }

      // European countries that support SEPA transfers
      const SEPA_COUNTRIES = [
        'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 
        'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 
        'SE', 'CH', 'NO', 'LI', 'IS', 'MC', 'SM', 'VA', 'AD'
      ];

      // Countries that support ACH transfers
      const ACH_COUNTRIES = ['US'];

      let recommendedMethodId = 'swift'; // Default to SWIFT

      // For EUR currency, always recommend SEPA
      if (destinationCurrency === 'EUR') {
        recommendedMethodId = 'sepa';
      }
      // For USD currency, always recommend ACH
      else if (destinationCurrency === 'USD') {
        recommendedMethodId = 'ach';
      }
      // For all other currencies, default to SWIFT
      else {
        recommendedMethodId = 'swift';
      }

      // Get the recommended method details
      const recommendedMethod = await TransferMethod.findOne({ 
        methodId: recommendedMethodId, 
        isActive: true 
      });

      if (!recommendedMethod) {
        return res.status(404).json({
          status: 404,
          message: "Recommended transfer method not found",
          data: null
        });
      }

      // Get available methods for this destination based on currency
      const availableMethods = await TransferMethod.find({ isActive: true });
      const filteredMethods = availableMethods.filter(method => {
        if (destinationCurrency === 'EUR') {
          return method.methodId === 'sepa';
        } else if (destinationCurrency === 'USD') {
          return method.methodId === 'ach';
        } else {
          return method.methodId === 'swift';
        }
      });

      return res.status(200).json({
        status: 200,
        message: "Recommended transfer method retrieved successfully",
        data: {
          recommended: recommendedMethod,
          available: filteredMethods
        }
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: 500,
        message: "Something went wrong",
        data: error.message
      });
    }
  },

  // Process transfer request
  processTransfer: async (req, res) => {
    try {
      const { methodId, formData, sourceAccountId } = req.body;
      const userId = req.user._id; // Get user ID from authenticated user

      // Validate the form data first
      const validationResponse = await module.exports.validateTransferForm(req, res);
      if (validationResponse.statusCode === 400) {
        return validationResponse;
      }

      const transferMethod = await TransferMethod.findOne({ methodId, isActive: true });
      if (!transferMethod) {
        return res.status(404).json({
          status: 404,
          message: "Transfer method not found",
          data: null
        });
      }

      // Get source account (already validated by middleware)
      const sourceAccount = await Account.findById(sourceAccountId);

      const amount = parseFloat(formData.amount || formData.achAmount);
      const totalAmount = amount + transferMethod.fee;

      if (sourceAccount.amount < totalAmount) {
        return res.status(400).json({
          status: 400,
          message: "Insufficient balance",
          data: { required: totalAmount, available: sourceAccount.amount }
        });
      }

      // Create transaction record
      const transaction = await Transaction.create({
        user: userId,
        source_account: sourceAccountId,
        trans_type: "Transfer",
        tr_type: methodId,
        amount: amount,
        fee: transferMethod.fee,
        status: "Pending",
        info: `Transfer via ${transferMethod.title}`,
        from_currency: sourceAccount.currency,
        to_currency: transferMethod.currency,
        trx: Math.floor(Math.random() * 999999999999),
        extraType: 'debit',
        postBalance: sourceAccount.amount - totalAmount,
        // Store transfer-specific data
        transferDetails: {
          methodId,
          formData,
          transferMethod: transferMethod.title
        }
      });

      // Update account balance
      await Account.findByIdAndUpdate(
        sourceAccountId,
        { amount: sourceAccount.amount - totalAmount },
        { new: true }
      );

      return res.status(201).json({
        status: 201,
        message: "Transfer initiated successfully",
        data: {
          transactionId: transaction._id,
          amount: amount,
          fee: transferMethod.fee,
          totalAmount: totalAmount,
          estimatedTime: transferMethod.time
        }
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: 500,
        message: "Something went wrong",
        data: error.message
      });
    }
  }
}; 
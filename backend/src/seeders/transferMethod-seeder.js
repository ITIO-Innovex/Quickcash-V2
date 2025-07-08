const { TransferMethod } = require('../models/transferMethod.model');

// European countries that support SEPA transfers
const SEPA_COUNTRIES = [
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 
  'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 
  'SE', 'CH', 'NO', 'LI', 'IS', 'MC', 'SM', 'VA', 'AD'
];

// Countries that support ACH transfers
const ACH_COUNTRIES = ['US'];

const transferMethodsData = [
  {
    methodId: 'sepa',
    title: 'SEPA Transfer',
    description: 'Single Euro Payments Area',
    icon: 'MapPin',
    fee: 3.50,
    time: '1-2 business days',
    region: 'Europe (Eurozone)',
    currency: 'EUR',
    isActive: true,
    formFields: {
      iban: {
        type: 'text',
        label: 'IBAN *',
        placeholder: 'DE89 3704 0044 0532 0130 00',
        required: true,
        helperText: 'International Bank Account Number'
      },
      bicSwift: {
        type: 'text',
        label: 'BIC/SWIFT Code',
        placeholder: 'COBADEFFXXX',
        required: false,
        helperText: 'Optional for SEPA transfers'
      },
      beneficiaryName: {
        type: 'text',
        label: 'Beneficiary Name *',
        placeholder: 'John Doe',
        required: true
      },
      amount: {
        type: 'number',
        label: 'Amount (EUR) *',
        placeholder: '1000.00',
        required: true
      },
      executionDate: {
        type: 'date',
        label: 'Execution Date',
        required: false
      },
      purpose: {
        type: 'text',
        label: 'Purpose/Reference',
        placeholder: 'Invoice payment, salary, etc.',
        required: false
      },
      remittanceInfo: {
        type: 'textarea',
        label: 'Remittance Information',
        placeholder: 'Additional payment details...',
        required: false,
        rows: 3
      }
    },
    validationRules: {
      iban: {
        required: true,
        minLength: 15,
        maxLength: 34,
        pattern: '^[A-Z]{2}[0-9]{2}[A-Z0-9]{4}[0-9]{7}([A-Z0-9]?){0,16}$'
      },
      bicSwift: {
        required: false,
        minLength: 8,
        maxLength: 11,
        pattern: '^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$'
      },
      beneficiaryName: {
        required: true,
        minLength: 2,
        maxLength: 100
      },
      amount: {
        required: true,
        min: 0.01,
        max: 999999.99
      },
      executionDate: {
        required: false
      },
      purpose: {
        required: false,
        maxLength: 200
      },
      remittanceInfo: {
        required: false,
        maxLength: 500
      }
    }
  },
  {
    methodId: 'swift',
    title: 'SWIFT Wire',
    description: 'International wire transfer',
    icon: 'Globe',
    fee: 15.00,
    time: '1-5 business days',
    region: 'Global',
    currency: 'Any currency',
    isActive: true,
    formFields: {
      beneficiaryName: {
        type: 'text',
        label: 'Beneficiary Name *',
        placeholder: 'John Doe',
        required: true
      },
      accountNumber: {
        type: 'text',
        label: 'Account Number/IBAN *',
        placeholder: 'Account number or IBAN',
        required: true
      },
      beneficiaryAddress: {
        type: 'textarea',
        label: 'Beneficiary Address *',
        placeholder: 'Complete address of the recipient',
        required: true,
        rows: 2
      },
      swiftCode: {
        type: 'text',
        label: 'SWIFT/BIC Code *',
        placeholder: 'COBADEFFXXX',
        required: true
      },
      bankName: {
        type: 'text',
        label: 'Bank Name *',
        placeholder: 'Recipient\'s bank name',
        required: true
      },
      bankAddress: {
        type: 'textarea',
        label: 'Bank Address *',
        placeholder: 'Complete address of the recipient\'s bank',
        required: true,
        rows: 2
      },
      currency: {
        type: 'select',
        label: 'Currency *',
        required: true,
        options: [
          { value: 'USD', label: 'USD - US Dollar' },
          { value: 'EUR', label: 'EUR - Euro' },
          { value: 'GBP', label: 'GBP - British Pound' },
          { value: 'INR', label: 'INR - Indian Rupee' },
          { value: 'CAD', label: 'CAD - Canadian Dollar' }
        ]
      },
      amount: {
        type: 'number',
        label: 'Amount *',
        placeholder: '1000.00',
        required: true
      },
      intermediaryBank: {
        type: 'text',
        label: 'Intermediary Bank (Optional)',
        placeholder: 'Intermediary bank details if required',
        required: false
      },
      transferMessage: {
        type: 'textarea',
        label: 'Transfer Message/Purpose',
        placeholder: 'Reason for transfer...',
        required: false,
        rows: 3
      }
    },
    validationRules: {
      beneficiaryName: {
        required: true,
        minLength: 2,
        maxLength: 100
      },
      accountNumber: {
        required: true,
        minLength: 5,
        maxLength: 50
      },
      beneficiaryAddress: {
        required: true,
        minLength: 10,
        maxLength: 500
      },
      swiftCode: {
        required: true,
        minLength: 8,
        maxLength: 11,
        pattern: '^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$'
      },
      bankName: {
        required: true,
        minLength: 2,
        maxLength: 100
      },
      bankAddress: {
        required: true,
        minLength: 10,
        maxLength: 500
      },
      currency: {
        required: true
      },
      amount: {
        required: true,
        min: 0.01,
        max: 999999.99
      },
      intermediaryBank: {
        required: false,
        maxLength: 200
      },
      transferMessage: {
        required: false,
        maxLength: 500
      }
    }
  },
  {
    methodId: 'ach',
    title: 'ACH Transfer',
    description: 'Automated Clearing House',
    icon: 'Building2',
    fee: 2.00,
    time: '1-3 business days',
    region: 'United States',
    currency: 'USD',
    isActive: true,
    formFields: {
      routingNumber: {
        type: 'text',
        label: 'Routing Number (ABA) *',
        placeholder: '021000021',
        required: true,
        helperText: '9-digit bank routing number'
      },
      achAccountNumber: {
        type: 'text',
        label: 'Account Number *',
        placeholder: '1234567890',
        required: true
      },
      accountType: {
        type: 'select',
        label: 'Account Type',
        required: true,
        options: [
          { value: 'checking', label: 'Checking Account' },
          { value: 'savings', label: 'Savings Account' }
        ]
      },
      achBeneficiaryName: {
        type: 'text',
        label: 'Beneficiary Name *',
        placeholder: 'John Doe',
        required: true
      },
      achAmount: {
        type: 'number',
        label: 'Amount (USD) *',
        placeholder: '1000.00',
        required: true
      },
      transactionCode: {
        type: 'select',
        label: 'Transaction Type',
        required: true,
        options: [
          { value: 'credit', label: 'Credit (Receiving funds)' },
          { value: 'debit', label: 'Debit (Sending funds)' }
        ]
      },
      entryClassCode: {
        type: 'select',
        label: 'Entry Class Code',
        required: true,
        options: [
          { value: 'PPD', label: 'PPD - Personal' },
          { value: 'CCD', label: 'CCD - Corporate' },
          { value: 'WEB', label: 'WEB - Internet' }
        ]
      },
      paymentDescription: {
        type: 'text',
        label: 'Payment Description',
        placeholder: 'Salary, Invoice payment, etc.',
        required: false
      }
    },
    validationRules: {
      routingNumber: {
        required: true,
        minLength: 9,
        maxLength: 9,
        pattern: '^[0-9]{9}$'
      },
      achAccountNumber: {
        required: true,
        minLength: 4,
        maxLength: 17
      },
      accountType: {
        required: true
      },
      achBeneficiaryName: {
        required: true,
        minLength: 2,
        maxLength: 100
      },
      achAmount: {
        required: true,
        min: 0.01,
        max: 999999.99
      },
      transactionCode: {
        required: true
      },
      entryClassCode: {
        required: true
      },
      paymentDescription: {
        required: false,
        maxLength: 200
      }
    }
  }
];

const seedTransferMethods = async () => {
  try {
    console.log('Seeding transfer methods...');
    
    for (const methodData of transferMethodsData) {
      const existingMethod = await TransferMethod.findOne({ methodId: methodData.methodId });
      
      if (!existingMethod) {
        // Add supported countries to the method data
        const enhancedMethodData = {
          ...methodData,
          supportedCountries: methodData.methodId === 'sepa' ? SEPA_COUNTRIES : 
                             methodData.methodId === 'ach' ? ACH_COUNTRIES : 
                             [] // SWIFT supports all countries
        };
        
        await TransferMethod.create(enhancedMethodData);
        console.log(`Created transfer method: ${methodData.title}`);
      } else {
        // Update existing method with supported countries
        const supportedCountries = methodData.methodId === 'sepa' ? SEPA_COUNTRIES : 
                                  methodData.methodId === 'ach' ? ACH_COUNTRIES : 
                                  [];
        
        await TransferMethod.findByIdAndUpdate(existingMethod._id, {
          supportedCountries
        });
        console.log(`Updated transfer method: ${methodData.title}`);
      }
    }
    
    console.log('Transfer methods seeding completed!');
  } catch (error) {
    console.error('Error seeding transfer methods:', error);
  }
};

module.exports = { seedTransferMethods }; 
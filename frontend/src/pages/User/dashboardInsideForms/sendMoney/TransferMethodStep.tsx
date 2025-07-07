import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  Divider,
  Chip,
  useTheme,
  Alert,
  CircularProgress,
} from "@mui/material";
import { MapPin, Globe, Building2 } from 'lucide-react';
import CustomButton from '@/components/CustomButton';
import './TransferMethodStep.css';
import { useTransferMethods } from '@/hooks/useTransferMethods';
import DynamicTransferForm from '@/components/forms/DynamicTransferForm';
import FallbackTransferForm from '@/components/forms/FallbackTransferForm';
import { TransferFormData, TransferMethod } from '@/api/transfer.api';
import CustomTextField from '@/components/CustomTextField';
import { getAvailableTransferMethods, getTransferMethodById, getEstimatedArrivalDate } from '@/utils/transferMethodUtils';

interface TransferMethodStepProps {
  formData: any;
  updateFormData: (data: any) => void;
  onNext: () => void;
  onPrevious: () => void;
}

// Fallback transfer methods in case API is not available
const fallbackTransferMethods: TransferMethod[] = [
  {
    _id: 'sepa-fallback',
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
    validationRules: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: 'swift-fallback',
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
    validationRules: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: 'ach-fallback',
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
    validationRules: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const TransferMethodStep: React.FC<TransferMethodStepProps> = ({
  formData,
  updateFormData,
  onNext,
  onPrevious,
}) => {
  const theme = useTheme();
  const {
    transferMethods: apiTransferMethods,
    selectedMethod: apiSelectedMethod,
    loading,
    error,
    validateForm,
    processTransferRequest,
    selectMethod,
    getMethodById
  } = useTransferMethods();
  
  const [activeTab, setActiveTab] = useState(0);
  const [formFields, setFormFields] = useState<TransferFormData>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  // Use API methods if available, otherwise use fallback
  const transferMethods = apiTransferMethods.length > 0 ? apiTransferMethods : fallbackTransferMethods;
  
  // Filter transfer methods based on destination currency
  const filteredTransferMethods = React.useMemo(() => {
    if (!formData.destinationCurrency) return transferMethods;
    
    if (formData.destinationCurrency === 'EUR') {
      return transferMethods.filter(method => method.methodId === 'sepa');
    } else if (formData.destinationCurrency === 'USD') {
      return transferMethods.filter(method => method.methodId === 'ach');
    } else {
      return transferMethods.filter(method => method.methodId === 'swift');
    }
  }, [transferMethods, formData.destinationCurrency]);
  
  const selectedMethod = apiSelectedMethod || (filteredTransferMethods.length > 0 ? filteredTransferMethods[0] : null);

  const iconMap = {
    MapPin: MapPin,
    Globe: Globe,
    Building2: Building2,
  };

  // Set initial selected method from form data or determine automatically
  useEffect(() => {
    if (formData.transferMethod && filteredTransferMethods.length > 0) {
      const method = filteredTransferMethods.find(m => m.methodId === formData.transferMethod);
      if (method) {
        selectMethod(method);
        const methodIndex = filteredTransferMethods.findIndex(m => m.methodId === formData.transferMethod);
        setActiveTab(methodIndex >= 0 ? methodIndex : 0);
      }
    } else if (formData.destinationCountry && formData.destinationCurrency && filteredTransferMethods.length > 0) {
      // Automatically determine transfer method based on destination
      const availableMethods = getAvailableTransferMethods(formData.destinationCountry, formData.destinationCurrency);
      const recommendedMethod = availableMethods[0]; // First method is the recommended one
      
      if (recommendedMethod) {
        const method = filteredTransferMethods.find(m => m.methodId === recommendedMethod.methodId);
        if (method) {
          selectMethod(method);
          const methodIndex = filteredTransferMethods.findIndex(m => m.methodId === recommendedMethod.methodId);
          setActiveTab(methodIndex >= 0 ? methodIndex : 0);
          
          // Update form data with the automatically selected method
          updateFormData({
            transferMethod: recommendedMethod.methodId,
            transferMethodDetails: recommendedMethod
          });
        }
      }
    } else if (filteredTransferMethods.length > 0 && !selectedMethod) {
      // Set first method as default
      selectMethod(filteredTransferMethods[0]);
      setActiveTab(0);
    }
  }, [formData.transferMethod, formData.destinationCountry, formData.destinationCurrency, filteredTransferMethods, selectedMethod, selectMethod, updateFormData]);

  // Pre-fill the amount and currency fields in the form if present in formData
  useEffect(() => {
    if (selectedMethod && formData.toCurrency) {
      // Always set currency field to ensure select shows correct value
      const currencyCode = formData.toCurrency.split('-')[0];
      setFormFields(prev => ({
        ...prev,
        currency: currencyCode
      }));
    }
    if (selectedMethod && formData.convertedValue) {
      let amountField = 'amount';
      if (selectedMethod.methodId === 'ach') amountField = 'achAmount';
      if (selectedMethod.methodId === 'sepa') amountField = 'amount';
      if (selectedMethod.methodId === 'swift') amountField = 'amount';
      setFormFields(prev => ({
        ...prev,
        [amountField]: formData.convertedValue
      }));
    }
  }, [selectedMethod, formData.convertedValue, formData.toCurrency]);

  const handleMethodSelect = (methodId: string) => {
    const method = filteredTransferMethods.find(m => m.methodId === methodId);
    if (method) {
      selectMethod(method);
      const methodIndex = filteredTransferMethods.findIndex(m => m.methodId === methodId);
      setActiveTab(methodIndex >= 0 ? methodIndex : 0);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    if (filteredTransferMethods[newValue]) {
      selectMethod(filteredTransferMethods[newValue]);
    }
  };

  const handleFieldChange = (field: string, value: string) => {
    setFormFields(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleContinue = async () => {
    if (!selectedMethod) {
      setValidationErrors({ general: 'Please select a transfer method' });
      return;
    }

    setIsProcessing(true);
    setValidationErrors({});

    try {
      // If API is available, validate form data
      if (apiTransferMethods.length > 0) {
        const validationResult = await validateForm(selectedMethod.methodId, formFields);
        
        if (!validationResult.isValid) {
          setValidationErrors(validationResult.errors || {});
          return;
        }
      } else {
        // Basic validation for fallback mode
        const requiredFields = Object.entries(selectedMethod.formFields)
          .filter(([_, config]) => config.required)
          .map(([fieldName]) => fieldName);
        
        const missingFields = requiredFields.filter(field => !formFields[field] || formFields[field].toString().trim() === '');
        
        if (missingFields.length > 0) {
          const errors: Record<string, string> = {};
          missingFields.forEach(field => {
            errors[field] = `${field} is required`;
          });
          setValidationErrors(errors);
          return;
        }
      }

      // Update form data and proceed
      updateFormData({ 
        transferMethod: selectedMethod.methodId,
        transferFormData: formFields
      });
      onNext();
    } catch (err: any) {
      setValidationErrors({ general: err.message || 'Validation failed' });
    } finally {
      setIsProcessing(false);
    }
  };

  // Show loading state only if API is being used and loading
  if (loading && apiTransferMethods.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Show error state only if API is being used and there's an error
  if (error && apiTransferMethods.length === 0) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <CustomButton onClick={() => window.location.reload()}>
          Retry
        </CustomButton>
      </Box>
    );
  }

  return (
    <Box className="transfer-method-step">
      <Typography variant="h6" className="step-title">
        Transfer Method Details
      </Typography>

      {/* Show recipient currency and amount */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2">
          Recipient Currency: <strong>{formData.toCurrency ? formData.toCurrency.split('-')[0] : 'N/A'}</strong>
        </Typography>
        {/* Show converted amount if available */}
        {formData.convertedValue && (
          <Typography variant="subtitle2">
            Converted Amount: <strong>{formData.convertedValue} {formData.toCurrency ? formData.toCurrency.split('-')[0] : ''}</strong>
          </Typography>
        )}
      </Box>

      <Typography variant="body2" className="step-description">
        {formData.transferMethodDetails ? 
          `${formData.transferMethodDetails.title} selected for ${formData.destinationCurrency} transfers.` :
          'Transfer method automatically selected based on currency. Fill in the required details below.'
        }
      </Typography>

      {/* Auto-selection indicator */}
      {formData.transferMethodDetails && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>{formData.transferMethodDetails.title}</strong> is the available transfer method for {formData.destinationCurrency} transfers.
            <br />
            Fee: ${formData.transferMethodDetails.fee} • Time: {formData.transferMethodDetails.time}
          </Typography>
        </Alert>
      )}

      {/* Validation Errors */}
      {validationErrors.general && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {validationErrors.general}
        </Alert>
      )}

      {/* Method Selection Cards */}
      {/* <Grid container spacing={3} className="transfer-methods" sx={{ mt: 2, mb: 4 }}>
        {filteredTransferMethods.map((method, index) => {
          const IconComponent = iconMap[method.icon as keyof typeof iconMap];
          return (
            <Grid item xs={12} sm={4} key={method.methodId}>
              <Card
                className={`transfer-method-card ${
                  selectedMethod?.methodId === method.methodId ? 'selected' : ''
                }`}
                onClick={() => handleMethodSelect(method.methodId)}
                sx={{
                  cursor: 'pointer',
                  border: selectedMethod?.methodId === method.methodId ? '2px solid #483594' : '2px solid #e0e0e0',
                  '&:hover': {
                    borderColor: '#483594',
                    boxShadow: '0 4px 16px rgba(72, 53, 148, 0.15)',
                  }
                }}
              >
                <CardContent className="method-content" sx={{ p: 2, textAlign: 'center' }}>
                  <Box className="method-icon" sx={{ mb: 1 }}>
                    {IconComponent && <IconComponent size={24} />}
                  </Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {method.title}
                  </Typography>
                  <Typography variant="caption" sx={{ display: 'block', color: 'text.primary', mb: 1 }}>
                    {method.region}
                  </Typography>
                  <Chip 
                    label={`$${method.fee.toFixed(2)} • ${method.time}`} 
                    size="small" 
                    sx={{ fontSize: '0.75rem', padding: '0.3rem' }} 
                  />
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid> */}

      <Divider sx={{ my: 1 }} />

      {/* Tab Navigation and Forms */}
      <Box className="transfer-forms-section">
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          className="transfer-tabs"
          centered
          sx={{
            '& .MuiTab-root': {
              minWidth: 120,
              fontWeight: 600,
            },
            '& .Mui-selected': {
              color: '#483594',
            },
            '& .MuiTabs-indicator': {
              backgroundColor: 'text.primary',
            }
          }}
        >
          {filteredTransferMethods.map((method, index) => (
            <Tab key={method.methodId} label={method.title} />
          ))}
        </Tabs>

        <Box className="form-container-transfer" sx={{ mt: 1 }}>
          {selectedMethod && (
            <>
              {/* Try DynamicTransferForm first, fallback to FallbackTransferForm */}
              <DynamicTransferForm
                transferMethod={selectedMethod}
                formData={formFields}
                onFormDataChange={setFormFields}
                errors={validationErrors}
                disabledFields={['currency']}
              />
            </>
          )}
        </Box>
      </Box>

      {/* Action Buttons */}
      <Box className="step-actions" sx={{ mt: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <CustomButton
              onClick={onPrevious}
              fullWidth
              className="continue-button"
              disabled={isProcessing}
            >
              Back
            </CustomButton>
          </Grid>
          <Grid item xs={6}>
            <CustomButton
              onClick={handleContinue}
              fullWidth
              className="continue-button"
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Continue'}
            </CustomButton>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default TransferMethodStep;

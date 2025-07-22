import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Chip,
  useTheme,
} from "@mui/material";
import { CreditCard, Building2, Globe, MapPin } from 'lucide-react';
import CustomButton from '@/components/CustomButton';
import './TransferMethodStep.css';
import CustomTextField from '@/components/CustomTextField';
import api from '@/helpers/apiHelper';
import axios from 'axios';
import CustomSelect from '@/components/CustomDropdown';

interface TransferMethodStepProps {
  formData: any;
  updateFormData: (data: any) => void;
  onNext: () => void;
  onPrevious: () => void;
}

const TransferMethodStep: React.FC<TransferMethodStepProps> = ({
  formData,
  updateFormData,
  onNext,
  onPrevious,
}) => {
  const theme = useTheme();
  // --- Static method selection logic ---
  const currency = (formData.toCurrency || formData.selectedCurrency || '').split('-')[0];
  let staticMethod: 'sepa' | 'ach' | 'swift' | null = null;
  if (currency === 'EUR') {
    staticMethod = 'sepa';
  } else if (currency === 'USD') {
    staticMethod = 'ach';
  } else if (currency) {
    staticMethod = 'swift';
  }
  // If staticMethod is set, override state
  const [selectedMethod, setSelectedMethod] = useState(staticMethod || formData.transferMethod || 'sepa');
  const [activeTab, setActiveTab] = useState(staticMethod ? (staticMethod === 'sepa' ? 0 : staticMethod === 'swift' ? 1 : 2) : 0);
  const [formFields, setFormFields] = useState({
    // SEPA fields
    iban: '',
    bicSwift: '',
    beneficiaryName: '',
    amount: '',
    purpose: '',
    remittanceInfo: '',
    executionDate: '',
    // SWIFT fields
    beneficiaryAddress: '',
    accountNumber: '',
    swiftCode: '',
    bankName: '',
    bankAddress: '',
    currency: '',
    transferMessage: '',
    intermediaryBank: '',
    // ACH fields
    routingNumber: '',
    achAccountNumber: '',
    accountType: 'checking',
    achBeneficiaryName: '',
    achAmount: '',
    transactionCode: 'credit',
    entryClassCode: 'PPD',
    paymentDescription: '',
    // Common new fields
    email: '',
    mobile: '',
    address: '',
    country: '',
  });

  const [countries, setCountries] = useState<any[]>([]);

  React.useEffect(() => {
    const fetchCountries = async () => {
      try {
        const countryRes = await api.get(`/api/v1/user/getCountryList`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        let countryList = countryRes.data.data?.country || [];
        // Filter to only European countries (assuming region property)
        countryList = countryList.filter((c: any) => c.region === 'Europe');
        setCountries(countryList);
      } catch (error) {
        console.error('Error loading country data:', error);
      }
    };
    fetchCountries();
  }, []);

  // Update converted amount when amount or currency changes
  React.useEffect(() => {
    let amount = '';
    if (selectedMethod === 'sepa') amount = formFields.amount;
    else if (selectedMethod === 'swift') amount = formFields.amount;
    else if (selectedMethod === 'ach') amount = formFields.achAmount;
    // The converted amount is now passed as a prop, so we don't need to calculate it here.
    // The parent component will handle the conversion and pass the result.
  }, [formFields.amount, formFields.achAmount, selectedMethod]);

  const transferMethods = [
    {
      id: 'sepa',
      title: 'SEPA Transfer',
      description: 'Single Euro Payments Area',
      icon: MapPin,
      fee: '$3.50',
      time: '1-2 business days',
      region: 'Europe (Eurozone)',
      currency: 'EUR only',
    },
    {
      id: 'swift',
      title: 'SWIFT Wire',
      description: 'International wire transfer',
      icon: Globe,
      fee: '$15.00',
      time: '1-5 business days',
      region: 'Global',
      currency: 'Any currency',
    },
    {
      id: 'ach',
      title: 'ACH Transfer',
      description: 'Automated Clearing House',
      icon: Building2,
      fee: '$2.00',
      time: '1-3 business days',
      region: 'United States',
      currency: 'USD only',
    },
  ];

  const handleMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId);
    const methodIndex = transferMethods.findIndex(method => method.id === methodId);
    setActiveTab(methodIndex);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    const method = transferMethods[newValue];
    setSelectedMethod(method.id);
  };

  const handleFieldChange = (field: string, value: string) => {
    setFormFields(prev => ({
      ...prev,
      [field]: value
    }));
    if (field === 'purpose' || field === 'paymentDescription') {
      updateFormData({ info: value });
    }
  };

  const handleContinue = () => {
    let beneficiaryData = {};
    if (selectedMethod === 'sepa') {
      beneficiaryData = {
        name: formFields.beneficiaryName,
        email: formFields.email,
        mobile: formFields.mobile,
        bankName: formFields.bankName,
        iban: formFields.iban,
        bic_code: formFields.bicSwift,
        country: formFields.country || 'EUR', // Should be selected by user
        currency: 'EUR',
        address: formFields.address,
        amount: formData.convertedAmount || '',
      };
    } else if (selectedMethod === 'swift') {
      beneficiaryData = {
        name: formFields.beneficiaryName,
        email: formFields.email,
        mobile: formFields.mobile,
        bankName: formFields.bankName,
        iban: formFields.accountNumber,
        bic_code: formFields.swiftCode,
        country: formFields.country,
        currency: formData.selectedCurrency || formData.toCurrency || '',
        address: formFields.beneficiaryAddress,
        amount: formData.convertedAmount || '',
      };
    } else if (selectedMethod === 'ach') {
      beneficiaryData = {
        name: formFields.achBeneficiaryName,
        email: formFields.email,
        mobile: formFields.mobile,
        bankName: formFields.bankName,
        iban: formFields.achAccountNumber,
        bic_code: formFields.routingNumber,
        country: 'US',
        currency: 'USD',
        address: formFields.address,
        amount: formData.convertedAmount || '',
      };
    }
    updateFormData({
      transferMethod: selectedMethod,
      transferFormData: formFields,
      beneficiaryData,
      info: formFields.purpose || formFields.paymentDescription || '',
    });
    onNext();
  };

  // If staticMethod is set, force method and tab
  React.useEffect(() => {
    if (staticMethod) {
      setSelectedMethod(staticMethod);
      setActiveTab(staticMethod === 'sepa' ? 0 : staticMethod === 'swift' ? 1 : 2);
    }
  }, [formData.selectedCurrency]);

  // SEPA Form Component
  const SEPAForm = () => (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ color: theme.palette.text.primary }}>
        SEPA Transfer Details
      </Typography>
      <Typography variant="body2" className="form-subtitle">
        Single Euro Payments Area - EUR transfers within Europe
      </Typography>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12}>
          <CustomTextField
            fullWidth
            label="IBAN *"
            placeholder="DE89 3704 0044 0532 0130 00"
            value={formFields.iban}
            onChange={(e) => handleFieldChange('iban', e.target.value)}
          // helperText="International Bank Account Number"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <CustomTextField
            fullWidth
            label="BIC/SWIFT Code"
            placeholder="COBADEFFXXX"
            value={formFields.bicSwift}
            onChange={(e) => handleFieldChange('bicSwift', e.target.value)}
          // helperText="Optional for SEPA transfers"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <CustomTextField
            fullWidth
            label="Beneficiary Name *"
            placeholder="John Doe"
            value={formFields.beneficiaryName}
            onChange={(e) => handleFieldChange('beneficiaryName', e.target.value)}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <CustomTextField
            fullWidth
            label="Amount (EUR) *"
            placeholder="1000.00"
            type="number"
            value={formData.convertedAmount || ''}
            disabled
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <CustomTextField
            fullWidth
            //  
            type="date"
            InputLabelProps={{ shrink: true }}
            value={formFields.executionDate}
            onChange={(e) => handleFieldChange('executionDate', e.target.value)}
          />
        </Grid>

        <Grid item xs={12}>
          <CustomTextField
            fullWidth
            label="Purpose/Reference"
            placeholder="Invoice payment, salary, etc."
            value={formFields.purpose}
            onChange={(e) => handleFieldChange('purpose', e.target.value)}
          />
        </Grid>

        <Grid item xs={12}>
          <CustomTextField
            fullWidth
            multiline
            rows={3}
            label="Remittance Information"
            placeholder="Additional payment details..."
            value={formFields.remittanceInfo}
            onChange={(e) => handleFieldChange('remittanceInfo', e.target.value)}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomTextField
            fullWidth
            label="Email"
            placeholder="Beneficiary Email"
            value={formFields.email}
            onChange={(e) => handleFieldChange('email', e.target.value)}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomTextField
            fullWidth
            label="Mobile"
            placeholder="Beneficiary Mobile"
            value={formFields.mobile}
            onChange={(e) => handleFieldChange('mobile', e.target.value)}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomTextField
            fullWidth
            label="Bank Name"
            placeholder="Bank Name"
            value={formFields.bankName}
            onChange={(e) => handleFieldChange('bankName', e.target.value)}
          />
        </Grid>
        {/* <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <CustomSelect
              label="Country"
              value={formFields.country}
              options={countries.map(c => ({ label: c.name, value: c.id }))}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFieldChange('country', e.target.value)}
            >
            </CustomSelect>
          </FormControl>
        </Grid> */}
        <Grid item xs={12}>
          <CustomTextField
            fullWidth
            label="Beneficiary Address"
            placeholder="Beneficiary Address"
            value={formFields.address}
            onChange={(e) => handleFieldChange('address', e.target.value)}
          />
        </Grid>

      </Grid>
    </Box>
  );

  // SWIFT Form Component
  const SWIFTForm = () => (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" >
        SWIFT Wire Transfer Details
      </Typography>
      <Typography variant="body2" className="form-subtitle">
        International wire transfer - Global reach, any currency
      </Typography>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} md={6}>
          <CustomTextField
            fullWidth
            label="Beneficiary Name *"
            placeholder="John Doe"
            value={formFields.beneficiaryName}
            onChange={(e) => handleFieldChange('beneficiaryName', e.target.value)}
          />
        </Grid>
  <Grid item xs={12} md={6}>
          <CustomTextField
            fullWidth
            label="Email"
            placeholder="Beneficiary Email"
            value={formFields.email}
            onChange={(e) => handleFieldChange('email', e.target.value)}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomTextField
            fullWidth
            label="Mobile"
            placeholder="Beneficiary Mobile"
            value={formFields.mobile}
            onChange={(e) => handleFieldChange('mobile', e.target.value)}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomTextField
            fullWidth
            label="Account Number/IBAN *"
            placeholder="Account number or IBAN"
            value={formFields.accountNumber}
            onChange={(e) => handleFieldChange('accountNumber', e.target.value)}
          />
        </Grid>

        <Grid item xs={12}>
          <CustomTextField
            fullWidth
            multiline
            rows={2}
            label="Beneficiary Address *"
            placeholder="Complete address of the recipient"
            value={formFields.beneficiaryAddress}
            onChange={(e) => handleFieldChange('beneficiaryAddress', e.target.value)}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <CustomTextField
            fullWidth
            label="SWIFT/BIC Code *"
            placeholder="COBADEFFXXX"
            value={formFields.swiftCode}
            onChange={(e) => handleFieldChange('swiftCode', e.target.value)}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <CustomTextField
            fullWidth
            label="Bank Name *"
            placeholder="Recipient's bank name"
            value={formFields.bankName}
            onChange={(e) => handleFieldChange('bankName', e.target.value)}
          />
        </Grid>

        <Grid item xs={12}>
          <CustomTextField
            fullWidth
            multiline
            rows={2}
            label="Bank Address *"
            placeholder="Complete address of the recipient's bank"
            value={formFields.bankAddress}
            onChange={(e) => handleFieldChange('bankAddress', e.target.value)}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <CustomTextField
            fullWidth
            label="Currency *"
            value={formData.selectedCurrency || formData.toCurrency ||
              beneficiary.currency || "N/A"}
            InputProps={{ readOnly: true, disabled: true }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <CustomTextField
            fullWidth
            label="Amount *"
            placeholder="1000.00"
            type="number"
            value={formData.convertedAmount || ''}
            disabled
          />
        </Grid>

        <Grid item xs={12}>
          <CustomTextField
            fullWidth
            label="Intermediary Bank (Optional)"
            placeholder="Intermediary bank details if required"
            value={formFields.intermediaryBank}
            onChange={(e) => handleFieldChange('intermediaryBank', e.target.value)}
          />
        </Grid>

        <Grid item xs={12}>
          <CustomTextField
            fullWidth
            multiline
            rows={3}
            label="Transfer Message/Purpose"
            placeholder="Reason for transfer..."
            value={formFields.transferMessage}
            onChange={(e) => handleFieldChange('transferMessage', e.target.value)}
          />
        </Grid>
      
        {/* <Grid item xs={12} md={6}>
          <CustomSelect
              label="Country"
              value={formFields.country}
              options={countries.map(c => ({ label: c.name, value: c.id }))}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFieldChange('country', e.target.value)}
            >
            </CustomSelect>
        </Grid> */}
      </Grid>
    </Box>
  );

  // ACH Form Component
  const ACHForm = () => (
    <Box sx={{ p: 2 }} >
      <Typography variant="h6" sx={{ color: theme.palette.text.primary }}>
        ACH Transfer Details
      </Typography>
      <Typography variant="body2" className="form-subtitle">
        Automated Clearing House - USD transfers within the United States
      </Typography>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} md={6}>
          <CustomTextField
            fullWidth
            label="Routing Number (ABA) *"
            placeholder="021000021"
            value={formFields.routingNumber || formFields.bicSwift}
            onChange={(e) => handleFieldChange('routingNumber', e.target.value)}
          // helperText="9-digit bank routing number"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <CustomTextField
            fullWidth
            label="Account Number *"
            placeholder="1234567890"
            value={formFields.achAccountNumber}
            onChange={(e) => handleFieldChange('achAccountNumber', e.target.value)}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth>

            <Select
              value={formFields.accountType}
              onChange={(e) => handleFieldChange('accountType', e.target.value)}
            >
              <MenuItem value="checking">Checking Account</MenuItem>
              <MenuItem value="savings">Savings Account</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <CustomTextField
            fullWidth
            label="Beneficiary Name *"
            placeholder="John Doe"
            value={formFields.achBeneficiaryName}
            onChange={(e) => handleFieldChange('achBeneficiaryName', e.target.value)}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomTextField
            fullWidth
            label="Email"
            placeholder="Beneficiary Email"
            value={formFields.email}
            onChange={(e) => handleFieldChange('email', e.target.value)}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomTextField
            fullWidth
            label="Mobile"
            placeholder="Beneficiary Mobile"
            value={formFields.mobile}
            onChange={(e) => handleFieldChange('mobile', e.target.value)}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomTextField
            fullWidth
            label="Amount (USD) *"
            placeholder="1000.00"
            type="number"
            value={formData.convertedAmount || ''}
            disabled
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <Select
              value={formFields.transactionCode}
              onChange={(e) => handleFieldChange('transactionCode', e.target.value)}
            >
              <MenuItem value="credit">Credit (Receiving funds)</MenuItem>
              <MenuItem value="debit">Debit (Sending funds)</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <Select
              value={formFields.entryClassCode}
              onChange={(e) => handleFieldChange('entryClassCode', e.target.value)}
            >
              <MenuItem value="PPD">PPD - Personal</MenuItem>
              <MenuItem value="CCD">CCD - Corporate</MenuItem>
              <MenuItem value="WEB">WEB - Internet</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <CustomTextField
            fullWidth
            label="Payment Description"
            placeholder="Salary, Invoice payment, etc."
            value={formFields.paymentDescription}
            onChange={(e) => handleFieldChange('paymentDescription', e.target.value)}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <CustomTextField
            fullWidth
            label="Bank Name"
            placeholder="Bank Name"
            value={formFields.bankName}
            onChange={(e) => handleFieldChange('bankName', e.target.value)}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomTextField
            fullWidth
            label="Beneficiary Address"
            placeholder="Beneficiary Address"
            value={formFields.address || formFields.beneficiaryAddress}
            onChange={(e) => handleFieldChange('address', e.target.value)}
          />
        </Grid>
      </Grid>
    </Box>
  );

  const beneficiary = formData.beneficiaryData || {};
  console.log('Beneficiary Data:', beneficiary);
  // Pre-fill form fields from beneficiary when beneficiary changes
  React.useEffect(() => {
    if (beneficiary && Object.keys(beneficiary).length > 0) {
      console.log('Setting beneficiaryAddress from:', beneficiary.address);

      setFormFields(prev => ({
        ...prev,
        // SEPA
        iban: beneficiary.iban || prev.iban,
        bicSwift: beneficiary.bic_code || prev.bicSwift,
        beneficiaryName: beneficiary.name || prev.beneficiaryName,
         mobile: beneficiary.mobile,
         email: beneficiary.email,
        // SWIFT
        accountNumber: beneficiary.iban || prev.accountNumber,
        swiftCode: beneficiary.bic_code || prev.swiftCode,
        bankName: beneficiary.bankName || prev.bankName,
        beneficiaryAddress: beneficiary.address || prev.beneficiaryAddress,
        // ACH
        achAccountNumber: beneficiary.iban || prev.achAccountNumber,
        achBeneficiaryName: beneficiary.name || prev.achBeneficiaryName,
        // You can add more mappings as needed
      }));
    }
    // eslint-disable-next-line
  }, [beneficiary?._id]);

  return (
    <Box className="transfer-method-step">
      <Typography variant="h6" className="step-title">
        Choose Transfer Method
      </Typography>
      <Typography variant="body2" className="step-description">
        {staticMethod
          ? `Transfer method is automatically selected based on your destination currency.`
          : 'Select how you want to send money and fill in the required details'}
      </Typography>


      {/* Method Selection Cards */}
      <Grid container spacing={3} className="transfer-methods" sx={{ mt: 2, mb: 4 }}>
        {transferMethods.map((method, index) => {
          const IconComponent = method.icon;
          // If staticMethod is set, only show the selected method
          if (staticMethod && method.id !== staticMethod) return null;
          return (
            <Grid item xs={12} sm={4} key={method.id}>
              <Card
                className={`transfer-method-card ${selectedMethod === method.id ? 'selected' : ''}`}
                onClick={() => !staticMethod && handleMethodSelect(method.id)}
                sx={{
                  cursor: staticMethod ? 'not-allowed' : 'pointer',
                  border: selectedMethod === method.id ? '2px solid #483594' : '2px solid #e0e0e0',
                  '&:hover': staticMethod ? {} : {
                    borderColor: '#483594',
                    boxShadow: '0 4px 16px rgba(72, 53, 148, 0.15)',
                  }
                }}
              >
                <CardContent className="method-content" sx={{ p: 2, textAlign: 'center' }}>
                  <Box className="method-icon" sx={{ mb: 1 }}>
                    <IconComponent size={24} />
                  </Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {method.title}
                  </Typography>
                  <Typography variant="caption" sx={{ display: 'block', color: 'text.primary', mb: 1 }}>
                    {method.region}
                  </Typography>
                  <Chip
                    label={`${method.fee} • ${method.time}`}
                    size="small"
                    sx={{ fontSize: '0.75rem', padding: '0.3rem' }}
                  />
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <Divider sx={{ my: 3 }} />

      {/* Tab Navigation and Forms */}
      <Box className="transfer-forms-section">
        <Tabs
          value={activeTab}
          onChange={staticMethod ? undefined : handleTabChange}
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
            },
            pointerEvents: staticMethod ? 'none' : 'auto',
            opacity: staticMethod ? 0.6 : 1,
          }}
        >
          {/* Only show the selected tab if staticMethod is set */}
          {(!staticMethod || staticMethod === 'sepa') && <Tab label="SEPA" />}
          {(!staticMethod || staticMethod === 'swift') && <Tab label="SWIFT" />}
          {(!staticMethod || staticMethod === 'ach') && <Tab label="ACH" />}
        </Tabs>

        <Box className="form-container-transfer" sx={{ mt: 3 }}>
          {/* Only show the selected form if staticMethod is set */}
          {(activeTab === 0 && (!staticMethod || staticMethod === 'sepa')) && <SEPAForm />}
          {(activeTab === 1 && (!staticMethod || staticMethod === 'swift')) && <SWIFTForm />}
          {(activeTab === 2 && (!staticMethod || staticMethod === 'ach')) && <ACHForm />}
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
            >
              Back
            </CustomButton>
          </Grid>
          <Grid item xs={6}>
            <CustomButton
              onClick={handleContinue}
              fullWidth
              className="continue-button"
            >
              Continue
            </CustomButton>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default TransferMethodStep;

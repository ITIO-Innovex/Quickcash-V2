
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
  const [selectedMethod, setSelectedMethod] = useState(formData.transferMethod || 'sepa');
  const [activeTab, setActiveTab] = useState(0);
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
  });

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
  };

  const handleContinue = () => {
    updateFormData({ 
      transferMethod: selectedMethod,
      transferFormData: formFields
    });
    onNext();
  };

  // SEPA Form Component
  const SEPAForm = () => (
    <Box sx={{p:2}}>
      <Typography variant="h6"  sx={{color:theme.palette.text.primary}}>
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
            value={formFields.amount}
            onChange={(e) => handleFieldChange('amount', e.target.value)}
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
      </Grid>
    </Box>
  );

  // SWIFT Form Component
  const SWIFTForm = () => (
    <Box sx={{p:2}}>
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
          <FormControl fullWidth>
            <InputLabel sx={{color:theme.palette.text.primary}}>Currency *</InputLabel>
            <Select
              value={formFields.currency}
              onChange={(e) => handleFieldChange('currency', e.target.value)}
            >
              <MenuItem value="USD">USD - US Dollar</MenuItem>
              <MenuItem value="EUR">EUR - Euro</MenuItem>
              <MenuItem value="GBP">GBP - British Pound</MenuItem>
              <MenuItem value="INR">INR - Indian Rupee</MenuItem>
              <MenuItem value="CAD">CAD - Canadian Dollar</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <CustomTextField
            fullWidth
            label="Amount *"
            placeholder="1000.00"
            type="number"
            value={formFields.amount}
            onChange={(e) => handleFieldChange('amount', e.target.value)}
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
      </Grid>
    </Box>
  );

  // ACH Form Component
  const ACHForm = () => (
    <Box sx={{p:2}} >
      <Typography variant="h6" sx={{color:theme.palette.text.primary}}>
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
            value={formFields.routingNumber}
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
            label="Amount (USD) *"
            placeholder="1000.00"
            type="number"
            value={formFields.achAmount}
            onChange={(e) => handleFieldChange('achAmount', e.target.value)}
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
      </Grid>
    </Box>
  );

  return (
    <Box className="transfer-method-step">
      <Typography variant="h6" className="step-title">
        Choose Transfer Method
      </Typography>
      <Typography variant="body2" className="step-description">
        Select how you want to send money and fill in the required details
      </Typography>

      {/* Method Selection Cards */}
      <Grid container spacing={3} className="transfer-methods" sx={{ mt: 2, mb: 4 }}>
        {transferMethods.map((method, index) => {
          const IconComponent = method.icon;
          return (
            <Grid item xs={12} sm={4} key={method.id}>
              <Card
                className={`transfer-method-card ${
                  selectedMethod === method.id ? 'selected' : ''
                }`}
                onClick={() => handleMethodSelect(method.id)}
                sx={{
                  cursor: 'pointer',
                  border: selectedMethod === method.id ? '2px solid #483594' : '2px solid #e0e0e0',
                  '&:hover': {
                    borderColor: '#483594',
                    boxShadow: '0 4px 16px rgba(72, 53, 148, 0.15)',
                  }
                }}
              >
                <CardContent className="method-content" sx={{ p: 2, textAlign: 'center' }}>
                  <Box className="method-icon" sx={{ mb: 1 }}>
                    <IconComponent size={24}  />
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
                    sx={{ fontSize: '0.75rem' ,padding:'0.3rem'}} 
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
          <Tab label="SEPA" />
          <Tab label="SWIFT" />
          <Tab label="ACH" />
        </Tabs>

        <Box className="form-container-transfer" sx={{ mt: 3 }}>
          {activeTab === 0 && <SEPAForm />}
          {activeTab === 1 && <SWIFTForm />}
          {activeTab === 2 && <ACHForm />}
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

import React from 'react';
import {
  Box,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
} from "@mui/material";
import { MapPin, Globe, Building2 } from 'lucide-react';
import CustomTextField from '@/components/CustomTextField';
import { TransferMethod, TransferFormData } from '@/api/transfer.api';

interface FallbackTransferFormProps {
  transferMethod: TransferMethod;
  formData: TransferFormData;
  onFormDataChange: (data: TransferFormData) => void;
  errors?: Record<string, string>;
}

const iconMap = {
  MapPin: MapPin,
  Globe: Globe,
  Building2: Building2,
};

const FallbackTransferForm: React.FC<FallbackTransferFormProps> = ({
  transferMethod,
  formData,
  onFormDataChange,
  errors = {}
}) => {
  const theme = useTheme();
  const IconComponent = iconMap[transferMethod.icon as keyof typeof iconMap];

  const handleFieldChange = (fieldName: string, value: any) => {
    onFormDataChange({
      ...formData,
      [fieldName]: value
    });
  };

  const renderSEPAForm = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <CustomTextField
          fullWidth
          label="IBAN *"
          placeholder="DE89 3704 0044 0532 0130 00"
          value={formData.iban || ''}
          onChange={(e) => handleFieldChange('iban', e.target.value)}
          error={!!errors.iban}
          helperText={errors.iban || 'International Bank Account Number'}
          required
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <CustomTextField
          fullWidth
          label="BIC/SWIFT Code"
          placeholder="COBADEFFXXX"
          value={formData.bicSwift || ''}
          onChange={(e) => handleFieldChange('bicSwift', e.target.value)}
          error={!!errors.bicSwift}
          helperText={errors.bicSwift || 'Optional for SEPA transfers'}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <CustomTextField
          fullWidth
          label="Beneficiary Name *"
          placeholder="John Doe"
          value={formData.beneficiaryName || ''}
          onChange={(e) => handleFieldChange('beneficiaryName', e.target.value)}
          error={!!errors.beneficiaryName}
          helperText={errors.beneficiaryName}
          required
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <CustomTextField
          fullWidth
          label="Amount (EUR) *"
          placeholder="1000.00"
          type="number"
          value={formData.amount || ''}
          onChange={(e) => handleFieldChange('amount', e.target.value)}
          error={!!errors.amount}
          helperText={errors.amount}
          required
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <CustomTextField
          fullWidth
          label="Execution Date"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={formData.executionDate || ''}
          onChange={(e) => handleFieldChange('executionDate', e.target.value)}
          error={!!errors.executionDate}
          helperText={errors.executionDate}
        />
      </Grid>
      <Grid item xs={12}>
        <CustomTextField
          fullWidth
          label="Purpose/Reference"
          placeholder="Invoice payment, salary, etc."
          value={formData.purpose || ''}
          onChange={(e) => handleFieldChange('purpose', e.target.value)}
          error={!!errors.purpose}
          helperText={errors.purpose}
        />
      </Grid>
      <Grid item xs={12}>
        <CustomTextField
          fullWidth
          multiline
          rows={3}
          label="Remittance Information"
          placeholder="Additional payment details..."
          value={formData.remittanceInfo || ''}
          onChange={(e) => handleFieldChange('remittanceInfo', e.target.value)}
          error={!!errors.remittanceInfo}
          helperText={errors.remittanceInfo}
        />
      </Grid>
    </Grid>
  );

  const renderSWIFTForm = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <CustomTextField
          fullWidth
          label="Beneficiary Name *"
          placeholder="John Doe"
          value={formData.beneficiaryName || ''}
          onChange={(e) => handleFieldChange('beneficiaryName', e.target.value)}
          error={!!errors.beneficiaryName}
          helperText={errors.beneficiaryName}
          required
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <CustomTextField
          fullWidth
          label="Account Number/IBAN *"
          placeholder="Account number or IBAN"
          value={formData.accountNumber || ''}
          onChange={(e) => handleFieldChange('accountNumber', e.target.value)}
          error={!!errors.accountNumber}
          helperText={errors.accountNumber}
          required
        />
      </Grid>
      <Grid item xs={12}>
        <CustomTextField
          fullWidth
          multiline
          rows={2}
          label="Beneficiary Address *"
          placeholder="Complete address of the recipient"
          value={formData.beneficiaryAddress || ''}
          onChange={(e) => handleFieldChange('beneficiaryAddress', e.target.value)}
          error={!!errors.beneficiaryAddress}
          helperText={errors.beneficiaryAddress}
          required
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <CustomTextField
          fullWidth
          label="SWIFT/BIC Code *"
          placeholder="COBADEFFXXX"
          value={formData.swiftCode || ''}
          onChange={(e) => handleFieldChange('swiftCode', e.target.value)}
          error={!!errors.swiftCode}
          helperText={errors.swiftCode}
          required
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <CustomTextField
          fullWidth
          label="Bank Name *"
          placeholder="Recipient's bank name"
          value={formData.bankName || ''}
          onChange={(e) => handleFieldChange('bankName', e.target.value)}
          error={!!errors.bankName}
          helperText={errors.bankName}
          required
        />
      </Grid>
      <Grid item xs={12}>
        <CustomTextField
          fullWidth
          multiline
          rows={2}
          label="Bank Address *"
          placeholder="Complete address of the recipient's bank"
          value={formData.bankAddress || ''}
          onChange={(e) => handleFieldChange('bankAddress', e.target.value)}
          error={!!errors.bankAddress}
          helperText={errors.bankAddress}
          required
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <FormControl fullWidth error={!!errors.currency}>
          <InputLabel sx={{ color: theme.palette.text.primary }}>Currency *</InputLabel>
          <Select
            value={formData.currency || ''}
            onChange={(e) => handleFieldChange('currency', e.target.value)}
            label="Currency *"
          >
            <MenuItem value="USD">USD - US Dollar</MenuItem>
            <MenuItem value="EUR">EUR - Euro</MenuItem>
            <MenuItem value="GBP">GBP - British Pound</MenuItem>
            <MenuItem value="INR">INR - Indian Rupee</MenuItem>
            <MenuItem value="CAD">CAD - Canadian Dollar</MenuItem>
          </Select>
          {errors.currency && (
            <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
              {errors.currency}
            </Typography>
          )}
        </FormControl>
      </Grid>
      <Grid item xs={12} md={6}>
        <CustomTextField
          fullWidth
          label="Amount *"
          placeholder="1000.00"
          type="number"
          value={formData.amount || ''}
          onChange={(e) => handleFieldChange('amount', e.target.value)}
          error={!!errors.amount}
          helperText={errors.amount}
          required
        />
      </Grid>
      <Grid item xs={12}>
        <CustomTextField
          fullWidth
          label="Intermediary Bank (Optional)"
          placeholder="Intermediary bank details if required"
          value={formData.intermediaryBank || ''}
          onChange={(e) => handleFieldChange('intermediaryBank', e.target.value)}
          error={!!errors.intermediaryBank}
          helperText={errors.intermediaryBank}
        />
      </Grid>
      <Grid item xs={12}>
        <CustomTextField
          fullWidth
          multiline
          rows={3}
          label="Transfer Message/Purpose"
          placeholder="Reason for transfer..."
          value={formData.transferMessage || ''}
          onChange={(e) => handleFieldChange('transferMessage', e.target.value)}
          error={!!errors.transferMessage}
          helperText={errors.transferMessage}
        />
      </Grid>
    </Grid>
  );

  const renderACHForm = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <CustomTextField
          fullWidth
          label="Routing Number (ABA) *"
          placeholder="021000021"
          value={formData.routingNumber || ''}
          onChange={(e) => handleFieldChange('routingNumber', e.target.value)}
          error={!!errors.routingNumber}
          helperText={errors.routingNumber || '9-digit bank routing number'}
          required
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <CustomTextField
          fullWidth
          label="Account Number *"
          placeholder="1234567890"
          value={formData.achAccountNumber || ''}
          onChange={(e) => handleFieldChange('achAccountNumber', e.target.value)}
          error={!!errors.achAccountNumber}
          helperText={errors.achAccountNumber}
          required
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <FormControl fullWidth>
          <InputLabel>Account Type</InputLabel>
          <Select
            value={formData.accountType || 'checking'}
            onChange={(e) => handleFieldChange('accountType', e.target.value)}
            label="Account Type"
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
          value={formData.achBeneficiaryName || ''}
          onChange={(e) => handleFieldChange('achBeneficiaryName', e.target.value)}
          error={!!errors.achBeneficiaryName}
          helperText={errors.achBeneficiaryName}
          required
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <CustomTextField
          fullWidth
          label="Amount (USD) *"
          placeholder="1000.00"
          type="number"
          value={formData.achAmount || ''}
          onChange={(e) => handleFieldChange('achAmount', e.target.value)}
          error={!!errors.achAmount}
          helperText={errors.achAmount}
          required
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <FormControl fullWidth>
          <InputLabel>Transaction Type</InputLabel>
          <Select
            value={formData.transactionCode || 'credit'}
            onChange={(e) => handleFieldChange('transactionCode', e.target.value)}
            label="Transaction Type"
          >
            <MenuItem value="credit">Credit (Receiving funds)</MenuItem>
            <MenuItem value="debit">Debit (Sending funds)</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} md={6}>
        <FormControl fullWidth>
          <InputLabel>Entry Class Code</InputLabel>
          <Select
            value={formData.entryClassCode || 'PPD'}
            onChange={(e) => handleFieldChange('entryClassCode', e.target.value)}
            label="Entry Class Code"
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
          value={formData.paymentDescription || ''}
          onChange={(e) => handleFieldChange('paymentDescription', e.target.value)}
          error={!!errors.paymentDescription}
          helperText={errors.paymentDescription}
        />
      </Grid>
    </Grid>
  );

  const renderForm = () => {
    switch (transferMethod.methodId) {
      case 'sepa':
        return renderSEPAForm();
      case 'swift':
        return renderSWIFTForm();
      case 'ach':
        return renderACHForm();
      default:
        return renderSEPAForm();
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        {IconComponent && (
          <Box sx={{ mr: 1 }}>
            <IconComponent size={24} />
          </Box>
        )}
        <Box>
          <Typography variant="h6" sx={{ color: theme.palette.text.primary }}>
            {transferMethod.title} Details
          </Typography>
          <Typography variant="body2" className="form-subtitle">
            {transferMethod.description}
          </Typography>
        </Box>
      </Box>

      {renderForm()}

      {/* Transfer Method Info */}
      <Box sx={{ mt: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: 1, borderColor: 'divider' }}>
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
          Transfer Information
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6} sm={3}>
            <Typography variant="caption" color="text.secondary">
              Region
            </Typography>
            <Typography variant="body2">
              {transferMethod.region}
            </Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="caption" color="text.secondary">
              Currency
            </Typography>
            <Typography variant="body2">
              {transferMethod.currency}
            </Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="caption" color="text.secondary">
              Fee
            </Typography>
            <Typography variant="body2">
              ${transferMethod.fee.toFixed(2)}
            </Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="caption" color="text.secondary">
              Processing Time
            </Typography>
            <Typography variant="body2">
              {transferMethod.time}
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default FallbackTransferForm; 
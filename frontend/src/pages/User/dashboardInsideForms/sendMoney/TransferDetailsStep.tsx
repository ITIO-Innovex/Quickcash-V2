import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Divider,
  Chip,
  Alert,
} from "@mui/material";
import { CheckCircle, Clock, Receipt, MapPin, Building2, Globe, Info } from 'lucide-react';
import CustomButton from '@/components/CustomButton';
import api from '@/helpers/apiHelper';
import { useTheme } from '@mui/material/styles';
import { jwtDecode } from 'jwt-decode';
import { JwtPayload } from '@/types/jwt';

interface TransferDetailsStepProps {
  formData: any;
  updateFormData: (data: any) => void;
  onPrevious: () => void;
  onShowStatusModal: (status: 'pending' | 'success' | 'error') => void;
  pending?: boolean;
}

const TransferDetailsStep: React.FC<TransferDetailsStepProps> = ({
  formData,
  onPrevious,
  onShowStatusModal,
  pending = false,
}) => {
  const theme = useTheme();

  const handleSubmit = async () => {
    // Show pending status modal
    onShowStatusModal('pending');
    console.log("confirm transfer")
  };

  // Calculate dynamic values
  const sendAmount = parseFloat(formData.fromAmount || formData.sendAmount || '0');
  const receiveAmount = parseFloat(formData.convertedValue || formData.receiveAmount || '0');
  const feeAmount = parseFloat(formData.feeCharge || '0');
  const totalAmount = sendAmount + feeAmount;
  const exchangeRate = formData.Rate || (receiveAmount / sendAmount).toFixed(4);

  // Get transfer method details
  const getTransferMethodDetails = () => {
    const methodMap: { [key: string]: { title: string; time: string; icon: any; description: string; fee: number } } = {
      sepa: { title: 'SEPA Transfer', time: '1-2 business days', icon: MapPin, description: 'Single Euro Payments Area', fee: 3.50 },
      swift: { title: 'SWIFT Wire', time: '1-5 business days', icon: Globe, description: 'International wire transfer', fee: 15.00 },
      ach: { title: 'ACH Transfer', time: '1-3 business days', icon: Building2, description: 'Automated Clearing House', fee: 2.00 },
      bank: { title: 'Bank Transfer', time: '1-3 business days', icon: Building2, description: 'Standard bank transfer', fee: 5.00 },
    };
    
    const method = formData.transferMethod || 'bank';
    return methodMap[method] || methodMap.bank;
  };

  const transferMethodDetails = getTransferMethodDetails();
  const IconComponent = transferMethodDetails.icon;

  // Calculate arrival date
  const getArrivalDate = () => {
    const today = new Date();
    let daysToAdd = 3; // default
    
    switch (formData.transferMethod) {
      case 'sepa': daysToAdd = 2; break;
      case 'swift': daysToAdd = 5; break;
      case 'ach': daysToAdd = 3; break;
      default: daysToAdd = 3;
    }
    
    const arrival = new Date(today.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
    return arrival.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Format currency amounts
  const formatCurrency = (amount: number, currency: string) => {
    // Extract currency code from format like "USD-accountId-country" or just "USD"
    const currencyCode = currency ? currency.split('-')[0] : 'USD';
    
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount);
    } catch (error) {
      // Fallback formatting if currency code is invalid
      return `${currencyCode} ${amount.toFixed(2)}`;
    }
  };

  // Helper function to extract currency code from various formats
  const getCurrencyCode = (currencyData: string) => {
    if (!currencyData) return 'USD';
    return currencyData.split('-')[0];
  };

  // Get beneficiary information
  const beneficiaryInfo = formData.beneficiaryData || {};
  const hasBeneficiary = Object.keys(beneficiaryInfo).length > 0;

  return (
    <Box className="transfer-details-step">
      <Typography variant="h6" className="summary-title" sx={{ mb: 1 }}>
        Transaction Summary
      </Typography>
      <Typography variant="body2" className="step-description" sx={{ mb: 3, color: theme.palette.text.secondary }}>
        Review your transfer details before confirming
      </Typography>

      {/* Beneficiary Information */}
      {hasBeneficiary && (
        <Box sx={{ mb: 3, p: 2, bgcolor: theme.palette.background.paper, borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: theme.palette.primary.main }}>
            Recipient Details
          </Typography>
          <Typography variant="body2" sx={{ mb: 0.5 }}>
            <strong>Name:</strong> {beneficiaryInfo.name || 'Not specified'}
          </Typography>
          <Typography variant="body2" sx={{ mb: 0.5 }}>
            <strong>Account:</strong> {beneficiaryInfo.accountNumber || 'Not specified'}
          </Typography>
          <Typography variant="body2" sx={{ mb: 0.5 }}>
            <strong>Country:</strong> {beneficiaryInfo.country || formData.selectedCountry || 'Not specified'}
          </Typography>
          <Typography variant="body2">
            <strong>Currency:</strong> {getCurrencyCode(beneficiaryInfo.currency || formData.toCurrency) || 'Not specified'}
          </Typography>
        </Box>
      )}

      {/* Transfer Method Information */}
      <Box sx={{ mb: 3, p: 2, bgcolor: theme.palette.background.paper, borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <IconComponent size={20} style={{ marginRight: 8, color: theme.palette.primary.main }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
            Transfer Method
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ mb: 0.5 }}>
          <strong>{transferMethodDetails.title}</strong>
        </Typography>
        <Typography variant="body2" sx={{ mb: 0.5, color: theme.palette.text.secondary }}>
          {transferMethodDetails.description}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Clock size={16} />
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
            Arrives by {getArrivalDate()}
          </Typography>
        </Box>
      </Box>

      {/* Amount Details */}
      <Box sx={{ mb: 3, p: 2, bgcolor: theme.palette.background.paper, borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: theme.palette.primary.main }}>
          Transfer Amounts
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2">Send Amount:</Typography>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {formatCurrency(sendAmount, getCurrencyCode(formData.fromCurrency))}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2">Receive Amount:</Typography>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {formatCurrency(receiveAmount, getCurrencyCode(formData.toCurrency))}
          </Typography>
        </Box>

        <Divider sx={{ my: 1 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2">Transfer Fee:</Typography>
          <Typography variant="body2" sx={{ fontWeight: 500, color: theme.palette.error.main }}>
            {formatCurrency(feeAmount, getCurrencyCode(formData.fromCurrency))}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2">Exchange Rate:</Typography>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            1 {getCurrencyCode(formData.fromCurrency)} = {exchangeRate} {getCurrencyCode(formData.toCurrency)}
          </Typography>
        </Box>

        <Divider sx={{ my: 1 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="body1" sx={{ fontWeight: 600 }}>Total Amount:</Typography>
          <Typography variant="body1" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
            {formatCurrency(totalAmount, getCurrencyCode(formData.fromCurrency))}
          </Typography>
        </Box>
      </Box>

      {/* Additional Transfer Details */}
      {formData.transferFormData && Object.keys(formData.transferFormData).length > 0 && (
        <Box sx={{ mb: 3, p: 2, bgcolor: theme.palette.background.paper, borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: theme.palette.primary.main }}>
            Transfer Details
          </Typography>
          {Object.entries(formData.transferFormData).map(([key, value]: [string, any]) => (
            <Box key={key} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 500, maxWidth: '60%', textAlign: 'right' }}>
                {typeof value === 'string' && value.length > 30 ? `${value.substring(0, 30)}...` : value}
              </Typography>
            </Box>
          ))}
        </Box>
      )}

      {/* Security and Information */}
      <Box sx={{ mb: 3 }}>
        <Alert severity="success" icon={<CheckCircle />} sx={{ mb: 2 }}>
          Your transfer is secured with bank-level encryption and will be processed securely.
        </Alert>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2, bgcolor: theme.palette.info.light, borderRadius: 1 }}>
          <Receipt size={16} />
          <Typography variant="body2" sx={{ color: theme.palette.info.dark }}>
            Transaction ID will be generated upon confirmation
          </Typography>
        </Box>
      </Box>

      {/* Pending Status Alert (shows above action buttons) */}
      {pending && (
        <Alert severity="info" icon={<Info />} sx={{ mb: 3 }}>
          Your transfer is <strong>pending admin approval</strong>.
        </Alert>
      )}

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
              onClick={handleSubmit}
              fullWidth
              className="submit-button"
            >
              Confirm Transfer
            </CustomButton>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default TransferDetailsStep;

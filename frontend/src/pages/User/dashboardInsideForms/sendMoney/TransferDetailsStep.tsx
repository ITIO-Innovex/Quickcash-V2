
import React from 'react';
import {
  Box,
  Typography,
  Grid,
} from "@mui/material";
import { CheckCircle } from 'lucide-react';
import CustomButton from '@/components/CustomButton';

interface TransferDetailsStepProps {
  formData: any;
  updateFormData: (data: any) => void;
  onPrevious: () => void;
}

const TransferDetailsStep: React.FC<TransferDetailsStepProps> = ({
  formData,
  onPrevious,
}) => {
  const handleSubmit = () => {
    console.log('Transfer submitted:', formData);
    // Handle transfer submission
  };

  return (
    <Box className="transfer-details-step">
           <Typography variant="h6" className="summary-title">
            Transaction Summary
          </Typography>
          <Typography variant="body2" className="step-description">
        Review your transfer details before confirming
      </Typography>
          
          <Box className="summary-item" sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
            <Typography className="summary-label">Send Amount:</Typography>
            <Typography className="summary-value">{formData.sendAmount || '0.00'} {formData.fromCurrency || 'USD'}</Typography>
          </Box>
          
          <Box className="summary-item" sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
            <Typography className="summary-label">Receive Amount:</Typography>
            <Typography className="summary-value">{formData.receiveAmount || '0.00'} {formData.toCurrency || 'USD'}</Typography>
          </Box>
          
          <Box className="summary-item" sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
            <Typography className="summary-label">Transfer Method:</Typography>
            <Typography className="summary-value">{formData.transferMethod || 'Bank Transfer'}</Typography>
          </Box>
          
          <Box className="summary-item" sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
            <Typography className="summary-label">Destination:</Typography>
            <Typography className="summary-value">{formData.selectedCountry || 'Not selected'}</Typography>
          </Box>
          
          <Box className="summary-item total" sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
            <Typography className="summary-label" sx={{ fontWeight: 600 }}>Total Amount:</Typography>
            <Typography className="summary-value" sx={{ fontWeight: 600, color: '#483594' }}>
              {formData.sendAmount ? (parseFloat(formData.sendAmount) + 5).toFixed(2) : '5.00'} {formData.fromCurrency || 'USD'}
            </Typography>
          </Box>

          <Box className="security-note" sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2, p: 2, bgcolor: '#f8f9fa', borderRadius: 1 }}>
            <CheckCircle size={20} color="#4caf50" />
            <Typography className="security-text" sx={{ color: '#4caf50', fontSize: '0.875rem' }}>
              Your transfer is secured with bank-level encryption
            </Typography>
          </Box>

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

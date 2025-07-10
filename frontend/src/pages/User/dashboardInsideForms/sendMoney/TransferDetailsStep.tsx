
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
  const [isPending, setIsPending] = React.useState(false);
  const [pendingMessage, setPendingMessage] = React.useState('');

  const handleSubmit = async () => {
    try {
      setIsPending(true);
      setPendingMessage('Submitting your transfer...');

      // Mock API call to simulate backend transaction creation
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate network delay

      // Simulate successful submission
      setPendingMessage('Your transaction is pending admin approval.');
      // Optionally, start polling for status here
    } catch (error) {
      setIsPending(false);
      setPendingMessage('An error occurred. Please try again.');
    }
  };

  return (
    <Box className="transfer-details-step">
           <Typography variant="h6" className="summary-title">
            Transaction Summary
          </Typography>
          <Typography variant="body2" className="step-description">
        Review your transfer details before confirming
      </Typography>
          
      {/* Fee, Amount, Net Pay Section */}
      <Box className="fee-netpay-section" sx={{ mt: 2, mb: 2, p: 2, bgcolor: '#f9f9fb', borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
          <Typography>Send Amount:</Typography>
          <Typography>{formData.sendAmount || '0.00'} {formData.fromCurrency || 'USD'}</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
          <Typography>Fee:</Typography>
          <Typography>{formData.feeCharge !== undefined ? formData.feeCharge : '0.00'} {formData.fromCurrency || 'USD'}</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
          <Typography>Net Pay (after fee):</Typography>
          <Typography>
            {formData.sendAmount && formData.feeCharge !== undefined
              ? (parseFloat(formData.sendAmount) - parseFloat(formData.feeCharge)).toFixed(2)
              : '0.00'} {formData.fromCurrency || 'USD'}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
          <Typography>Converted Amount (Receive):</Typography>
          <Typography>{formData.receiveAmount || '0.00'}</Typography>
        </Box>
      </Box>

      {/* Transfer Method Details Section */}
      {formData.transferMethod && formData.transferFormData && (
        <Box className="transfer-method-details" sx={{ mt: 3, mb: 2, p: 2, bgcolor: '#f4f6fa', borderRadius: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
            Transfer Method Details
          </Typography>
          {formData.transferMethod === 'sepa' && (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                <Typography>IBAN:</Typography>
                <Typography>{formData.transferFormData.iban || '-'}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                <Typography>BIC/SWIFT:</Typography>
                <Typography>{formData.transferFormData.bicSwift || '-'}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                <Typography>Beneficiary Name:</Typography>
                <Typography>{formData.transferFormData.beneficiaryName || '-'}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                <Typography>Purpose/Reference:</Typography>
                <Typography>{formData.transferFormData.purpose || '-'}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                <Typography>Remittance Info:</Typography>
                <Typography>{formData.transferFormData.remittanceInfo || '-'}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                <Typography>Execution Date:</Typography>
                <Typography>{formData.transferFormData.executionDate || '-'}</Typography>
              </Box>
            </>
          )}
          {formData.transferMethod === 'swift' && (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                <Typography>Beneficiary Name:</Typography>
                <Typography>{formData.transferFormData.beneficiaryName || '-'}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                <Typography>Account Number/IBAN:</Typography>
                <Typography>{formData.transferFormData.accountNumber || '-'}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                <Typography>Beneficiary Address:</Typography>
                <Typography>{formData.transferFormData.beneficiaryAddress || '-'}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                <Typography>SWIFT/BIC Code:</Typography>
                <Typography>{formData.transferFormData.swiftCode || '-'}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                <Typography>Bank Name:</Typography>
                <Typography>{formData.transferFormData.bankName || '-'}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                <Typography>Bank Address:</Typography>
                <Typography>{formData.transferFormData.bankAddress || '-'}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                <Typography>Currency:</Typography>
                <Typography>{formData.selectedCurrency || '-'}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                <Typography>Intermediary Bank:</Typography>
                <Typography>{formData.transferFormData.intermediaryBank || '-'}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                <Typography>Transfer Message/Purpose:</Typography>
                <Typography>{formData.transferFormData.transferMessage || '-'}</Typography>
              </Box>
            </>
          )}
          {formData.transferMethod === 'ach' && (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                <Typography>Routing Number (ABA):</Typography>
                <Typography>{formData.transferFormData.routingNumber || '-'}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                <Typography>Account Number:</Typography>
                <Typography>{formData.transferFormData.achAccountNumber || '-'}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                <Typography>Account Type:</Typography>
                <Typography>{formData.transferFormData.accountType || '-'}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                <Typography>Beneficiary Name:</Typography>
                <Typography>{formData.transferFormData.achBeneficiaryName || '-'}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                <Typography>Transaction Code:</Typography>
                <Typography>{formData.transferFormData.transactionCode || '-'}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                <Typography>Entry Class Code:</Typography>
                <Typography>{formData.transferFormData.entryClassCode || '-'}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                <Typography>Payment Description:</Typography>
                <Typography>{formData.transferFormData.paymentDescription || '-'}</Typography>
              </Box>
            </>
          )}
        </Box>
      )}

          <Box className="security-note" sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2, p: 2, bgcolor: '#f8f9fa', borderRadius: 1 }}>
            <CheckCircle size={20} color="#4caf50" />
            <Typography className="security-text" sx={{ color: '#4caf50', fontSize: '0.875rem' }}>
              Your transfer is secured with bank-level encryption
            </Typography>
          </Box>

      {/* Pending Transaction Message */}
      {isPending && (
        <Box sx={{ mt: 2, mb: 2, p: 2, bgcolor: '#fff3cd', borderRadius: 2 }}>
          <Typography color="warning.main">{pendingMessage}</Typography>
        </Box>
      )}

      <Box className="step-actions" sx={{ mt: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <CustomButton
              onClick={onPrevious}
              fullWidth
              className="continue-button"
              disabled={isPending}
            >
              Back
            </CustomButton>
          </Grid>
          <Grid item xs={6}>
            <CustomButton
              onClick={handleSubmit}
              fullWidth
              className="submit-button"
              disabled={isPending}
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

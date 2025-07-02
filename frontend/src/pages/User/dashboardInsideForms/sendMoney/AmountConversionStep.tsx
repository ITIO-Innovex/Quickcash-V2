
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  InputAdornment,
} from "@mui/material";
import { ArrowUpDown } from 'lucide-react';
import CustomButton from '@/components/CustomButton';
import CustomTextField from '@/components/CustomTextField';

interface AmountConversionStepProps {
  formData: any;
  updateFormData: (data: any) => void;
  onNext: () => void;
  onPrevious: () => void;
}

const AmountConversionStep: React.FC<AmountConversionStepProps> = ({
  formData,
  updateFormData,
  onNext,
  onPrevious,
}) => {
  const [sendAmount, setSendAmount] = useState(formData.sendAmount || '');
  const [receiveAmount, setReceiveAmount] = useState(formData.receiveAmount || '');
  const [isEditingSend, setIsEditingSend] = useState(true);

  const exchangeRate = 1.25; // Mock exchange rate
  const fee = 5.00;

  useEffect(() => {
    if (sendAmount && isEditingSend) {
      const converted = (parseFloat(sendAmount) * exchangeRate).toFixed(2);
      setReceiveAmount(converted);
    } else if (receiveAmount && !isEditingSend) {
      const converted = (parseFloat(receiveAmount) / exchangeRate).toFixed(2);
      setSendAmount(converted);
    }
  }, [sendAmount, receiveAmount, isEditingSend]);

  const handleSendAmountChange = (value: string) => {
    setSendAmount(value);
    setIsEditingSend(true);
  };

  const handleReceiveAmountChange = (value: string) => {
    setReceiveAmount(value);
    setIsEditingSend(false);
  };

  const handleContinue = () => {
    if (sendAmount && receiveAmount) {
      updateFormData({ sendAmount, receiveAmount });
      onNext();
    }
  };

  return (
    <Box className="amount-conversion-step">
      <Typography variant="h6" className="step-title">
        Enter Amount
      </Typography>
      <Typography variant="body2" className="step-description">
        Enter the amount you want to send or receive
      </Typography>

      <Box className="conversion-container">
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={5}>
            <Box className="amount-field">
              <Typography className="field-label">You Send</Typography>
              <CustomTextField
                label={`Amount in ${formData.fromCurrency}`}
                value={sendAmount}
                onChange={(e) => handleSendAmountChange(e.target.value)}
                type="number"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      {formData.fromCurrency}
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          </Grid>

          <Grid item xs={12} md={2}>
            <Box className="conversion-icon">
              <ArrowUpDown size={24} className="exchange-icon" />
            </Box>
          </Grid>

          <Grid item xs={12} md={5}>
            <Box className="amount-field">
              <Typography className="field-label">Recipient Gets</Typography>
              <CustomTextField
                label={`Amount in ${formData.toCurrency}`}
                value={receiveAmount}
                onChange={(e) => handleReceiveAmountChange(e.target.value)}
                type="number"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      {formData.toCurrency}
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          </Grid>
        </Grid>

        <Box className="conversion-details">
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography className="detail-item">
                Exchange Rate: 1 {formData.fromCurrency} = {exchangeRate} {formData.toCurrency}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography className="detail-item">
                Transfer Fee: ${fee.toFixed(2)}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography className="total-amount">
                Total: {sendAmount ? (parseFloat(sendAmount) + fee).toFixed(2) : '0.00'} {formData.fromCurrency}
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Box>

      <Box className="step-actions">
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <CustomButton
              onClick={onPrevious}
              variant="outlined"
              fullWidth
              className="back-button"
            >
              Back
            </CustomButton>
          </Grid>
          <Grid item xs={6}>
            <CustomButton
              onClick={handleContinue}
              disabled={!sendAmount || !receiveAmount}
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

export default AmountConversionStep;

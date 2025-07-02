import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import CustomButton from '../../../components/CustomButton';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CustomDropdown from '../../../components/CustomDropdown';
import CustomInputField from '../../../components/CustomInputField';
import { Box, Card, CardContent, Typography, useTheme, LinearProgress, Stepper, Step, StepLabel, useMediaQuery, Checkbox, FormControlLabel, Radio, RadioGroup } from '@mui/material';

const ProceedPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [transferType, setTransferType] = useState('Bank Transfer');
  const [walletAddress, setWalletAddress] = useState('7hDWjpConT3b7nfitwkS3Qq4ipclisPcobFJ9Y8SNSfT2');
  const [isConfirmed, setIsConfirmed] = useState(false);

  const transactionData = location.state || {
    type: 'buy',
    amount: '200',
    currency: 'USD',
    coin: 'SOL',
    youReceive: '1.002958728248335'
  };

  console.log('ProceedPage - Transaction data:', transactionData);
  console.log('ProceedPage - Current step:', currentStep);
  console.log('ProceedPage - Is confirmed:', isConfirmed);

  const steps = ['Details', 'Confirm', 'Complete'];
  
  const transferOptions = [
    { label: 'Bank Transfer', value: 'Bank Transfer' },
    { label: 'Credit Card', value: 'Credit Card' },
    { label: 'Debit Card', value: 'Debit Card' },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate('/buysellswap');
    }
  };

  const handleComplete = () => {
    navigate('/buysellswap');
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Box className="proceed-content">
            <Typography variant="h6" className="proceed-title" sx={{ color: theme.palette.text.primary }}>
               {transactionData.type.toUpperCase()} Details
            </Typography>
            
            <Box className="proceed-grid" >
              <Box 
                className="proceed-amount-card"
              >
                <Typography variant="subtitle2" sx={{ mb: 1, }}>
                  Amount
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold', }}>
                  {transactionData.amount} {transactionData.currency}
                </Typography>
                <Typography variant="caption" >
                  Fees = 20 {transactionData.currency}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  Total Amount = {parseInt(transactionData.amount) + 20} {transactionData.currency}
                </Typography>
              </Box>

              <Box className="proceed-crypto-card" sx={{ backgroundColor: '#483594' }}>
                <Typography variant="subtitle2" className="proceed-crypto-subtitle">
                  You will get
                </Typography>
                <Typography variant="h6" className="proceed-crypto-amount">
                  {transactionData.youReceive} {transactionData.coin}
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  1USD = 0.0050+09256+021663 {transactionData.coin}
                </Typography>
              </Box>
            </Box>

            <Box className="proceed-field">
              <Typography variant="subtitle2" className="proceed-field-label" sx={{ color: theme.palette.text.primary }}>
                TRANSFER TYPE
              </Typography>
              <CustomDropdown
                label=""
                value={transferType}
                onChange={(e) => setTransferType(e.target.value as string)}
                options={transferOptions}
              />
            </Box>

            <Box className="proceed-field">
              <Typography variant="subtitle2" className="proceed-field-label" sx={{ color: theme.palette.text.primary }}>
                WALLET ADDRESS
              </Typography>
              <CustomInputField
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder="Enter wallet address"
              />
            </Box>

            {/* Confirmation checkbox for all transaction types */}
            <Box className="proceed-field">
              <FormControlLabel
                control={
                  <Checkbox
                    checked={isConfirmed}
                    onChange={(e) => {
                      console.log('ProceedPage - Checkbox changed to:', e.target.checked);
                      setIsConfirmed(e.target.checked);
                    }}
                    sx={{
                      color: theme.palette.text.secondary,
                      '&.Mui-checked': {
                        color: '#483594',
                      },
                    }}
                  />
                }
                label={
                  <Typography variant="body2" sx={{ color: theme.palette.text.primary, mt:0.4}}>
                    I confirm the above details are correct
                  </Typography>
                }
              />
            </Box>
          </Box>
        );

      case 1:
        return (
          <Box className="proceed-confirm-container">
            <Typography variant="h6" className="proceed-confirm-title" sx={{ color: theme.palette.text.primary }}>
              Confirm {transactionData.type.toUpperCase()}
            </Typography>
            <Typography variant="body2" className="proceed-confirm-timer" sx={{ color: theme.palette.text.gray }}>
              Time Remaining: 08:35
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={65} 
              className="proceed-progress"
              sx={{ 
                backgroundColor: theme.palette.mode === 'dark' ? '#444' : '#e0e0e0',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: '#483594'
                }
              }} 
            />
            
            <Box className="proceed-grid">
              <Box 
                className="proceed-amount-card"
              >
                <Typography variant="subtitle2" sx={{ mb: 1, color: theme.palette.text.secondary }}>
                  Amount
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>
                  {transactionData.amount} {transactionData.currency}
                </Typography>
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                  Fees = 20 {transactionData.currency}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>
                  Total Amount = {parseInt(transactionData.amount) + 20} {transactionData.currency}
                </Typography>
              </Box>

              <Box className="proceed-crypto-card" sx={{ backgroundColor: '#483594' }}>
                <Typography variant="subtitle2" className="proceed-crypto-subtitle">
                  You will get
                </Typography>
                <Typography variant="h6" className="proceed-crypto-amount">
                  {transactionData.youReceive} {transactionData.coin}
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  1USD = 0.0050+09256+021663 {transactionData.coin}
                </Typography>
              </Box>
            </Box>

            <Box className="proceed-field">
              <Typography variant="subtitle2" className="proceed-field-label" sx={{ color: theme.palette.text.primary }}>
                TRANSFER TYPE
              </Typography>
              <Typography variant="body1" sx={{ color: theme.palette.text.primary }}>
                {transferType}
              </Typography>
            </Box>

            <Box className="proceed-field">
              <Typography variant="subtitle2" className="proceed-field-label" sx={{ color: theme.palette.text.primary }}>
                WALLET ADDRESS
              </Typography>
              <Typography variant="body2" className="proceed-address-text" sx={{ color: theme.palette.text.primary }}>
                {walletAddress}
              </Typography>
            </Box>
          </Box>
        );

      case 2:
        return (
          <Box className="proceed-complete-container">
            <Typography variant="h6" className="proceed-complete-title" sx={{ color: theme.palette.text.primary }}>
              Transaction Completed
            </Typography>
            
            <Box className="proceed-complete-icon">
              <CheckCircleIcon sx={{ fontSize: 64, color: '#483594', mb: 2 }} />
              <Typography variant="body1" className="proceed-complete-status" sx={{ color: theme.palette.text.primary }}>
                Wait for Admin Approval
              </Typography>
            </Box>

            <Box 
              className="proceed-total-card"
            >
              <Typography variant="subtitle2" className="proceed-total-label" sx={{ color: theme.palette.text.primary }}>
                TOTAL
              </Typography>
              <Typography variant="h5" className="proceed-total-amount" sx={{ color: theme.palette.text.gray }}>
                {parseInt(transactionData.amount) + 20} {transactionData.currency}
              </Typography>
            </Box>

            <Box className="proceed-arrow-container">
              <Box 
                className="proceed-arrow-icon"
                sx={{ backgroundColor: '#483594' }}
              >
                ↓
              </Box>
            </Box>

            <Box 
              className="proceed-total-card"
            >
              <Typography variant="subtitle2" className="proceed-total-label" sx={{ color: theme.palette.text.primary }}>
                GETTING COIN
              </Typography>
              <Typography variant="h6" className="proceed-total-amount" sx={{ color: theme.palette.text.gray }}>
                {transactionData.youReceive} {transactionData.coin}
              </Typography>
            </Box>
          </Box>
        );

      default:
        return null;
    }
  };

  // Updated validation logic - only require checkbox confirmation
  const isContinueDisabled = () => {
    console.log('ProceedPage - Checking if continue is disabled, step:', currentStep, 'confirmed:', isConfirmed);
    
    if (currentStep === 0) {
      // Only require confirmation checkbox to be checked
      return !isConfirmed;
    }
    return false;
  };

  return (
    <Box className="proceed-container" sx={{ backgroundColor: theme.palette.background.default }}>
      <Card sx={{ backgroundColor: theme.palette.background.default }} className="proceed-card">
        <CardContent>
          <Box className="proceed-step-header">
            <Typography variant="h6" className="proceed-step-title" sx={{ color: theme.palette.text.primary }}>
              STEP {currentStep + 1} OF {steps.length}
            </Typography>
            <Stepper 
              activeStep={currentStep} 
              className="proceed-stepper"
              orientation={isMobile ? 'vertical' : 'horizontal'}
              sx={{
                '& .MuiStepLabel-root': {
                  color: theme.palette.text.primary,
                },
                '& .MuiStepIcon-root': {
                  color: theme.palette.text.secondary,
                  '&.Mui-active': {
                    color: '#483594',
                  },
                  '&.Mui-completed': {
                    color: '#483594',
                  },
                },
              }}
            >
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>

          {renderStepContent()}

          <Box className="proceed-buttons">
            <CustomButton
              onClick={handleBack}
              sx={{
                backgroundColor: 'transparent',
                color: theme.palette.text.primary,
                border: `1px solid ${theme.palette.text.primary}`,
                '&:hover': {
                  backgroundColor: theme.palette.mode === 'dark' ? '#333' : '#f5f5f5'
                },
                flex: isMobile ? 1 : 'none'
              }}
            >
              ← Back
            </CustomButton>

            {currentStep === steps.length - 1 ? (
              <CustomButton
                onClick={handleComplete}
                sx={{
                  backgroundColor: '#483594',
                  '&:hover': {
                    backgroundColor: '#3d2a7a'
                  },
                  flex: isMobile ? 1 : 'none'
                }}
              >
                Back to Crypto
              </CustomButton>
            ) : (
              <CustomButton
                onClick={handleNext}
                disabled={isContinueDisabled()}
                sx={{
                  backgroundColor: '#483594',
                  '&:hover': {
                    backgroundColor: '#3d2a7a'
                  },
                  '&:disabled': {
                    backgroundColor: theme.palette.action.disabledBackground,
                    color: theme.palette.action.disabled
                  },
                  flex: isMobile ? 1 : 'none'
                }}
              >
                {currentStep === 1 ? 'Confirm →' : 'Continue →'}
              </CustomButton>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ProceedPage;

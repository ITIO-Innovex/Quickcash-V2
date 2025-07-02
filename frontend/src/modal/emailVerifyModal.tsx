
import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import CustomModal from '@/components/CustomModal';
import CustomInput from '@/components/CustomInputField';
import CustomButton from '@/components/CustomButton';

interface EmailVerifyModalProps {
  open: boolean;
  onClose: () => void;
  onProceed: () => void;
}

const EmailVerifyModal: React.FC<EmailVerifyModalProps> = ({
  open,
  onClose,
  onProceed,
}) => {
  const [verificationCode, setVerificationCode] = useState('');

  const handleResendCode = () => {
    console.log('Resending verification code...');
  };

  return (
    <CustomModal
      open={open}
      onClose={onClose}
      title="Verify Section"
      maxWidth="sm"
    >
      <Box className="email-verify-container">
        <Typography variant="h5" className="email-verify-title">
          We've sent you a code via email.
        </Typography>
        
        <Typography className="email-verify-subtitle">
          Please enter the code below to continue.
        </Typography>
        
        <Box className="verification-code-section">
          <Typography className="verification-label">
            VERIFICATION CODE
          </Typography>
          
          <CustomInput
            fullWidth
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            placeholder="Enter verification code"
            className="verification-input"
          />
        </Box>
        
        <Box className="resend-section">
          <Typography className="resend-text">
            Didn't receive the email?{' '}
            <CustomButton
              className="resend-button"
              onClick={handleResendCode}
            >
              Resend Code
            </CustomButton>
          </Typography>
        </Box>
        
        <CustomButton
          className="kyc-proceed-button"
          onClick={onProceed}
          fullWidth
          disabled={!verificationCode.trim()}
        >
          Proceed
        </CustomButton>
      </Box>
    </CustomModal>
  );
};

export default EmailVerifyModal;

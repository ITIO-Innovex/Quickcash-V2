
import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import CustomModal from '@/components/CustomModal';
import CustomInput from '@/components/CustomInputField';
import CustomButton from '@/components/CustomButton';

interface OTPVerificationModalProps {
  open: boolean;
  onClose: () => void;
  onVerifySuccess: () => void;
  phoneNumber: string;
}

const OTPVerificationModal: React.FC<OTPVerificationModalProps> = ({
  open,
  onClose,
  onVerifySuccess,
  phoneNumber,
}) => {
  const [otp, setOtp] = useState(['', '', '', '']);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length <= 1 && /^[0-9]*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto-focus next input
      if (value && index < 3) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        if (nextInput) {
          nextInput.focus();
        }
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) {
        prevInput.focus();
      }
    }
  };

  const handleVerify = () => {
    const otpCode = otp.join('');
    if (otpCode.length === 4) {
      onVerifySuccess();
      setOtp(['', '', '', '']);
    }
  };

  const handleResendOtp = () => {
    console.log('Resending OTP...');
    setOtp(['', '', '', '']);
  };

  const isOtpComplete = otp.every(digit => digit !== '');

  return (
    <CustomModal
      open={open}
      onClose={onClose}
      title="Verify Phone Number"
      maxWidth="sm"
    >
      <Box className="otp-verification-container">
        <Typography className="otp-title">
          We've sent you a 4-digit code to
        </Typography>
        
        <Typography className="otp-phone-number">
          {phoneNumber}
        </Typography>
        
        <Typography className="otp-subtitle">
          Please enter the code below to verify your phone number.
        </Typography>
        
        <Box className="otp-input-container">
          {otp.map((digit, index) => (
            <CustomInput
              key={index}
              id={`otp-${index}`}
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="otp-input"
              inputProps={{
                maxLength: 1,
                style: { textAlign: 'center' }
              }}
            />
          ))}
        </Box>
        
        <Box className="otp-resend-section">
          <Typography className="otp-resend-text">
            Didn't receive the code?{' '}
            <CustomButton
              className="otp-resend-button"
              onClick={handleResendOtp}
            >
              Resend Code
            </CustomButton>
          </Typography>
        </Box>
        
        <CustomButton
          className="otp-verify-button"
          onClick={handleVerify}
          fullWidth
          disabled={!isOtpComplete}
        >
          Verify
        </CustomButton>
      </Box>
    </CustomModal>
  );
};

export default OTPVerificationModal;

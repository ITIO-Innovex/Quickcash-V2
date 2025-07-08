
import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { generateOTP } from '@/utils/otpGenerator'; 
import CustomModal from '@/components/CustomModal';
import CustomButton from '@/components/CustomButton';
import CustomInput from '@/components/CustomInputField';
import { useAppToast } from '@/utils/toast';

interface EmailVerifyModalProps {
  open: boolean;
  onClose: () => void;
  onProceed: () => void;
  email: string;
}

const EmailVerifyModal: React.FC<EmailVerifyModalProps> = ({ open, onClose, onProceed, email }) => {

  const toast = useAppToast();
  const [timeLeft, setTimeLeft] = useState(120); 
  const [generatedOTP, setGeneratedOTP] = useState('');
  const [isOTPExpired, setIsOTPExpired] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [isResendDisabled, setIsResendDisabled] = useState(true);


  // Otp Generation function Re-used here
  
    useEffect(() => {
  if (open) {
    const otp = generateOTP();
    setGeneratedOTP(otp);
    setIsOTPExpired(false);
    setIsResendDisabled(true);
    setVerificationCode('');
    setTimeLeft(120); // reset timer

    const expireTimer = setTimeout(() => {
      setIsOTPExpired(true);
      setIsResendDisabled(false);
      toast.error('OTP expired');
    }, 2 * 60 * 1000);

    // Start countdown every second
    const countdown = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(countdown);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearTimeout(expireTimer);
      clearInterval(countdown);
    };
  }
}, [open]);

  const handleResendCode = () => {
  const newOtp = generateOTP();
  setGeneratedOTP(newOtp);
  setIsOTPExpired(false);
  setIsResendDisabled(true);
  setVerificationCode('');
  setTimeLeft(120); // restart timer

  toast.success('New OTP sent');

  const expireTimer = setTimeout(() => {
    setIsOTPExpired(true);
    setIsResendDisabled(false);
    toast.error('OTP expired');
  }, 2 * 60 * 1000);

  const countdown = setInterval(() => {
    setTimeLeft(prev => {
      if (prev <= 1) {
        clearInterval(countdown);
        return 0;
      }
      return prev - 1;
    });
  }, 1000);
};


  return (
    <CustomModal open={open} onClose={onClose}title="Verify Section" maxWidth="sm">
      <Box className="email-verify-container">
        <Typography variant="h5" className="email-verify-title">
          We've sent you a code via email.
        </Typography>
        
        <Typography className="email-verify-subtitle">
          Please enter the code below to continue.
        </Typography>

        <Typography sx={{ color: 'gray', mt: 1, fontSize: '14px', fontWeight: 500., textAlign:'center' }}>
        {isOTPExpired
          ? 'OTP expired'
          : `OTP expires in: ${Math.floor(timeLeft / 60)
              .toString()
              .padStart(2, '0')}:${(timeLeft % 60).toString().padStart(2, '0')}`}
      </Typography>

        <Box className="scroll-container" >
        <Typography className="scroll-text">
          [TEST OTP: {generatedOTP}]
        </Typography>
        </Box>

        <Box className="verification-code-section">
          <CustomInput fullWidth value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} placeholder="Enter verification code"className="verification-input" />
        </Box>
        
        <Box className="resend-section">
          <Typography className="resend-text">
            Didn't receive the email?{' '}
            <span className="resend-button" onClick={handleResendCode}>
              Resend Code
            </span>
          </Typography>
        </Box>
        
        <CustomButton
        className="kyc-proceed-button"
        onClick={() => {
          if (isOTPExpired) {
            toast.error('OTP has expired. Please resend OTP.');
            return;
          }

          if (verificationCode.trim() !== generatedOTP) {
            toast.error('Please enter correct OTP');
            return;
          }

          // ✅ Save email in localStorage as KycData
          const existingData = JSON.parse(localStorage.getItem('KycData') || '{}');
          const updatedData = { ...existingData, email };
          localStorage.setItem('KycData', JSON.stringify(updatedData));

          toast.success('Email verified & saved');
          onProceed(); // ✅ Proceed after save
        }}
         fullWidth disabled={!verificationCode.trim()}>
        Proceed
      </CustomButton>

      </Box>
    </CustomModal>
  );
};

export default EmailVerifyModal;

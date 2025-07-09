import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import CustomModal from '@/components/CustomModal';
import CustomInput from '@/components/CustomInputField';
import CustomButton from '@/components/CustomButton';
import { generateOTP } from '@/utils/otpGenerator';
import { useAppToast } from '@/utils/toast';

interface OTPVerificationModalProps {
  open: boolean;
  onClose: () => void;
  onVerifySuccess: () => void;
  phoneNumber: string;
  target: 'primary' | 'additional'; 
}


const OTPVerificationModal: React.FC<OTPVerificationModalProps> = ({
  open,
  onClose,
  onVerifySuccess,
  phoneNumber,
  target,
}) => {
  const toast = useAppToast();

  const [otp, setOtp] = useState(['', '', '', '']);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [timeLeft, setTimeLeft] = useState(120);
  const [isOtpExpired, setIsOtpExpired] = useState(false);

  useEffect(() => {
    if (open) {
      const otpValue = generateOTP();
      setGeneratedOtp(otpValue);
      setOtp(['', '', '', '']);
      setTimeLeft(120);
      setIsOtpExpired(false);

      const expireTimer = setTimeout(() => {
        setIsOtpExpired(true);
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

      return () => {
        clearTimeout(expireTimer);
        clearInterval(countdown);
      };
    }
  }, [open]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length <= 1 && /^[0-9]*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < 3) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerify = () => {
    const enteredOtp = otp.join('');
    if (isOtpExpired) {
      toast.error('OTP has expired');
      return;
    }

    if (enteredOtp !== generatedOtp) {
      toast.error('Please enter correct OTP');
      return;
    }

    // ✅ Save phone in localStorage as part of KycData
    const existing = JSON.parse(localStorage.getItem('KycData') || '{}');
      const updated = {
      ...existing,
      [target === 'primary' ? 'phone' : 'additionalPhone']: phoneNumber,
    };
    localStorage.setItem('KycData', JSON.stringify(updated));
    toast.success('Phone number verified & saved');

    onVerifySuccess();
    setOtp(['', '', '', '']);
  };

  const handleResendOtp = () => {
    const newOtp = generateOTP();
    setGeneratedOtp(newOtp);
    setOtp(['', '', '', '']);
    setTimeLeft(120);
    setIsOtpExpired(false);

    toast.success('New OTP sent');
    toast.info(`[TEST OTP: ${newOtp}]`);
  };

  const isOtpComplete = otp.every(digit => digit !== '');

  return (
    <CustomModal open={open} onClose={onClose} title="Verify Phone Number" maxWidth="sm">
      <Box className="otp-verification-container">
        <Typography className="otp-title">
          We've sent you a 4-digit code to
        </Typography>

        <Typography className="otp-phone-number">{phoneNumber}</Typography>

        <Typography className="otp-subtitle">
          Please enter the code below to verify your phone number.
        </Typography>

        <Typography sx={{ textAlign: 'center', mt: 1, color: 'gray', fontSize: 14 }}>
          {isOtpExpired
            ? 'OTP expired'
            : `OTP expires in: ${Math.floor(timeLeft / 60)
                .toString()
                .padStart(2, '0')}:${(timeLeft % 60).toString().padStart(2, '0')}`}
        </Typography>

        {/* 🔽 Test OTP visible in scrolling box */}
        <Box className="scroll-container" style={{ marginTop: '16px', marginBottom: '8px' }}>
          <Typography className="scroll-text" >
            [TEST OTP: {generatedOtp}]
          </Typography>
        </Box>

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
            <span className="resend-button" onClick={handleResendOtp}>
              Resend Code
            </span>
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

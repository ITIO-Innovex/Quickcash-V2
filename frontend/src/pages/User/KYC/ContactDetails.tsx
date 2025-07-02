import React, { useState } from 'react';
import { Box, Typography, Grid, useTheme } from '@mui/material';
import CustomInput from '@/components/CustomInputField';
import CustomButton from '@/components/CustomButton';
import OTPVerificationModal from '@/modal/otpVerificationModal';
import EmailVerifyModal from '@/modal/emailVerifyModal';

interface ContactDetailsProps {
  onNext: () => void;
}

const ContactDetails: React.FC<ContactDetailsProps> = ({ onNext }) => {
  const theme = useTheme();

  const [email, setEmail] = useState('');
  const [primaryPhone, setPrimaryPhone] = useState('');
  const [additionalPhone, setAdditionalPhone] = useState('');
  const [primaryCountryCode, setPrimaryCountryCode] = useState('+49');
  const [additionalCountryCode, setAdditionalCountryCode] = useState('+49');

  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isPrimaryPhoneVerified, setIsPrimaryPhoneVerified] = useState(false);
  const [isAdditionalPhoneVerified, setIsAdditionalPhoneVerified] = useState(false);

  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [verificationTarget, setVerificationTarget] = useState<'primary' | 'additional'>('primary');

  const countryCodes = [
    { label: '+49', value: '+49' },
    { label: '+1', value: '+1' },
    { label: '+44', value: '+44' },
    { label: '+91', value: '+91' },
  ];

  const handleVerifyClick = (target: 'email' | 'primary' | 'additional') => {
    if (target === 'email' && email.trim()) {
      setEmailModalOpen(true);
    } else if (target === 'primary' && primaryPhone.trim()) {
      setVerificationTarget('primary');
      setOtpModalOpen(true);
    } else if (target === 'additional' && additionalPhone.trim()) {
      setVerificationTarget('additional');
      setOtpModalOpen(true);
    }
  };

  const handleOtpVerifySuccess = () => {
    if (verificationTarget === 'primary') {
      setIsPrimaryPhoneVerified(true);
    } else {
      setIsAdditionalPhoneVerified(true);
    }
    setOtpModalOpen(false);
  };

  const handleEmailVerifySuccess = () => {
    setIsEmailVerified(true);
    setEmailModalOpen(false);
  };

  const getPhoneNumber = () => {
    return verificationTarget === 'primary'
      ? `${primaryCountryCode} ${primaryPhone}`
      : `${additionalCountryCode} ${additionalPhone}`;
  };

  return (
    <Box className="contact-details-container">
      <Box className="step-indicator">
        <Typography className="step-text">STEP 1 OF 3</Typography>
        <Typography variant="h5" className="step-title">Contact Details</Typography>
        <Box className="step-progress">
          <Box className="progress-bar active" />
          <Box className="progress-bar" />
          <Box className="progress-bar" />
        </Box>
      </Box>

      <Typography className="step-description">
        To fully activate your account and access all features, please complete the KYC process.
      </Typography>

      <Grid container spacing={3}>
        {/* Email */}
      <Grid item xs={12}>
              <Box className="input-section">
                <Typography className="input-label">EMAIL</Typography>

                <Box className="unified-phone-input"> 
                  <Box > 
                    <input
                    className="phone-number-input-merged"
                      value={email}
                      disabled={isEmailVerified}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter Here"
                    />
                  </Box>

                  <span
                    className="verified-badge-inside"
                    style={{
                      backgroundColor: isEmailVerified
                        ? '#4CAF50'
                        : email.trim()
                        ? '#ccc'
                        : '#eee',
                      cursor: email.trim() && !isEmailVerified ? 'pointer' : 'not-allowed',
                      pointerEvents: email.trim() && !isEmailVerified ? 'auto' : 'none',
                    }}
                    onClick={() => handleVerifyClick('email')}
                  >
                    {isEmailVerified ? 'VERIFIED' : 'VERIFY'}
                  </span>
                </Box>
              </Box>
            </Grid>


        {/* Primary Phone */}
        <Grid item xs={12}>
          <Typography className="input-label">Primary Phone Number</Typography>
          <Box className="unified-phone-input">
            <select
              className="country-code-select-merged"
              disabled={isPrimaryPhoneVerified}
              style={{ color: theme.palette.text.primary }}
              value={primaryCountryCode}
              onChange={(e) => setPrimaryCountryCode(e.target.value)}
            >
              {countryCodes.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <input
              className="phone-number-input-merged"
              value={primaryPhone}
              disabled={isPrimaryPhoneVerified}
              onChange={(e) => setPrimaryPhone(e.target.value)}
              placeholder="Enter Here"
            />
            <span
              className="verified-badge-inside"
              style={{
                backgroundColor: isPrimaryPhoneVerified
                  ? '#4CAF50'
                  : primaryPhone.trim()
                  ? '#ccc'
                  : '#eee',
                cursor: primaryPhone.trim() && !isPrimaryPhoneVerified ? 'pointer' : 'not-allowed',
                pointerEvents:
                  primaryPhone.trim() && !isPrimaryPhoneVerified ? 'auto' : 'none',
              }}
              onClick={() => handleVerifyClick('primary')}
            >
              {isPrimaryPhoneVerified ? 'VERIFIED' : 'VERIFY'}
            </span>
          </Box>
        </Grid>

        {/* Additional Phone */}
        <Grid item xs={12}>
          <Typography className="input-label">Additional Phone Number</Typography>
          <Box className="unified-phone-input">
            <select
              className="country-code-select-merged"
              disabled={isAdditionalPhoneVerified}
              style={{ color: theme.palette.text.primary }}
              value={additionalCountryCode}
              onChange={(e) => setAdditionalCountryCode(e.target.value)}
            >
              {countryCodes.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <input
              className="phone-number-input-merged"
              value={additionalPhone}
              disabled={isAdditionalPhoneVerified}
              onChange={(e) => setAdditionalPhone(e.target.value)}
              placeholder="Enter Here"
            />
            <span
              className="verified-badge-inside"
              style={{
                backgroundColor: isAdditionalPhoneVerified
                  ? '#4CAF50'
                  : additionalPhone.trim()
                  ? '#ccc'
                  : '#eee',
                cursor:
                  additionalPhone.trim() && !isAdditionalPhoneVerified
                    ? 'pointer'
                    : 'not-allowed',
                pointerEvents:
                  additionalPhone.trim() && !isAdditionalPhoneVerified ? 'auto' : 'none',
              }}
              onClick={() => handleVerifyClick('additional')}
            >
              {isAdditionalPhoneVerified ? 'VERIFIED' : 'VERIFY'}
            </span>
          </Box>
        </Grid>

        {/* Next Button */}
        <Grid item xs={12}>
          <Box className="next-button-container">
            <CustomButton className="update-button" onClick={onNext} fullWidth>
              Next
            </CustomButton>
          </Box>
        </Grid>
      </Grid>

      {/* Phone OTP Modal */}
      <OTPVerificationModal
        open={otpModalOpen}
        onClose={() => setOtpModalOpen(false)}
        onVerifySuccess={handleOtpVerifySuccess}
        phoneNumber={getPhoneNumber()}
      />

      {/* Email Verify Modal */}
      <EmailVerifyModal
        open={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
        onProceed={handleEmailVerifySuccess}
      />
    </Box>
  );
};

export default ContactDetails;

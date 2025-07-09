
import React, { useState } from 'react';
import 'react-phone-input-2/lib/style.css'; 
import PhoneInput from 'react-phone-input-2';
import CustomButton from '@/components/CustomButton';
import CustomInput from '@/components/CustomInputField';
import EmailVerifyModal from '@/modal/emailVerifyModal';
import OTPVerificationModal from '@/modal/otpVerificationModal';
import { Box, Typography, Grid, useTheme } from '@mui/material';

interface ContactDetailsProps {
  onNext: () => void;
}

const ContactDetails: React.FC<ContactDetailsProps> = ({ onNext }) => {
  const theme = useTheme();
  const [phone, setPhone] = useState('');
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

  
  React.useEffect(() => {
  const userData = localStorage.getItem('userData');
  if (userData) {
    try {
      const parsed = JSON.parse(userData);
      if (parsed.email) setEmail(parsed.email);
    } catch (err) {
      console.error('[❌ ERROR PARSING userData]:', err);
    }
  }

  // Load verified contact info
  const kycData = localStorage.getItem('KycData');
  if (kycData) {
    try {
      const parsed = JSON.parse(kycData);

      if (parsed.email) {
        setEmail(parsed.email);
        setIsEmailVerified(true); // 🟢 Important
      }

      if (parsed.phone) {
        const [primaryCode, ...primaryNumberParts] = parsed.phone.split(' ');
        setPrimaryCountryCode(primaryCode);
        setPrimaryPhone(primaryNumberParts.join(' '));
        setIsPrimaryPhoneVerified(true);
      }

      if (parsed.additionalPhone) {
        const [additionalCode, ...additionalNumberParts] = parsed.additionalPhone.split(' ');
        setAdditionalCountryCode(additionalCode);
        setAdditionalPhone(additionalNumberParts.join(' '));
        setIsAdditionalPhoneVerified(true);
      }
    } catch (err) {
      console.error('[❌ ERROR PARSING KycData]:', err);
    }
  }
}, []);
  
  React.useEffect(() => {
  const userData = localStorage.getItem('userData');
  if (userData) {
    try {
      const parsed = JSON.parse(userData);
      if (parsed.email) {
        setEmail(parsed.email);
      }
    } catch (err) {
      console.error('[❌ ERROR PARSING userData]:', err);
    }
  }
}, []);

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
  const updatedData = {
    email,
    phone: `${primaryCountryCode} ${primaryPhone}`,
    additionalPhone: `${additionalCountryCode} ${additionalPhone}`,
  };

  localStorage.setItem('KycData', JSON.stringify(updatedData));

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

  const existing = JSON.parse(localStorage.getItem('KycData') || '{}');
  localStorage.setItem('KycData', JSON.stringify({ ...existing, email }));
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
                    className="email-input-merged"
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
            
           <PhoneInput
            country={'us'}
            value={primaryPhone}
            disabled={isPrimaryPhoneVerified}
            onChange={(value, country) => {
              setPrimaryPhone(value);
              setPrimaryCountryCode(`+${(country as import('react-phone-input-2').CountryData)?.dialCode || ''}`);
            }}
            inputStyle={{
              width: '100%',
              height: '55px',
              borderRadius: '6px',
              border: 'none'
            }}
            containerStyle={{ width: '100%' }}
            inputProps={{
              name: 'primaryPhone',
              required: true,
              autoFocus: true,
              readOnly: isPrimaryPhoneVerified,
            }}
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
           <PhoneInput
                country={'us'}
                value={additionalPhone}
                disabled={isAdditionalPhoneVerified}
                onChange={(value, country) => {
                  setAdditionalPhone(value);
                  setAdditionalCountryCode(`+${(country as import('react-phone-input-2').CountryData)?.dialCode || ''}`);
                }}
                inputStyle={{
                  width: '100%',
                  height: '55px',
                  borderRadius: '6px',
                  border: 'none',
                }}
                containerStyle={{ width: '100%' }}
                inputProps={{
                  name: 'additionalPhone',
                  required: true,
                  readOnly: isAdditionalPhoneVerified,
                }}
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
        target={verificationTarget}
      />

      {/* Email Verify Modal */}
      <EmailVerifyModal
        email={email}
        open={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
        onProceed={handleEmailVerifySuccess}
      />
    </Box>
  );
};

export default ContactDetails;

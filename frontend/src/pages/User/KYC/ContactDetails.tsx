
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';
import React, { useState } from 'react';
import 'react-phone-input-2/lib/style.css'; 
import PhoneInput from 'react-phone-input-2';
import { loadAndStoreKycData } from '@/api/kyc.api';
import CustomButton from '@/components/CustomButton';
import EmailVerifyModal from '@/modal/emailVerifyModal';
import OTPVerificationModal from '@/modal/otpVerificationModal';
import { Box, Typography, Grid, useTheme } from '@mui/material';
import { useAppToast } from '@/utils/toast';
const url = import.meta.env.VITE_NODE_ENV == 'production' ? 'api' : 'api';

interface ContactDetailsProps {
  onNext: () => void;
}

const ContactDetails: React.FC<ContactDetailsProps> = ({ onNext }) => {
  const theme = useTheme();
  const toast = useAppToast();
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
      if (parsed.email) {
        setEmail(parsed.email);
      }
    } catch (err) {
      console.error('[❌ ERROR PARSING userData]:', err);
    }
  }
}, []);

React.useEffect(() => {
  const fetchKyc = async () => {
    const data = await loadAndStoreKycData(); // API + localStorage update
    if (data) {
      if (data.email) {
        setEmail(data.email);
        setIsEmailVerified(data.emailVerified);
      }

      if (data.phone) {
        const primaryCode = data.phone.slice(0, 3); // "+91"
        const primaryRest = data.phone.slice(3); // "7894561230"
        setPrimaryCountryCode(primaryCode);
        setPrimaryPhone(primaryRest);
        setIsPrimaryPhoneVerified(data.phonePVerified);
      }

      if (data.additionalPhone) {
        const additionalCode = data.additionalPhone.slice(0, 3);
        const additionalRest = data.additionalPhone.slice(3);
        setAdditionalCountryCode(additionalCode);
        setAdditionalPhone(additionalRest);
        setIsAdditionalPhoneVerified(data.phoneSVerified);
      }
    } else {
      
      const userData = localStorage.getItem('userData');
      if (userData) {
        try {
          const parsed = JSON.parse(userData);
          if (parsed.email) setEmail(parsed.email);
        } catch (err) {
          console.error('[❌ ERROR PARSING userData]:', err);
        }
      }
    }
  };

  fetchKyc();
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
  
  React.useEffect(() => {
  const kycLocal = localStorage.getItem('KycData');
  if (kycLocal) {
    try {
      const parsed = JSON.parse(kycLocal);
      if (parsed.email) setEmail(parsed.email);
      if (parsed.phone) {
        setPrimaryCountryCode(parsed.phone.slice(0, 3));
        setPrimaryPhone(parsed.phone.slice(3));
      }
      if (parsed.additionalPhone) {
        setAdditionalCountryCode(parsed.additionalPhone.slice(0, 3));
        setAdditionalPhone(parsed.additionalPhone.slice(3));
      }
      if (parsed.emailVerified) setIsEmailVerified(true);
      if (parsed.phonePVerified) setIsPrimaryPhoneVerified(true);
      if (parsed.phoneSVerified) setIsAdditionalPhoneVerified(true);
    } catch (err) {
      console.error('[❌ ERROR PARSING KycData for restoration]:', err);
    }
  }
}, []);

  React.useEffect(() => {
  const existing = JSON.parse(localStorage.getItem('KycData') || '{}');
  const updated = {
    ...existing,
    email,
    phone: `${primaryCountryCode}${primaryPhone}`,
    additionalPhone: `${additionalCountryCode}${additionalPhone}`,
  };
  localStorage.setItem('KycData', JSON.stringify(updated));
}, [email, primaryPhone, additionalPhone, primaryCountryCode, additionalCountryCode]);


const handleOtpVerifySuccess = async () => {
  const existing = JSON.parse(localStorage.getItem('KycData') || '{}');
  const token = localStorage.getItem('token');
  const decoded = jwtDecode<{ data: { id: string } }>(token || '');
  const updateID = existing._id;

  const isPrimary = verificationTarget === 'primary';

  const updated = {
    ...existing,
    phone: `${primaryCountryCode}${primaryPhone}`,
    additionalPhone: `${additionalCountryCode}${additionalPhone}`,
    phonePVerified: isPrimary ? true : existing.phonePVerified,
    phoneSVerified: !isPrimary ? true : existing.phoneSVerified,
  };

  try {
    const response = await axios.patch(`/${url}/v1/kyc/verify/${updateID}`, {
      user: decoded?.data?.id,
      email: existing.email || '',
      type: isPrimary ? 'phone1' : 'phone2',
      emailVerified: existing.emailVerified,
      phonePVerified: updated.phonePVerified,
      phoneSVerified: updated.phoneSVerified,
      primaryPhoneNumber: updated.phone,
      secondaryPhoneNumber: updated.additionalPhone,
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const isSuccess =
      response?.data?.status === 'success' ||
      response?.data?.status === 201 ||
      response?.status === 200;

    if (isSuccess) {
      localStorage.setItem('KycData', JSON.stringify(updated));

      if (isPrimary) setIsPrimaryPhoneVerified(true);
      else setIsAdditionalPhoneVerified(true);

      setOtpModalOpen(false); // ✅ Only if it worked
      console.log('✅ OTP verified and modal closed.');
    } else {
      console.error('❌ OTP PATCH did not return success:', response?.data);
      toast.error(response?.data?.message || 'Phone verification failed');
    }
  } catch (err: any) {
    console.error('❌ OTP PATCH Failed:', err);
    toast.error(err?.response?.data?.message || 'Failed to verify phone number');
  }
};


const handleEmailVerifySuccess = async () => {
  setIsEmailVerified(true);
  setEmailModalOpen(false);

  const existing = JSON.parse(localStorage.getItem('KycData') || '{}');
  const token = localStorage.getItem('token');
  const decoded = jwtDecode<{ data: { id: string } }>(token || '');
  const updateID = existing._id;
  console.log(updateID);

  try {
    await axios.patch(`/${url}/v1/kyc/verify/${updateID}`, {
      user: decoded?.data?.id,
      email,
      type: 'email',
      emailVerified: true,
      phonePVerified: existing.phonePVerified,
      phoneSVerified: existing.phoneSVerified,
      primaryPhoneNumber: existing.phone || '',
      secondaryPhoneNumber: existing.additionalPhone || '',
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    // 💾 Update localStorage
    const updated = {
      ...existing,
      email,
      emailVerified: true
    };
    localStorage.setItem('KycData', JSON.stringify(updated));

  } catch (err) {
    console.error('❌ Email PATCH Failed:', err);
  }
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
              <Box >
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
            specialLabel=""
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
                 specialLabel=""
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

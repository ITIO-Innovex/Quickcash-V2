
import { useState, useEffect } from 'react';
import api from '@/helpers/apiHelper';
import { useAppToast } from '@/utils/toast';
import { useNavigate } from 'react-router-dom';
import CustomButton from '../../../components/CustomButton';
import CustomInputField from '../../../components/CustomInputField';
import PersonalInfoForm from '../../../components/forms/PersonalInfoForm';
const url = import.meta.env.VITE_NODE_ENV === "production" ? "api" : "api";
import BusinessDetailsForm from '../../../components/forms/BusinessDetailsForm';
import BusinessAddressForm from '../../../components/forms/BusinessAddressForm';
import BusinessRegisterHeader from '../../../components/forms/BusinessRegisterHeader';
import IdentityVerificationForm from '../../../components/forms/IdentityVerificationForm';
import { Box, Card, CardContent, Typography, Stepper, Step, StepLabel, useTheme, useMediaQuery } from '@mui/material';
import axios from 'axios';
import BankInfoForm from '@/components/forms/BankAccountDetails';

const BusinessRegister = () => {
  const theme = useTheme();
  const toast = useAppToast();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);

  const steps = ['Personal Info', 'Verify Email', 'Business Details', 'Business Address', 'Identity Verification', 'Setup Complete'];
  const [formData, setFormData] = useState({
    // Personal Info
    fullName: '', email: '', country: '',
    // Email verification
    otp: '',
    // Business Details
    businessName: '', businessType: '', companyRegistrationNumber: '', industryActivity: '', countryOfIncorporation: '', website: '',
    // Business Address
    streetAddress: '', city: '', state: '', zipCode: '', addressCountry: '',
    // Identity Verification
    documentType: '', document: null as File | null,
    // Bank Details  
    bankName: '', accountNumber: '', swiftBic: '', currency: ''
  });


  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch registration progress on mount
  useEffect(() => {
    const fetchProgress = async () => {
      setIsLoading(true);
      try {
        const res = await api.get(`/${url}/v1/business/user/progress`);
        const progress = res.data;
        if (progress) {
          setCurrentStep(progress.currentStep || 0);
          setIsCompleted(progress.isCompleted || false);
          setFormData((prev) => ({ ...prev, ...progress.formData }));
        }
      } catch (err) {
        console.error('Failed to fetch registration progress', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProgress();
  }, []);

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 0: // Personal Info
        if (!formData.fullName) newErrors.fullName = 'Full name is required';
        if (!formData.email) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
        if (!formData.country) newErrors.country = 'Country is required';
        break;
      case 1: // Email verification
        if (!formData.otp) newErrors.otp = 'OTP is required';
        break;
      case 2: // Business Details
        if (!formData.businessName) newErrors.businessName = 'Business name is required';
        if (!formData.businessType) newErrors.businessType = 'Business type is required';
        if (!formData.industryActivity) newErrors.industryActivity = 'Industry/Business activity is required';
        if (!formData.countryOfIncorporation) newErrors.countryOfIncorporation = 'Country of incorporation is required';
        break;
      case 3: // Business Address
        if (!formData.streetAddress) newErrors.streetAddress = 'Street address is required';
        if (!formData.city) newErrors.city = 'City is required';
        if (!formData.state) newErrors.state = 'State is required';
        if (!formData.zipCode) newErrors.zipCode = 'ZIP/Postal code is required';
        if (!formData.addressCountry) newErrors.addressCountry = 'Country is required';
        break;
      case 4: // Identity Verification
        if (!formData.documentType) newErrors.documentType = 'Document type is required';
        if (!formData.document) newErrors.document = 'Document is required';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (name: string, value: string | File | null) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // const handleNext = () => {
  //   if (validateStep(currentStep)) {
  //     if (currentStep < steps.length - 1) {
  //       setCurrentStep(currentStep + 1);
  //     } else {
  //       // Final submission
  //       console.log('Business registration completed:', formData);
  //       toast.success('Business registered successfully!');
  //       setTimeout(() => {
  //         navigate('/dashboard');
  //       }, 2000);
  //     }
  //   }
  // };
  const handleNext = async () => {
    if (!validateStep(currentStep)) return;

    try {
      if (currentStep === 0) {
        const res = await api.post(`/${url}/v1/business/user/register-info`, {
          name: formData.fullName,
          email: formData.email,
          country: formData.country,
        });

        console.log('✅ Step 0 API success:', res.data);
        toast.success('OTP sent to your email ✅');
        setCurrentStep(1); // ⬅ Move to email verification step
        return; // Exit early
      }
      if (currentStep === 1) {
        try {
          const res = await api.post(`/${url}/v1/business/user/verify`, {
            otp: formData.otp
          });

          console.log('✅ OTP verified:', res.data);
          toast.success('OTP verified successfully ✅');
          setCurrentStep(2); // proceed to Business Details
        } catch (error: any) {
          console.error('❌ OTP verification failed:', error);
          if (error.response?.status === 410) {
            toast.error('OTP expired. Please request a new one 🔁');
          } else if (error.response?.status === 401) {
            toast.error('Invalid OTP. Please try again ❌');
          } else {
            toast.error('Failed to verify OTP. Try again later ⚠️');
          }
        }
        return;
      }
      if (currentStep === 2) {
        try {
          const res = await api.post(`/${url}/v1/business/user/details`, {
            businessName: formData.businessName,
            businessType: formData.businessType,
            registrationNumber: formData.companyRegistrationNumber,
            industry: formData.industryActivity,
            incorporationCountry: formData.countryOfIncorporation,
            website: formData.website,
          });

          console.log('✅ Step 2 API success:', res.data);
          toast.success('Business details saved ✅');
          setCurrentStep(3); // Move to address step
        } catch (error: any) {
          console.error('❌ Step 2 API error:', error);
          toast.error('Failed to save business details ❌');
        }
        return; // Exit so it doesn't fall through
      }

      if (currentStep === 3) {
        try {
          const step3Errors: any = {};

          if (!formData.streetAddress) step3Errors.streetAddress = "Street address is required";
          if (!formData.city) step3Errors.city = "City is required";
          if (!formData.state) step3Errors.state = "State is required";
          if (!formData.zipCode) step3Errors.zipCode = "ZIP/Postal Code is required";
          if (!formData.addressCountry) step3Errors.addressCountry = "Country is required";

          if (Object.keys(step3Errors).length > 0) {
            setErrors(step3Errors); // 👈 Make sure this is part of your form state
            return;
          }
          const response = await api.post(`/${url}/v1/business/user/address`, {
            streetAddress: formData.streetAddress,
            city: formData.city,
            state: formData.state,
            postalCode: formData.zipCode,
            businessCountry: formData.addressCountry,
          });

          console.log('✅ Step 3 API success:', response.data);
          toast.success('Business address saved successfully ✅');
          setCurrentStep(4); // Proceed to Identity Verification
        } catch (error: any) {
          console.error('❌ Step 3 API error:', error);
          toast.error('Failed to save business address ❌');
        }
        return;
      }
      if (currentStep == 4) {
        const newErrors: Record<string, string> = {};

        if (!formData.documentType) {
          newErrors.documentType = 'Document type is required';
        }

        if (!formData.document) {
          newErrors.document = 'Please select a document file';
        }

        if (Object.keys(newErrors).length > 0) {
          setErrors(newErrors);
          toast.error('Please fix the errors before continuing.');
          return;
        }

        // If all good:
        setErrors({});
        try {
          const payload = new FormData();
          payload.append('document', formData.document); // the actual file
          payload.append('docType', formData.documentType);
          console.log('🧾 Uploading document:', formData.document);
          console.log('📤 FormData has:', [...payload.entries()]);

          const token = localStorage.getItem('token');
          const res = await axios.post(`/${url}/v1/business/user/upload-kyc`, payload, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          console.log('✅ Step 5 API success:', res.data);
          toast.success('Document uploaded successfully ✅');
          setCurrentStep(currentStep + 1);

        } catch (error: any) {
          console.error('❌ Step 5 API error:', error);
          toast.error('Failed to upload document ❌');
        }
        return;
      }
      if (currentStep === 5) {
        const bankErrors: Record<string, string> = {};

        if (!formData.bankName) bankErrors.bankName = 'Bank name is required';
        if (!formData.accountNumber) bankErrors.accountNumber = 'Account number is required';
        if (!formData.swiftBic) bankErrors.swiftBic = 'SWIFT/BIC is required';
        if (!formData.currency) bankErrors.currency = 'Currency is required';

        if (Object.keys(bankErrors).length > 0) {
          setErrors(bankErrors);
          toast.error('Please fix the errors before continuing.');
          return;
        }

        try {
          const res = await api.post(`/${url}/v1/business/user/bank-info`, {
            bankName: formData.bankName,
            accountNumber: formData.accountNumber,
            swiftBic: formData.swiftBic,
            currency: formData.currency,
          });

          console.log('✅ Bank info submitted:', res.data);
          toast.success('Bank information saved ✅');
          setCurrentStep(currentStep + 1); // Go to final step
        } catch (error: any) {
          console.error('❌ Bank info error:', error);
          toast.error('Failed to save bank info ❌');
        }

        return;
      }
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        toast.success('Business registered successfully!');
        localStorage.removeItem('businessFormData');
        localStorage.removeItem('businessCurrentStep');

        toast.success('Business registered successfully!');
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
    } catch (error: any) {
      console.error('❌ Step 0 API error:', error);
      if (error.response?.status === 409) {
        toast.error('You already have a business account ⚠️');
      } else {
        toast.error('Failed to send OTP ❌');
      }
    } finally {
      setIsLoading(false); // 🔵 End loading
    }
  };


  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <PersonalInfoForm
            values={{
              fullName: formData.fullName,
              email: formData.email,
              country: formData.country
            }}
            errors={errors}
            onChange={handleChange}
          />
        );

      case 1:
        return (
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ mb: 3, color: theme.palette.text.primary }}>
              Check your email – we've sent you a verification link.
            </Typography>
            <CustomInputField
              label="Enter OTP"
              name="otp"
              value={formData.otp}
              onChange={(e) => handleChange('otp', e.target.value)}
              error={!!errors.otp}
              helperText={errors.otp}
              sx={{ maxWidth: 400, mx: 'auto' }}
            />
          </Box>
        );

      case 2:
        return (
          <BusinessDetailsForm
            values={{
              businessName: formData.businessName,
              businessType: formData.businessType,
              companyRegistrationNumber: formData.companyRegistrationNumber,
              industryActivity: formData.industryActivity,
              countryOfIncorporation: formData.countryOfIncorporation,
              website: formData.website
            }}
            errors={errors}
            onChange={handleChange}
          />
        );

      case 3:
        return (
          <BusinessAddressForm
            values={{
              streetAddress: formData.streetAddress,
              city: formData.city,
              state: formData.state,
              zipCode: formData.zipCode,
              addressCountry: formData.addressCountry
            }}
            errors={errors}
            onChange={handleChange}
          />
        );

      case 4:
        return (
          <IdentityVerificationForm
            values={{
              documentType: formData.documentType,
              document: formData.document
            }}
            errors={errors}
            onChange={handleChange}
          />
        );
      case 5:
        return (
          <BankInfoForm
            values={{
              bankName: formData.bankName,
              accountNumber: formData.accountNumber,
              swiftBic: formData.swiftBic,
              currency: formData.currency
            }}
            errors={errors}
            onChange={handleChange}
          />
        );

      case 6:
        return (
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ color: theme.palette.text.primary, mb: 3 }}>
              Your business account is being reviewed. We'll notify you once it's ready to go!
            </Typography>
          </Box>
        );

      default:
        return null;
    }
  };

  // Show loading or completion message
  if (isLoading) {
    return <Box sx={{ textAlign: 'center', mt: 8 }}><Typography>Loading...</Typography></Box>;
  }
  if (isCompleted) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 4,
          backgroundColor: theme.palette.background.paper,
          borderRadius: 2,
          boxShadow: 3,
          textAlign: 'center',
        }}
      >
        <Typography
          variant="h6"
          sx={{
            color: theme.palette.text.primary,
            mb: 2,
            maxWidth: 500,
          }}
        >
          Your business account is currently under review. We’ll notify you as soon as it's ready to go!
        </Typography>
      </Box>

    );
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      py: { xs: 2, md: 4 },
      px: { xs: 1, md: 2 }
    }}>
      <Box sx={{ maxWidth: 900, mx: 'auto' }}>
        <BusinessRegisterHeader />

        <Card sx={{
          backgroundColor: theme.palette.background.default,
          boxShadow: 3,
          borderRadius: 2
        }}>
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <Stepper
              activeStep={currentStep}
              orientation={isMobile ? 'vertical' : 'horizontal'}
              sx={{
                mb: 4,

                //  Common label styling
                '& .MuiStepLabel-label': {
                  fontSize: { xs: '0.75rem', md: '0.875rem' },
                  color: '#888', // 🔘 Inactive label color
                },

                // ✅ Active label
                '& .MuiStepLabel-label.Mui-active': {
                  color: '#483594', // 🟣 Active step label color
                  fontWeight: 600,
                },

                // ✅ Completed label
                '& .MuiStepLabel-label.Mui-completed': {
                  color: '#4caf50', // ✅ Completed step label color
                  fontWeight: 600,
                },
              }}
            >
              {steps.map((label, index) => (
                <Step key={label}>
                  <StepLabel sx={{
                    color: theme.palette.text.primary,
                    fontSize: { xs: '0.75rem', md: '0.875rem' },
                    '& .MuiStepLabel-label': {
                      fontSize: { xs: '0.75rem', md: '0.875rem' }
                    }
                  }}>
                    {label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>

            <Box sx={{ mb: 4, color: theme.palette.text.gray }}>
              {renderStepContent()}
            </Box>

            <Box sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 2,
              justifyContent: 'space-between'
            }}>
              {currentStep > 0 && (
                <CustomButton
                  onClick={handleBack}
                  sx={{
                    backgroundColor: 'transparent',
                    color: '#483594',
                    border: '1px solid #483594',
                    '&:hover': {
                      backgroundColor: 'rgba(72, 53, 148, 0.1)'
                    },
                    order: { xs: 2, sm: 1 }
                  }}
                >
                  BACK
                </CustomButton>
              )}

              <CustomButton
                onClick={handleNext}
                sx={{
                  backgroundColor: '#483594',
                  '&:hover': {
                    backgroundColor: '#3d2a7a'
                  },
                  order: { xs: 1, sm: 2 },
                  ml: { sm: 'auto' }
                }}
              >
                {currentStep === 1 ? 'VERIFY' :
                  currentStep === 4 ? 'UPLOAD DOCUMENT' :
                    currentStep === 5 ? 'FINISH' : 'CONTINUE'}
              </CustomButton>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default BusinessRegister;

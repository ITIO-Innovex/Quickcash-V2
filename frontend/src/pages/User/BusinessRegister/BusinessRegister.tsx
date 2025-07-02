
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import CustomButton from '../../../components/CustomButton';
import CustomInputField from '../../../components/CustomInputField';
import PersonalInfoForm from '../../../components/forms/PersonalInfoForm';
import BusinessDetailsForm from '../../../components/forms/BusinessDetailsForm';
import BusinessAddressForm from '../../../components/forms/BusinessAddressForm';
import BusinessRegisterHeader from '../../../components/forms/BusinessRegisterHeader';
import IdentityVerificationForm from '../../../components/forms/IdentityVerificationForm';
import { Box, Card, CardContent, Typography, Stepper, Step, StepLabel, useTheme, useMediaQuery } from '@mui/material';

const BusinessRegister = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);

  const steps = ['Personal Info', 'Verify Email', 'Business Details', 'Business Address', 'Identity Verification', 'Setup Complete'];

  const [formData, setFormData] = useState({
    // Personal Info
    fullName: '',
    email: '',
    country: '',
    // Email verification
    otp: '',
    // Business Details
    businessName: '',
    businessType: '',
    companyRegistrationNumber: '',
    industryActivity: '',
    countryOfIncorporation: '',
    website: '',
    // Business Address
    streetAddress: '',
    city: '',
    state: '',
    zipCode: '',
    addressCountry: '',
    // Identity Verification
    documentType: '',
    document: null as File | null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        // Final submission
        console.log('Business registration completed:', formData);
        toast.success('Business registered successfully!');
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
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
              placeholder="251732"
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
                  <StepLabel sx={{ color:theme.palette.text.primary,
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

            <Box sx={{ mb: 4 , color:theme.palette.text.gray}}>
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

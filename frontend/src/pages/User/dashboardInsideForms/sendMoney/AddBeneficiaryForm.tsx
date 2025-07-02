
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  IconButton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import CustomButton from '@/components/CustomButton';
import CustomTextField from '@/components/CustomTextField';
import CustomSelect from '@/components/CustomDropdown';

const AddBeneficiaryForm: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: '',
    accountNumber: '',
    bankName: '',
    swiftCode: '',
  });

  const countries = [
    { label: 'United States', value: 'US' },
    { label: 'United Kingdom', value: 'GB' },
    { label: 'Canada', value: 'CA' },
    { label: 'Australia', value: 'AU' },
    { label: 'India', value: 'IN' },
    { label: 'Germany', value: 'DE' },
  ];

  const handleBack = () => {
    navigate('/beneficiary');
  };

  const handleInputChange = (field: string) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleCountryChange = (event: any) => {
    setFormData(prev => ({
      ...prev,
      country: event.target.value
    }));
  };

  const handleSubmit = () => {
    // Handle form submission
    console.log('Beneficiary data:', formData);
    navigate('/beneficiary');
  };

  const isFormValid = formData.firstName && formData.lastName && formData.email && 
                     formData.country && formData.accountNumber && formData.bankName;

  return (
    <Box className="add-beneficiary-container" sx={{ p: 3 }}>
      <Box className="beneficery-box" >
        <IconButton onClick={handleBack}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5">
          Add New Beneficiary
        </Typography>
      </Box>

      <Box component="form" sx={{ maxWidth: 600, mx: 'auto' }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <CustomTextField
              label="First Name"
              value={formData.firstName}
              onChange={handleInputChange('firstName')}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <CustomTextField
              label="Last Name"
              value={formData.lastName}
              onChange={handleInputChange('lastName')}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={handleInputChange('email')}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              label="Phone Number"
              value={formData.phone}
              onChange={handleInputChange('phone')}
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <CustomSelect
              label="Country"
              options={countries}
              value={formData.country}
              onChange={handleCountryChange}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              label="Account Number"
              value={formData.accountNumber}
              onChange={handleInputChange('accountNumber')}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              label="Bank Name"
              value={formData.bankName}
              onChange={handleInputChange('bankName')}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              label="SWIFT/BIC Code"
              value={formData.swiftCode}
              onChange={handleInputChange('swiftCode')}
              fullWidth
            />
          </Grid>
        </Grid>

        <Box className="add-beneficiary-actions" sx={{ mt: 4 }}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <CustomButton
                onClick={handleBack}
                variant="outlined"
                fullWidth
                className="back-button"
              >
                Cancel
              </CustomButton>
            </Grid>
            <Grid item xs={6}>
              <CustomButton
                onClick={handleSubmit}
                disabled={!isFormValid}
                fullWidth
              >
                Add Beneficiary
              </CustomButton>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Box>
  );
};

export default AddBeneficiaryForm;

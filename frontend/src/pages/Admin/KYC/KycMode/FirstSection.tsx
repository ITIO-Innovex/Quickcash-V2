
import React, { useState } from 'react';
import { Box, Typography, useTheme, Radio, RadioGroup, FormControlLabel, FormControl, FormLabel } from '@mui/material';
import CustomInput from '../../../../components/CustomInputField';
import CustomButton from '../../../../components/CustomButton';
import toast from 'react-hot-toast';

const FirstSection = () => {
  const theme = useTheme();
  const [kycMode, setKycMode] = useState('manual');
  const [formData, setFormData] = useState({
    kycProvider: '',
    kycStatus: '',
    apiKey: '',
    otherKey: '',
    otherKey2: '',
    otherJsonData: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleKycModeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setKycMode(event.target.value);
    // Clear form data when switching modes
    if (event.target.value === 'manual') {
      setFormData({
        kycProvider: '',
        kycStatus: '',
        apiKey: '',
        otherKey: '',
        otherKey2: '',
        otherJsonData: ''
      });
      setErrors({});
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (kycMode === 'sumsub') {
      if (!formData.kycProvider.trim()) {
        newErrors.kycProvider = 'KYC Provider is required';
      }
      if (!formData.apiKey.trim()) {
        newErrors.apiKey = 'API Key is required';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    
    if (kycMode === 'sumsub' && !validateForm()) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    // Simulate API call
    toast.success('KYC Mode configuration saved successfully!');
    console.log('KYC Mode:', kycMode);
    console.log('Form Data:', formData);
  };

  return (
    <Box className="kyc-mode-container" sx={{backgroundColor:theme.palette.background.default}}>
      <Box className="kyc-mode-card">
        <Typography variant="h6" className="kyc-mode-title">
          Select KYC Mode
        </Typography>
        
        <FormControl component="fieldset" className="kyc-mode-radio-group">
          <RadioGroup
            value={kycMode}
            onChange={handleKycModeChange}
            className="kyc-radio-group"
          >
            <FormControlLabel 
              value="manual" 
              control={<Radio className="kyc-radio" />} 
              label="Manual KYC" 
              className="kyc-radio-option"
            />
            <FormControlLabel 
              value="sumsub" 
              control={<Radio className="kyc-radio" />} 
              label="Sumsub KYC" 
              className="kyc-radio-option"
            />
          </RadioGroup>
        </FormControl>

        <Typography variant="body1" className="kyc-mode-status">
          Currently selected: <strong>{kycMode === 'manual' ? 'Manual KYC' : 'Sumsub KYC'}</strong>
        </Typography>

        {kycMode === 'manual' && (
          <Typography variant="body2" className="kyc-mode-message">
            Please switch to Sumsub KYC to configure.
          </Typography>
        )}

        {kycMode === 'sumsub' && (
          <Box component="form" onSubmit={handleSubmit} className="kyc-config-form">
            <Typography variant="h6" className="kyc-config-title">
              Manage KYC Provider
            </Typography>
            
            <Box className="kyc-form-grid">
              <Box className="kyc-form-row">
                <CustomInput
                  label="KYC Provider"
                  name="kycProvider"
                  value={formData.kycProvider}
                  onChange={handleInputChange}
                  error={!!errors.kycProvider}
                  helperText={errors.kycProvider}
                  required
                />
                <CustomInput
                  label="KYC Status"
                  name="kycStatus"
                  value={formData.kycStatus}
                  onChange={handleInputChange}
                />
              </Box>
              
              <Box className="kyc-form-row">
                <CustomInput
                  label="API Key"
                  name="apiKey"
                  value={formData.apiKey}
                  onChange={handleInputChange}
                  error={!!errors.apiKey}
                  helperText={errors.apiKey}
                  required
                />
                <CustomInput
                  label="Other Key"
                  name="otherKey"
                  value={formData.otherKey}
                  onChange={handleInputChange}
                />
              </Box>
              
              <CustomInput
                label="Other Key 2"
                name="otherKey2"
                value={formData.otherKey2}
                onChange={handleInputChange}
              />
              
              <CustomInput
                label="Other JSON Data"
                name="otherJsonData"
                value={formData.otherJsonData}
                onChange={handleInputChange}
                multiline
                rows={4}
              />
            </Box>
            
            <Box className="kyc-form-actions">
              <CustomButton type="submit" className="kyc-submit-btn">
                Save Configuration
              </CustomButton>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default FirstSection;


import React, { useState } from 'react';
import { Box, Typography, useTheme, SelectChangeEvent } from '@mui/material';
import CustomInput from '../../../../components/CustomInputField';
import CustomSelect from '../../../../components/CustomDropdown';
import CustomButton from '../../../../components/CustomButton';
import CustomTextField from '@/components/CustomTextField';

const GeneralSettings = () => {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    businessName: '',
    contactEmail: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    taxId: '',
    currency: '',
    timeZone: '',
  });

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (event: SelectChangeEvent<string>) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    console.log('Form submitted:', formData);
  };

  const countryOptions = [
    { label: 'United States', value: 'US' },
    { label: 'Canada', value: 'CA' },
    { label: 'United Kingdom', value: 'UK' },
    { label: 'India', value: 'IN' },
  ];

  const currencyOptions = [
    { label: 'USD - US Dollar', value: 'USD' },
    { label: 'EUR - Euro', value: 'EUR' },
    { label: 'GBP - British Pound', value: 'GBP' },
    { label: 'INR - Indian Rupee', value: 'INR' },
  ];

  const timeZoneOptions = [
    { label: 'Eastern Time (ET)', value: 'America/New_York' },
    { label: 'Pacific Time (PT)', value: 'America/Los_Angeles' },
    { label: 'Central European Time (CET)', value: 'Europe/Berlin' },
    { label: 'Indian Standard Time (IST)', value: 'Asia/Kolkata' },
  ];

  return (
    <Box >
      <Typography variant="h6" sx={{ mb: 3, color: theme.palette.text.primary }}>
        General Settings
      </Typography>
      
      <form onSubmit={handleSubmit}>
        <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
          <CustomTextField
            label="Business Name"
            name="businessName"
            value={formData.businessName}
            onChange={handleInputChange}
            required
          />
          
          <CustomTextField
            label="Contact Email"
            name="contactEmail"
            type="email"
            value={formData.contactEmail}
            onChange={handleInputChange}
            required
          />
          
          <CustomTextField
            label="Phone Number"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
          />
          
          <CustomSelect
            label="Country"
            name="country"
            value={formData.country}
            onChange={handleSelectChange}
            options={countryOptions}
          />
          
          <CustomTextField
            label="Address"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}
          />
          
          <CustomTextField
            label="City"
            name="city"
            value={formData.city}
            onChange={handleInputChange}
          />
          
          <CustomTextField
            label="State/Province"
            name="state"
            value={formData.state}
            onChange={handleInputChange}
          />
          
          <CustomTextField
            label="ZIP/Postal Code"
            name="zipCode"
            value={formData.zipCode}
            onChange={handleInputChange}
          />
          
          <CustomTextField
            label="Tax ID"
            name="taxId"
            value={formData.taxId}
            onChange={handleInputChange}
          />
          
          <CustomSelect
            label="Default Currency"
            name="currency"
            value={formData.currency}
            onChange={handleSelectChange}
            options={currencyOptions}
          />
          
          <CustomSelect
            label="Time Zone"
            name="timeZone"
            value={formData.timeZone}
            onChange={handleSelectChange}
            options={timeZoneOptions}
          />
        </Box>
        
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
          <CustomButton type="submit" variant="contained">
            Save Changes
          </CustomButton>
        </Box>
      </form>
    </Box>
  );
};

export default GeneralSettings;

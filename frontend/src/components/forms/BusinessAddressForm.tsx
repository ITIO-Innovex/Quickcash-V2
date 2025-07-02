
import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import CustomInputField from '../CustomInputField';
import CustomDropdown from '../CustomDropdown';

interface BusinessAddressFormProps {
  values: {
    streetAddress: string;
    city: string;
    state: string;
    zipCode: string;
    addressCountry: string;
  };
  errors: {
    streetAddress?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    addressCountry?: string;
  };
  onChange: (name: string, value: string) => void;
}

const BusinessAddressForm: React.FC<BusinessAddressFormProps> = ({
  values,
  errors,
  onChange
}) => {
  const theme = useTheme();
  
  const countryOptions = [
    { label: 'United States', value: 'US' },
    { label: 'United Kingdom', value: 'UK' },
    { label: 'Canada', value: 'CA' },
    { label: 'Australia', value: 'AU' },
  ];

  return (
    <Box sx={{ display: 'grid', gap: 3 }}>
      <Typography variant="h6" sx={{ color: theme.palette.text.primary, mb: 2 }}>
        Where is your business registered?
      </Typography>
      <CustomInputField
        label="Street Address"
        name="streetAddress"
        value={values.streetAddress}
        onChange={(e) => onChange('streetAddress', e.target.value)}
        error={!!errors.streetAddress}
        helperText={errors.streetAddress}
      />
      <CustomInputField
        label="City"
        name="city"
        value={values.city}
        onChange={(e) => onChange('city', e.target.value)}
        error={!!errors.city}
        helperText={errors.city}
      />
      <CustomInputField
        label="State"
        name="state"
        value={values.state}
        onChange={(e) => onChange('state', e.target.value)}
        error={!!errors.state}
        helperText={errors.state}
      />
      <CustomInputField
        label="ZIP / Postal Code"
        name="zipCode"
        value={values.zipCode}
        onChange={(e) => onChange('zipCode', e.target.value)}
        error={!!errors.zipCode}
        helperText={errors.zipCode}
      />
      <CustomDropdown
        label="Country"
        name="addressCountry"
        value={values.addressCountry}
        onChange={(e) => onChange('addressCountry', e.target.value as string)}
        options={countryOptions}
      />
    </Box>
  );
};

export default BusinessAddressForm;

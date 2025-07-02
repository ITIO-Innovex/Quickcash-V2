
import React from 'react';
import { Box, useTheme } from '@mui/material';
import CustomInputField from '../CustomInputField';
import CustomDropdown from '../CustomDropdown';

interface PersonalInfoFormProps {
  values: {
    fullName: string;
    email: string;
    country: string;
  };
  errors: {
    fullName?: string;
    email?: string;
    country?: string;
  };
  onChange: (name: string, value: string) => void;
}

const PersonalInfoForm: React.FC<PersonalInfoFormProps> = ({

  values,
  errors,
  onChange
}) => {
  const countryOptions = [
    { label: 'United States', value: 'US' },
    { label: 'United Kingdom', value: 'UK' },
    { label: 'Canada', value: 'CA' },
    { label: 'Australia', value: 'AU' },
  ];
  return (
    <Box sx={{ display: 'grid', gap: 3 }}>
      <CustomInputField
        label="Full Name"
        name="fullName"
        value={values.fullName}
        onChange={(e) => onChange('fullName', e.target.value)}
        error={!!errors.fullName}
        helperText={errors.fullName}
      />
      <CustomInputField
        label="Email Address"
        name="email"
        type="email"
        value={values.email}
        onChange={(e) => onChange('email', e.target.value)}
        error={!!errors.email}
        helperText={errors.email}
      />
      <CustomDropdown
        label="Select a country"
        name="country"
        value={values.country}
        onChange={(e) => onChange('country', e.target.value as string)}
        options={countryOptions}
      />
    </Box>
  );
};

export default PersonalInfoForm;

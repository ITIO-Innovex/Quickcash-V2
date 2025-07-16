import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import api from '@/helpers/apiHelper';
import CustomDropdown from '../CustomDropdown';
import CustomInputField from '../CustomInputField';
const url = import.meta.env.VITE_NODE_ENV === "production" ? "api" : "api";

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
  onChange,
}) => {
  const [countryOptions, setCountryOptions] = useState<{ label: string; value: string }[]>([]);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await api.get(`/${url}/v1/user/getCountryList`);

        const countryList = res.data?.data?.country || [];

        const formatted = countryList.map((country: any) => ({
          label: country.name,
          value: country.id, 
        }));

        setCountryOptions(formatted);
      } catch (error) {
        console.error("❌ Error fetching country list:", error);
      }
    };

    fetchCountries();
  }, []);
  

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

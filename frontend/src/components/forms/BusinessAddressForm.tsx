
import api from '@/helpers/apiHelper';
import React, { useEffect, useState } from 'react';
import CustomDropdown from '../CustomDropdown';
import CustomInputField from '../CustomInputField';
import { Box, Typography, useTheme } from '@mui/material';
const url = import.meta.env.VITE_NODE_ENV === "production" ? "api" : "api";

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
  const [countryOptions, setCountryOptions] = useState<{ label: string; value: string }[]>([]);
  // const countryOptions = [
  //   { label: 'United States', value: 'US' },
  //   { label: 'United Kingdom', value: 'UK' },
  //   { label: 'Canada', value: 'CA' },
  //   { label: 'Australia', value: 'AU' },
  // ];

  useEffect(() => {
      const fetchCountries = async () => {
        try {
          const res = await api.get(`/${url}/v1/user/getCountryList`);
  
          const countryList = res.data?.data?.country || [];
  
          const formatted = countryList.map((country: any) => ({
            label: country.name,
            value: country.name, 
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
              label="Select a country"
              name="addressCountry"
              value={values.addressCountry}
              onChange={(e) => onChange('addressCountry', e.target.value as string)}
              options={countryOptions}
               error={!!errors.addressCountry }
              helperText={errors.addressCountry }
            />
    </Box>
  );
};

export default BusinessAddressForm;


import { Box } from '@mui/material';
import api from '@/helpers/apiHelper';
import CustomDropdown from '../CustomDropdown';
import React, { useEffect, useState } from 'react';
import CustomInputField from '../CustomInputField';
const url = import.meta.env.VITE_NODE_ENV === "production" ? "api" : "api";

interface BusinessDetailsFormProps {
  values: {
    businessName: string;
    businessType: string;
    companyRegistrationNumber: string;
    industryActivity: string;
    countryOfIncorporation: string;
    website: string;
  };
  errors: {
    businessName?: string;
    businessType?: string;
    industryActivity?: string;
    countryOfIncorporation?: string;
  };
  onChange: (name: string, value: string) => void;
}

const BusinessDetailsForm: React.FC<BusinessDetailsFormProps> = ({
  values,
  errors,
  onChange
}) => {
  const [countryOptions, setCountryOptions] = useState<{ label: string; value: string }[]>([]);
  
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
  
  const businessTypeOptions = [
    { label: 'Corporation', value: 'corporation' },
    { label: 'LLC', value: 'llc' },
    { label: 'Partnership', value: 'partnership' },
    { label: 'Sole Proprietorship', value: 'sole_proprietorship' },
  ];

  return (
    <Box sx={{ display: 'grid', gap: 3 }}>
      <CustomInputField
        label="Business Name"
        name="businessName"
        value={values.businessName}
        onChange={(e) => onChange('businessName', e.target.value)}
        error={!!errors.businessName}
        helperText={errors.businessName}
      />
      <CustomDropdown
        label="Type of Business"
        name="businessType"
        value={values.businessType}
        onChange={(e) => onChange('businessType', e.target.value as string)}
        options={businessTypeOptions}
        error={!!errors.businessType} // 👈 Error passed here
        helperText={errors.businessType}
      />
      <CustomInputField
        label="Company Registration Number (optional)"
        name="companyRegistrationNumber"
        value={values.companyRegistrationNumber}
        onChange={(e) => onChange('companyRegistrationNumber', e.target.value)}
      />
      <CustomInputField
        label="Industry / Business Activity"
        name="industryActivity"
        value={values.industryActivity}
        onChange={(e) => onChange('industryActivity', e.target.value)}
        error={!!errors.industryActivity}
        helperText={errors.industryActivity}
      />
      <CustomDropdown
        label="Country of Incorporation"
        name="countryOfIncorporation"
        value={values.countryOfIncorporation}
        onChange={(e) => onChange('countryOfIncorporation', e.target.value as string)}
        options={countryOptions}
        error={!!errors.countryOfIncorporation}
        helperText={errors.countryOfIncorporation}
      />
      <CustomInputField
        label="Website (optional)"
        name="website"
        value={values.website}
        onChange={(e) => onChange('website', e.target.value)}
      />
    </Box>
  );
};

export default BusinessDetailsForm;

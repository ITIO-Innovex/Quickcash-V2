import { Box } from '@mui/material';
import CustomDropdown from '../CustomDropdown';
import React from 'react';
import CustomInputField from '../CustomInputField';
import { useCurrency } from '@/hooks/useCurrency';

interface BankInfoFormProps {
  values: {
    bankName: string;
    accountNumber: string;
    swiftBic: string;
    currency: string;
  };
  errors: {
    bankName?: string;
    accountNumber?: string;
    swiftBic?: string;
    currency?: string;
  };
  onChange: (name: string, value: string) => void;
}

const BankInfoForm: React.FC<BankInfoFormProps> = ({
  values,
  errors,
  onChange,
}) => {
  const { currencyList } = useCurrency();

const currencyOptions = currencyList
  .filter((cur: any) => cur?.base_code) // ensure base_code exists
  .map((cur: any) => ({
    label: `${cur.currencyName?.trim() || cur.base_code} (${cur.base_code})`,
    value: cur.base_code,
  }));

  return (
    <Box sx={{ display: 'grid', gap: 3 }}>
      <CustomInputField
        label="Bank Name"
        name="bankName"
        value={values.bankName}
        onChange={(e) => onChange('bankName', e.target.value)}
        error={!!errors.bankName}
        helperText={errors.bankName}
      />
      <CustomInputField
        label="Account Number"
        name="accountNumber"
        value={values.accountNumber}
        onChange={(e) => onChange('accountNumber', e.target.value)}
        error={!!errors.accountNumber}
        helperText={errors.accountNumber}
      />
      <CustomInputField
        label="SWIFT/BIC Code"
        name="swiftBic"
        value={values.swiftBic}
        onChange={(e) => onChange('swiftBic', e.target.value)}
        error={!!errors.swiftBic}
        helperText={errors.swiftBic}
      />
      <CustomDropdown
        label="Select Currency"
        name="currency"
        value={values.currency}
        onChange={(e) => onChange('currency', e.target.value as string)}
        options={currencyOptions}
        error={!!errors.currency}
        helperText={errors.currency}
      />
    </Box>
  );
};

export default BankInfoForm;

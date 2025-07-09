import React from 'react';
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectProps as MuiSelectProps,
  useTheme,
  Box,
  Typography,
} from '@mui/material';
import Flag from 'react-world-flags';
import getSymbolFromCurrency from 'currency-symbol-map';

interface CountryOption {
  _id: string;
  currency: string;
  currencyName: string;
  country: string;
  countryName: string;
  status: boolean;
  defaultc: boolean;
}

interface CountryDropdownProps extends Omit<MuiSelectProps, 'variant'> {
  label: string;
  countries: CountryOption[];
  variant?: 'outlined' | 'filled' | 'standard';
  showFlag?: boolean;
  showCurrency?: boolean;
  showBalance?: boolean;
  userAccounts?: any[];
}

const CountryDropdown: React.FC<CountryDropdownProps> = ({ 
  label, 
  countries,
  variant = 'outlined',
  showFlag = true,
  showCurrency = true,
  showBalance = false,
  userAccounts = [],
  ...props 
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // Function to get balance for a specific currency
  const getBalanceForCurrency = (currency: string) => {
    const account = userAccounts.find((acc: any) => acc.currency === currency);
    return account ? parseFloat(account.amount).toFixed(2) : '0.00';
  };

  return (
    <FormControl fullWidth variant={variant}>
      <InputLabel
        sx={{
          color: isDark ? '#fff' : '#4a148c',
          '&.Mui-focused': {
            color: isDark ? '#fff' : '#4a148c',
          },
          '&.MuiInputLabel-shrink': {
            color: isDark ? '#fff' : '#4a148c',
          },
        }}
      >
        {label}
      </InputLabel>
      <Select
        label={label}
        variant={variant}
        {...props}
        sx={{
           height: 55,
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: isDark ? '#666' : '#ccc',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: isDark ? '#aaa' : '#888',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: isDark ? theme.palette.navbar.text : 'rgb(72, 53, 148)',
          },
          color: isDark ? '#fff' : '#000',
          '& .MuiSvgIcon-root': {
            color: isDark ? '#fff' : 'inherit',
          },
        }}
      >
        {countries.map((country) => (
          <MenuItem key={country._id} value={country.currency}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {showFlag && (
                  <Box className="country-flag" sx={{ width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    <Flag code={country.country} height="20" />
                  </Box>
                )}
                <Typography>
                  {getSymbolFromCurrency(country.currency)}
                  {showCurrency && ` ${country.currency}`}
                </Typography>
              </Box>
              {showBalance && (
                <Typography variant="body2" sx={{ color: theme.palette.success.main, fontWeight: 'bold' }}>
                  {getSymbolFromCurrency(country.currency)}{getBalanceForCurrency(country.currency)}
                </Typography>
              )}
            </Box>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default CountryDropdown;
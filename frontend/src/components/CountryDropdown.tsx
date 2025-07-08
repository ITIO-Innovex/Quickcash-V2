
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
  base_code: string;
  code: string;
  name: string;
  currency: string;
  flagCode: string;
  ba
}

interface CountryDropdownProps extends Omit<MuiSelectProps, 'variant'> {
  label: string;
  countries: CountryOption[];
  variant?: 'outlined' | 'filled' | 'standard';
  showFlag?: boolean;
  showCurrency?: boolean;
}

const CountryDropdown: React.FC<CountryDropdownProps> = ({ 
  label, 
  countries,
  variant = 'outlined',
  showFlag = true,
  showCurrency = true,
  ...props 
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

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
          <MenuItem key={country.base_code} value={country.base_code}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {showFlag && <Flag code={country.base_code} height="20" />}
              <Typography>
                {getSymbolFromCurrency(country.base_code)}
                {showCurrency && ` ${country.base_code}`}
              </Typography>
            </Box>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default CountryDropdown;

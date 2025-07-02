import React, { useState } from 'react';
import { TextField, TextFieldProps, useTheme } from '@mui/material';

type CustomInputProps = TextFieldProps & {
  required?: boolean;
};

const CustomInput: React.FC<CustomInputProps> = ({
  label = '',
  required,
  value,
  onChange,
  onBlur,
  ...props
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [touched, setTouched] = useState(false);

  const isError =
    required &&
    touched &&
    (value === '' || value === null || value === undefined || String(value).trim() === '');

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setTouched(true);
    if (onBlur) onBlur(e);
  };

  return (
    <TextField
      fullWidth
      variant="outlined"
      {...props}
      label={label}
      value={value}
      onChange={onChange}
      onBlur={handleBlur}
      error={isError}
      helperText={isError ? `${label} must be filled` : ''}
      InputLabelProps={{
        shrink: true,
        sx: {
          color: isDark ? '#fff' : '#4a148c',
          '&.Mui-focused': {
            color: isDark ? '#fff' : '#4a148c',
          },
          '&.MuiInputLabel-shrink': {
            color: isDark ? '#fff' : '#4a148c',
          },
        },
      }}
      sx={{
        '& .MuiOutlinedInput-root': {
          '& fieldset': {
            borderColor: isDark ? '#666' : '#ccc',
          },
          '&:hover fieldset': {
            borderColor: isDark ? '#aaa' : '#888',
          },
          '&.Mui-focused fieldset': {
            borderColor: isDark ? theme.palette.navbar?.text || '#fff' : 'rgb(72, 53, 148)',
          },
          '& input': {
            color: isDark ? '#fff' : '#000',
          },
        },
        '& input:-webkit-autofill': {
          WebkitBoxShadow: `0 0 0 1000px ${isDark ? '#2E073F' : '#fff'} inset`,
          WebkitTextFillColor: isDark ? '#fff' : '#000',
          transition: 'background-color 5000s ease-in-out 0s',
        },
      }}
    />
  );
};

export default CustomInput;

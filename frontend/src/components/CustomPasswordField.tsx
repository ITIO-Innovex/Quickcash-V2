import React, { useState } from 'react';
import {
  TextField,
  IconButton,
  InputAdornment,
  TextFieldProps,
  useTheme,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

const CustomPassword: React.FC<TextFieldProps> = ({
  label = 'Password',
  required,
  value,
  onChange,
  onBlur,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState(false);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const password = String(value || '');

  // ✅ Validation Rules
  const hasUpperCase = /[A-Z]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const hasNumber = /\d/.test(password);
  const isMinLength = password.length >= 8;
  const isEmpty = password.trim() === '';

  const isInvalid =
    required &&
    touched &&
    (isEmpty || !isMinLength || !hasUpperCase || !hasSpecialChar || !hasNumber);

  const getHelperText = () => {
    if (!isInvalid) return '';
    if (isEmpty) return 'Password is required';
    const errors = [];
    if (!isMinLength) errors.push('minimum 8 characters');
    if (!hasUpperCase) errors.push('1 uppercase letter');
    if (!hasSpecialChar) errors.push('1 special character');
    if (!hasNumber) errors.push('1 number');
    return `Password must include: ${errors.join(', ')}`;
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setTouched(true);
    if (onBlur) onBlur(e);
  };

  return (
    <TextField
      fullWidth
      variant="outlined"
     type="text" // keep constant so MUI doesn't conflict
inputProps={{
  type: showPassword ? 'text' : 'password',
}}
      label={label}
      value={value}
      onChange={onChange}
      onBlur={handleBlur}
      error={isInvalid}
      helperText={getHelperText()}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton
              onClick={(e) => {
                e.preventDefault();
                setShowPassword((prev) => !prev);
              }}
              edge="end"
              sx={{ color: isDark ? '#fff' : 'inherit' }}
            >
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </InputAdornment>
        ),
      }}
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
      {...props}
    />
  );
};

export default CustomPassword;

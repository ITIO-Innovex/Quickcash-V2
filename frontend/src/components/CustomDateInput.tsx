import React from 'react';
import { TextField, TextFieldProps, useTheme } from '@mui/material';

const CommonDateInput: React.FC<TextFieldProps> = ({ ...props }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <TextField
      {...props}
      type="date"
      fullWidth
      variant="outlined"
      InputLabelProps={{
        shrink: true, // force label to shrink for date
        sx: {
          color: isDark ? '#fff' : '#4a148c',
          '&.Mui-focused': {
            color: isDark ? '#fff' : '#4a148c',
          },
        },
      }}
      sx={{
        ...props.sx,
        '& .MuiOutlinedInput-root': {
          '& fieldset': {
            borderColor: isDark ? '#666' : '#ccc',
          },
          '&:hover fieldset': {
            borderColor: isDark ? '#aaa' : '#888',
          },
          '&.Mui-focused fieldset': {
            borderColor: isDark
              ? theme.palette.navbar?.text || '#fff'
              : 'rgb(72, 53, 148)',
          },
          '& input': {
            color: isDark ? '#fff' : '#483594',
          },
        },
        '& input::-webkit-calendar-picker-indicator': {
          filter: isDark ? 'invert(1)' : 'none',
          color: 'gray',
          cursor: 'pointer',
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

export default CommonDateInput;

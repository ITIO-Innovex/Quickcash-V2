
import React from 'react';
import { FormHelperText } from '@mui/material';
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectProps as MuiSelectProps,
  useTheme,
  Grid,
} from '@mui/material';

interface Option {
  label: string;
  value: string | number;
  img?: string;
  showFlag?: boolean;
  moreInfo?: string;
}

interface CustomSelectProps extends Omit<MuiSelectProps, 'variant'> {
  label: string;
  options: Option[];
  variant?: 'outlined' | 'filled' | 'standard';
  img?: string; 
  showFlag?: boolean;
  moreInfo?: string;
  helperText?: string;         // ✅ Add this
  error?: boolean; 
}

const CustomSelect: React.FC<CustomSelectProps> = ({ 
  label, 
  options, 
  variant = 'outlined',
  helperText = '',
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
        {options.map((opt) => (
        <MenuItem key={opt.value} value={opt.value}>
          {typeof opt.label === "string" ? (
            <Grid
              sx={{
                display: "flex",
                flexDirection: "row",
                gap: "10px",
                justifyContent: "normal",
              }}
            >
              {opt.img && (
                <Grid>
                  <img
                    loading="lazy"
                    style={{ height: "30px", width: "60px" }}
                    src={`${import.meta.env.VITE_APP_URL}/${opt?.img}`}
                    alt="UPI"
                  />
                </Grid>
              )}
              <Grid
                sx={{ marginTop: "3px" }}
                className={`${theme ? "avatarDark" : "avatarLight"}`}
              >
                {opt.label}
                <span style={{ fontSize: "10px", marginLeft: "12px" }}>
                  {opt?.moreInfo}
                </span>
              </Grid>
            </Grid>
          ) : (
            // If label is JSX (like your coin dropdown), just render it directly
            opt.label
          )}
        </MenuItem>
      ))}
      </Select>
       {/* ✅ Show helper text below the Select */}
      {helperText && (
        <FormHelperText sx={{color:'red'}}>{helperText}</FormHelperText>
      )}
    </FormControl>
  );
};

export default CustomSelect;

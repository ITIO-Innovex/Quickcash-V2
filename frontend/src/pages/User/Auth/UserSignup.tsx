import axios from 'axios';
import { toast } from 'react-toastify';
import curr from 'iso-country-currency';
import ReactFlagsSelect from 'react-flags-select';
import React, { useState, useEffect } from 'react';
import CustomButton from '@/components/CustomButton';
import CustomInput from '@/components/CustomInputField';
import { useSettings } from '@/contexts/SettingsContext'; 
import CustomPassword from '@/components/CustomPasswordField';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { isValidateEmail, isValidPassword } from '@/utils/validator';
import { Box, IconButton, Typography, useTheme } from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';

// Utility functions
const validate = (field: string, value: string): boolean => {
  switch (field) {
    case 'email':
      return !isValidateEmail(value);
    case 'password':
      return !isValidPassword(value);
    default:
      return false;
  }
};

const UserSignup = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const url = import.meta.env.VITE_NODE_ENV == "production" ? 'api' : 'api';
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  console.log(API_URL);

  const [loading, setLoading] = useState(false);
  const { themeMode, toggleTheme } = useSettings();
  const [country, setCountry] = useState('');
  const [ipAddress, setIPAddress] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    country: '',
  });

  const getIpAddress = async () => {
    try {
      const response = await axios.get(`https://api.ipify.org/?format=json`);
      setIPAddress(response.data.ip);
    } catch (error) {
      console.error("Error fetching IP address:", error);
      toast.error("Failed to get IP address");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    } catch (error) {
      console.error("Error updating form data:", error);
      toast.error("Failed to update form");
    }
  };

  const HandleCountryCurrency = (code: string) => {
    try {
      setCountry(code);
      setFormData(prev => ({ ...prev, country: code }));
    } catch (error) {
      console.error("Error setting country:", error);
      toast.error("Failed to set country");
    }
  };

  const addLoginSession = async (val: string) => {
    try {
      const result = await axios.post(`/${url}/v1/session/add`, {
        user: val,
        device: navigator.userAgent,
        OS: navigator.platform,
        ipAddress: ipAddress,
        status: 1,
        isActiveNow: 1
      });

      if (result.data.status === 201) {
        localStorage.setItem('usersessionid', result.data.data._id);
      } else {
        throw new Error("Failed to create session");
      }
    } catch (error: any) {
      console.error("Login session error:", error);
      toast.error(error.response?.data?.message || "Failed to create session");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!validate("email", formData.email) && !validate("password", formData.password)) {
        const currencyData = curr.getAllInfoByISO(country);
        
        const result = await axios.post(`/${url}/v1/user/register`, {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          country: formData.country,
          currency: currencyData?.currency || 'USD',
          referalCode: query?.get('code') || ""
        }, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (result.data.status === "201") {
          try {
            await addLoginSession(result.data.data._id);
            localStorage.setItem("token", result.data.token);
            toast.success(result.data.message);
            navigate('/dashboard');
          } catch (sessionError) {
            console.error("Session creation error:", sessionError);
            toast.error("Account created but session creation failed");
            navigate('/dashboard'); // Still navigate even if session creation fails
          }
        } else {
          throw new Error(result.data.message || "Registration failed");
        }
      } else {
        const errors = [];
        if (validate("email", formData.email)) {
          errors.push("Invalid email format");
        }
        if (validate("password", formData.password)) {
          errors.push("Invalid password format");
        }
        errors.forEach(error => toast.error(error));
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getIpAddress();
  }, []);
  return (
    <Box className="signup-container">
      <Box className="left-container">
      </Box>
      <Box className="right-container">

        <Box className="signup-box">
          <Typography variant="h5" className="signup-title" sx={{ color: theme => theme.palette.navbar.text }}>
            Welcome to Quick Cash
          </Typography>
          <Typography variant="body1" className="signup-subtitle" style={{ color: theme.palette.text.gray }}>
            Register your account
          </Typography>
          <form onSubmit={handleSubmit} className="signup-form" autoComplete="off">
            <CustomInput
              name="name"
              label="Full Name"
              variant="outlined"
              fullWidth
              value={formData.name}
              onChange={handleChange}
              autoComplete="new-name"
              required
            />
            <CustomInput
              name="email"
              label="Email Address"
              type="email"
              variant="outlined"
              fullWidth
              value={formData.email}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              autoComplete="new-email"
              required
            />
              <CustomPassword
                name="password"
                label="Password"
                type="password"
                variant="outlined"
                fullWidth
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
                required
              />
            <Box sx={{ mb: 2 }}>
              <Box sx={{ 
                '& .flag-select': {
                  width: '100%',
                  '& .flag-select__btn': {
                    width: '100%',
                    padding: '16.5px 14px',
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: '4px',
                    backgroundColor: 'transparent',
                    color: theme.palette.text.primary,
                    fontSize: '1rem',
                    fontFamily: theme.typography.fontFamily,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    '&:hover': {
                      borderColor: theme.palette.primary.main,
                    },
                    '&:focus': {
                      borderColor: theme.palette.primary.main,
                      outline: 'none',
                      boxShadow: `0 0 0 2px ${theme.palette.primary.main}20`
                    }
                  },
                  '& .flag-select__options': {
                    backgroundColor: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: '4px',
                    marginTop: '4px',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    boxShadow: theme.shadows[2],
                    '&::-webkit-scrollbar': {
                      width: '8px',
                    },
                    '&::-webkit-scrollbar-track': {
                      background: theme.palette.background.default,
                    },
                    '&::-webkit-scrollbar-thumb': {
                      background: theme.palette.divider,
                      borderRadius: '4px',
                    }
                  },
                  '& .flag-select__option': {
                    padding: '8px 14px',
                    fontSize: '1rem',
                    fontFamily: theme.typography.fontFamily,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover
                    },
                    '&.flag-select__option--selected': {
                      backgroundColor: `${theme.palette.primary.main}20`,
                      color: theme.palette.primary.main
                    }
                  },
                  '& .flag-select__search': {
                    padding: '8px 14px',
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    '& input': {
                      width: '100%',
                      padding: '8px',
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: '4px',
                      fontSize: '1rem',
                      fontFamily: theme.typography.fontFamily,
                      '&:focus': {
                        outline: 'none',
                        borderColor: theme.palette.primary.main
                      }
                    }
                  }
                }
              }}>
                <ReactFlagsSelect
                  selected={country}
                  onSelect={(code) => HandleCountryCurrency(code)}
                  searchable
                  showOptionLabel={true}
                  showSelectedLabel={true}
                  placeholder="Select Country"
                />
              </Box>
            </Box>
            <CustomButton
              type="submit"
              fullWidth
              loading={loading}
            >
              Sign Up
            </CustomButton>
          </form>
          <Box className="form-footer">
            <Typography variant="body2" sx={{color: theme.palette.text.gray}}>
              Already have an account?{' '}
              <Link to="/login" className="signin-link" style={{ color: theme.palette.navbar.text }}>
                Sign in instead
              </Link>
            </Typography>
            <Typography variant="caption" className="copyright-text" sx={{ color: theme.palette.text.gray }}>
              © Quick Cash 2025.
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default UserSignup;

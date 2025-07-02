import React, { useEffect, useState } from 'react';
import { Box, Typography, TextField } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CustomButton from '../../../components/CustomButton';
import api from '@/helpers/apiHelper';
import { jwtDecode } from 'jwt-decode'; // npm install jwt-decode

const url = import.meta.env.VITE_NODE_ENV === "production" ? "api" : "api";

interface JwtPayload {
  sub: string;
  role: string;
  iat: number;
  exp: number;
  data: {
    defaultcurr: string;
    email: string;
    id: string;
    name: string;
    type: string;
  };
}

const SecurityForm = () => {
  const theme = useTheme();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpStatus, setOtpStatus] = useState(false);
  const [verifyOtp, setVerifyOtp] = useState('');
  const [valOtp, setValOtp] = useState('');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  const validatePassword = (value: string) => value.length >= 6;
  const passwordsMatch = (pass: string, confirm: string) => pass === confirm;

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode<JwtPayload>(token);
      if (decoded.data?.email) setEmail(decoded.data.email);
      if (decoded.data?.name) setName(decoded.data.name);
      } catch (err) {
        console.error("Invalid token:", err);
      }
    }
  }, []);

  const sendOTP = async () => {
    if (password === '' || confirmPassword === '') {
      setMessage('Please enter both password and confirm password');
      return;
    }

    if (!validatePassword(password)) {
      setMessage('Password must be at least 6 characters');
      return;
    }

    if (!passwordsMatch(password, confirmPassword)) {
      setMessage('Passwords do not match');
      return;
    }

    try {
      const response = await api.post(`/${url}/v1/user/send-email`, {
        email,
        name
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.status === 201) {
        setVerifyOtp(response.data.data);
        setOtpStatus(true);
        setMessage('OTP sent to your email');
      }
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Failed to send OTP');
    }
  };

  const changePassword = async () => {
    if (!validatePassword(password)) {
      setMessage('Password must be at least 6 characters');
      return;
    }

    if (!passwordsMatch(password, confirmPassword)) {
      setMessage('Passwords do not match');
      return;
    }

    if (verifyOtp !== valOtp) {
      setMessage('Invalid OTP');
      return;
    }

    try {
      const response = await api.patch(`/${url}/v1/user/change-password`, {
        new_passsword: password,
        confirm_password: confirmPassword
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.status === 201) {
        setOtpStatus(false);
        setPassword('');
        setConfirmPassword('');
        setValOtp('');
        setMessage('Password changed successfully');
      }
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Failed to change password');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpStatus) {
      sendOTP();
    } else {
      changePassword();
    }
  };

  return (
    <Box sx={{ p: 3, backgroundColor: theme.palette.background.default, color: theme.palette.text.primary }}>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
        Generate Password
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 600 }}>
        <TextField
          label="New Password"
          fullWidth
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={{ mb: 3 }}
        />

        <TextField
          label="Confirm Password"
          fullWidth
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          sx={{ mb: 3 }}
        />

        {otpStatus && (
          <TextField
            label="Enter OTP"
            fullWidth
            value={valOtp}
            onChange={(e) => setValOtp(e.target.value)}
            sx={{ mb: 3 }}
          />
        )}

        {message && (
          <Typography variant="body2" color="error" sx={{ mb: 2 }}>
            {message}
          </Typography>
        )}

        <CustomButton type="submit">
          {otpStatus ? 'VERIFY & CHANGE PASSWORD' : 'SEND OTP'}
        </CustomButton>
      </Box>
    </Box>
  );
};

export default SecurityForm;

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
  const [otpStatus, setOtpStatus] = useState(false); // OTP sent
  const [otpVerified, setOtpVerified] = useState(false); // OTP verified
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
    console.log('Sending OTP to:', email);
    if (!email || !name) {
      setMessage('User email or name missing');
      return;
    }
    try {
      const response = await api.post(`/${url}/v1/user/send-email`, {
        email: email.trim().toLowerCase(),
        name
      });
      if (response.data.status === 201) {
        setOtpStatus(true);
        setMessage('OTP sent to your email');
      }
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Failed to send OTP');
    }
  };

  const verifyOtpBackend = async () => {
    console.log('Verifying OTP for:', email);

    if (!valOtp) {
      setMessage('Please enter the OTP');
      return;
    }
    try {
      console.log('Verifying OTP for email:', email);
      const response = await api.post(`/${url}/v1/user/verify-otp`, { email: email.trim().toLowerCase(), otp: valOtp });
      if (response.data.status === 200) {
        setOtpVerified(true);
        setMessage('OTP verified! You can now change your password.');
      } else {
        setMessage('Invalid OTP');
      }
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'OTP verification failed');
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
    try {
      const response = await api.patch(`/${url}/v1/user/change-password`, {
        new_passsword: password,
        confirm_password: confirmPassword
      });
      if (response.data.status === 201) {
        setOtpStatus(false);
        setOtpVerified(false);
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
    } else if (!otpVerified) {
      verifyOtpBackend();
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
        {/* Show OTP input after OTP is sent, before verified */}
        {otpStatus && !otpVerified && (
          <TextField
            label="Enter OTP"
            fullWidth
            value={valOtp}
            onChange={(e) => setValOtp(e.target.value)}
            sx={{ mb: 3 }}
          />
        )}

        {/* Show password fields only if OTP is not sent yet, or OTP is verified */}
        {(!otpStatus || otpVerified) && (
          <>
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
          </>
        )}

        {message && (
          <Typography variant="body2" color="error" sx={{ mb: 2 }}>
            {message}
          </Typography>
        )}

        <CustomButton type="submit">
          {!otpStatus ? 'SEND OTP' : !otpVerified ? 'VERIFY OTP' : 'CHANGE PASSWORD'}
        </CustomButton>
      </Box>
    </Box>
  );
};

export default SecurityForm;

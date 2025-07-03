import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import CustomInput from '@/components/CustomInputField';
import CustomButton from '@/components/CustomButton';
import { useNavigate, useParams } from 'react-router-dom';
import { isEmpty, isValidPassword } from '@/utils/validator';
import { showToast } from '@/utils/toastContainer';
import useValidation from '@/helpers/userValidation';
import api from '@/helpers/apiHelper';

const ResetPassword: React.FC = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const { errors, validate } = useValidation();
  const { "*": token } = useParams();
  const navigate = useNavigate();
  const url = import.meta.env.VITE_NODE_ENV == "production" ? 'api' : 'api';
  console.log("Token:", token);
  const handleSubmit = async () => {
    console.log("Submit clicked");
    setError('');
    if (isEmpty(newPassword)) return setError('Password is required');
    if (!isValidPassword(newPassword)) return setError('Password must be at least 6 characters');
    if (newPassword !== confirmPassword) return setError('Passwords do not match');

    const passwordError = validate("password", newPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }
    const cpasswordError = validate("cpassword", confirmPassword, newPassword);
    if (cpasswordError) {
      setError(cpasswordError);
      return;
    }

    try {
      const result = await api.post(`/${url}/v1/user/reset-password`, {
        token,
        password: newPassword,
      },
        );
      if (result.data.status === 201) {
        setShowSuccess(true);
        showToast(result.data.message, "success");
        setTimeout(() => {
          setShowSuccess(false);
          navigate('/');
        }, 2000);
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error resetting password');
      showToast(error.response?.data?.message || 'Error resetting password', "error");
    }
  };

  return (
    <Box className="modal-container2" sx={{ backgroundColor: (theme) => theme.palette.background.paper }}>
      <Typography variant="h6" className="modal-heading" sx={{ color: (theme) => theme.palette.navbar.text, mb: 2 }}>
        Reset Password
      </Typography>
      <Typography className="modal-subtext" sx={{ mb: 2 }}>
        Enter your new password
      </Typography>
      <Box display="flex" flexDirection="column" gap={2}>
        <CustomInput
          fullWidth
          className="modal-input"
          label="New Password"
          type="password"
          variant="outlined"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          error={!!error && error.toLowerCase().includes('password')}
          helperText={error && error.toLowerCase().includes('password') ? error : ''}
        />
        <CustomInput
          fullWidth
          className="modal-input"
          label="Confirm Password"
          type="password"
          variant="outlined"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={!!error && error.toLowerCase().includes('match')}
          helperText={error && error.toLowerCase().includes('match') ? error : ''}
        />
        <CustomButton variant="contained" className="modal-btn" onClick={handleSubmit} fullWidth>
          Submit
        </CustomButton>
      </Box>
      {showSuccess && (
        <Typography sx={{ color: 'green', mt: 2, textAlign: 'center' }}>
          Password reset successful!
        </Typography>
      )}
    </Box>
  );
};

export default ResetPassword; 
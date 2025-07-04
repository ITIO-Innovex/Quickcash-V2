import { useState } from 'react';
import Lottie from 'lottie-react';
import { useNavigate } from 'react-router-dom';
import successAnim from '../assets/Success.json';
import CloseIcon from '@mui/icons-material/Close';
import CustomButton from '@/components/CustomButton';
import CustomInput from '@/components/CustomInputField';
import { useSettings } from '@/contexts/SettingsContext';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { isValidateEmail, isEmpty, isValidPassword } from '@/utils/validator';
import { Typography, Modal, IconButton, Box, useTheme } from '@mui/material';
import axios from 'axios';
import { useAppToast } from '@/utils/toast'; 

interface Props {
  open: boolean;
  onClose: () => void;
}

const ForgotPasswordModal: React.FC<Props> = ({ open, onClose }) => {
  const theme = useTheme();
  const toast = useAppToast(); 
  const { themeMode, toggleTheme } = useSettings();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleContinue = async () => {
    setError("");
    if (isEmpty(email)) return setError('Email is required');
    if (!isValidateEmail(email)) return setError('Enter a valid email');
    const url = import.meta.env.VITE_NODE_ENV == "production" ? 'api' : 'api';
    try {
      const result = await axios.post(`/${url}/v1/user/forget-password`, {
        email: email
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (result.data.status == 201) {
        toast.success("Check your Registered mail, we have sent a reset password link");
        navigate('/');
      }
    } catch (error: any) {
      setError(error.response?.data?.message || "Error sending reset link");
      toast.error(error.response?.data?.message || "Error sending reset link");
    }
  };

  const handleSubmit = () => {
    setError('');

    if (isEmpty(newPassword)) return setError('passsword is required');
    if (!isValidPassword(newPassword)) return setError('password must be atleast 6 characters');

    // console.log("Resetting password to:", newPassword);

    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      onClose();
      navigate('/');
    }, 2000);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box className="modal-container" sx={{ backgroundColor: (theme) => theme.palette.background.paper }} >
        <Box className='t-icon'>
          <IconButton onClick={toggleTheme} color="inherit">
            {themeMode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Box>
        {showSuccess ? (
          <Box className="success-animation-wrapper">
            <Lottie animationData={successAnim} loop={false} style={{ width: 120, height: 120 }} />
            <Typography className="modal-heading" style={{ textAlign: 'center' }} sx={{ color: (theme) => theme.palette.navbar.text }} >
              Password Reset Successful!
            </Typography>
          </Box>
        ) : (
          <>
            <IconButton aria-label="close" onClick={onClose} className="modal-close">
              <CloseIcon />
            </IconButton>

            <Typography variant="h6" className="modal-heading" sx={{ color: (theme) => theme.palette.navbar.text }}>
              Forgot Password
            </Typography>

            <Typography className="modal-subtext">
              Please enter your email address. You will receive a link to create a new password via email.
            </Typography>

            <CustomInput fullWidth className="modal-input" label="Email" variant="outlined" value={email} onChange={(e) => setEmail(e.target.value)} error={!!error} helperText={error}/>

            <CustomButton variant="contained" className="modal-btn" onClick={handleContinue} fullWidth>
              Continue
            </CustomButton>
          </>
        )}
      </Box>
    </Modal>
  );
};

export default ForgotPasswordModal;

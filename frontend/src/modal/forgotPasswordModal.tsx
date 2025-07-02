
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

interface Props {
  open: boolean;
  onClose: () => void;
}

const ForgotPasswordModal: React.FC<Props> = ({ open, onClose }) => {
  const theme = useTheme();
  const { themeMode, toggleTheme } = useSettings();
  const navigate = useNavigate();
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleContinue = () => {

    if (step === 1) {
      if (isEmpty(email)) return setError('Email is required');
      if (!isValidateEmail(email)) return setError ('Enter a valid email');

      console.log("Sending OTP to:", email);
      setStep(2);

    } else if (step === 2) {
      if(isEmpty(otp)) return setError('OTP is required');
      console.log("Verifying OTP:", otp);
      setStep(3);
    }
  };

  const handleSubmit = () => {
    setError('');

    if(isEmpty(newPassword)) return setError('passsword is required');
    if(!isValidPassword(newPassword)) return setError ('password must be atleast 6 characters');

    console.log("Resetting password to:", newPassword);

    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      onClose();
      navigate('/myapp/web');
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
          {step === 1 && "Enter your registered email to receive an OTP"}
          {step === 2 && "Enter the OTP we've sent to your email"}
          {step === 3 && "Enter your new password"}
        </Typography>

        {step === 1 && (
          <CustomInput fullWidth className="modal-input" label="Email" variant="outlined" value={email} onChange={(e) => setEmail(e.target.value)} error={!!error} helperText={step === 1 && error}/>
        )}

        {step === 2 && (
          <CustomInput fullWidth className="modal-input" label="Enter OTP" variant="outlined" value={otp} onChange={(e) => setOtp(e.target.value)}  error={!!error} helperText={step === 2 && error}/>
        )}

        {step === 3 && (
          <CustomInput fullWidth className="modal-input" label="New Password" type="password" variant="outlined" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}  error={!!error} helperText={step === 3 && error}/>
        )}

        {step < 3 ? (
          <CustomButton variant="contained" className="modal-btn" onClick={handleContinue} fullWidth>
            {step === 1 ? 'Continue' : 'Verify OTP'}
          </CustomButton>
        ) : (
          <CustomButton variant="contained" className="modal-btn" onClick={handleSubmit} fullWidth>
            Submit
          </CustomButton>
        )}
          </>
        )}
      </Box>
    </Modal>
  );
};

export default ForgotPasswordModal;

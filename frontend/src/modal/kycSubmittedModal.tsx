import { useAppToast } from '@/utils/toast'; 
import { useNavigate } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import { useAuth } from '@/contexts/authContext';
import CustomModal from '@/components/CustomModal';

const KYCSubmittedModal = ({ open }: { open: boolean }) => {
  const { logout } = useAuth();
  const toast = useAppToast(); 
  const navigate = useNavigate();

  const handleClose = () => {
    logout();
    toast.success('Logout Successfully!');
    navigate('/');
  };

  return (
    <CustomModal open={open} onClose={handleClose} title="" maxWidth="sm">
      <Box className="kyc-submitted-container">
        <Box className="kyc-submitted-icon">
          <Box className="check-icon">✓</Box>
        </Box>

        <Typography variant="h5" className="kyc-submitted-title">
          KYC form is submitted successfully
        </Typography>

        <Typography className="kyc-submitted-description">
          Your submission is now under review by our administration team.
          Please allow some time for the approval process. You will receive an
          email notification once your verification has been completed.
        </Typography>
      </Box>
    </CustomModal>
  );
};

export default KYCSubmittedModal;

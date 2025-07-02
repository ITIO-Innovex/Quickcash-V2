
import React from 'react';
import { Box, Typography } from '@mui/material';
import CustomModal from '@/components/CustomModal';
import CustomButton from '@/components/CustomButton';

interface KYCPendingModalProps {
  open: boolean;
  onStartVerification: () => void;
}

const KYCPendingModal: React.FC<KYCPendingModalProps> = ({
  open,
  onStartVerification,
}) => {
  return (
    <CustomModal
      open={open}
      onClose={onStartVerification}
      title=""
      maxWidth="sm"
    >
      <Box className="kyc-pending-container">
        <Box className="kyc-pending-icon">
          <Box className="check-icon">✓</Box>
        </Box>
        
        <Typography variant="h5" className="kyc-pending-title">
          KYC is pending
        </Typography>
        
        <Typography className="kyc-pending-description">
          To begin using our services, we first need to complete the Know Your
          Customer (KYC) process. This is a mandatory step to verify your identity
          and ensure compliance with regulatory requirements.
        </Typography>
        
          <CustomButton
            className="kyc-start-button"
            onClick={onStartVerification}
            fullWidth
          >
            Start Verification
          </CustomButton>
      </Box>
    </CustomModal>
  );
};

export default KYCPendingModal;

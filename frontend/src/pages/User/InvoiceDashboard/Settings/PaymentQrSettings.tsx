
import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import CustomButton from '@/components/CustomButton';

const PaymentQrSettings = () => {
  const [qrSettings, setQrSettings] = useState({
    qrEnabled: false,
    paymentMethod: '',
    qrData: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('QR Settings:', qrSettings);
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h6" sx={{ mb: 3 }}>
        Payment QR Code Configuration
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 2, color: 'text.secondary' }}>
        Payment QR code settings will be available in future updates.
      </Typography>

      <CustomButton type="submit">
        Save QR Settings
      </CustomButton>
    </Box>
  );
};

export default PaymentQrSettings;

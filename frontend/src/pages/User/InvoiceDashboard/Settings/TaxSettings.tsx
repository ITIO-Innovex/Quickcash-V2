
import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import CustomButton from '@/components/CustomButton';

const TaxSettings = () => {
  const [taxSettings, setTaxSettings] = useState({
    taxRate: '',
    taxType: '',
    includeTax: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Tax Settings:', taxSettings);
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h6" sx={{ mb: 3 }}>
        Tax Configuration
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 2, color: 'text.secondary' }}>
        Tax settings will be available in future updates.
      </Typography>

      <CustomButton type="submit">
        Save Tax Settings
      </CustomButton>
    </Box>
  );
};

export default TaxSettings;

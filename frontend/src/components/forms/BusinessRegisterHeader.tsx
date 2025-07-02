
import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';

const BusinessRegisterHeader = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.primary,
        p: 1,
        borderRadius: 1,
        mb: 3,
        textAlign: 'center'
      }}
    >
      <Typography
        variant="body1"
        sx={{
          color: theme.palette.text.gray,
          maxWidth: 600,
          mx: 'auto'
        }}
      >
        Let's get your business account set up! Complete all steps to start using our business services.
      </Typography>
    </Box>
  );
};

export default BusinessRegisterHeader;

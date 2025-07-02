
import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';

const Header = () => {
  const theme = useTheme();

  return (
    <>
      <Box className="header-container">
        <Box className="header-top">
          <Typography 
            variant="h5" 
            component="h1" 
            className="stat-heading"
            sx={{ color: theme.palette.text.primary }}
          >
            Invoice Settings
          </Typography>
        </Box>
        <div className="header-divider" />
      </Box>
    </>
  );
};

export default Header;


import React from 'react';
import { Box, Typography, Grid } from '@mui/material';
import CustomButton from '@/components/CustomButton';
import PageHeader from '@/components/common/pageHeader';

interface HeaderProps {
  onOpenPending: () => void;
  onOpenVerify: () => void;
  onOpenSubmitted: () => void;
}

const Header: React.FC<HeaderProps> = ({
  onOpenPending,
  onOpenVerify,
  onOpenSubmitted,
}) => {
  return (
        <Box>
          <PageHeader title='KYC' />
      
      <Box className="demo-buttons">
        <Grid container spacing={2} justifyContent="center">
          <Grid item xs={12} sm={4}>
            <CustomButton
              className="demo-button"
              onClick={onOpenPending}
              fullWidth
            >
              KYC Pending
            </CustomButton>
          </Grid>
          <Grid item xs={12} sm={4}>
            <CustomButton
              className="demo-button"
              onClick={onOpenVerify}
              fullWidth
            >
              Email Verify
            </CustomButton>
          </Grid>
          <Grid item xs={12} sm={4}>
            <CustomButton
              className="demo-button"
              onClick={onOpenSubmitted}
              fullWidth
            >
              KYC Submitted
            </CustomButton>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default Header;


import React, { useState } from 'react';
import { Box, Typography, Paper, TextField, Button, useTheme } from '@mui/material';
import { ContentCopy } from '@mui/icons-material';

const ReferralCard = () => {
  const theme = useTheme();
  const [referralLink] = useState('https://quickcash.com/register?code=5jUKenhP');

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    console.log('Referral link copied!');
  };

  return (
    <Paper 
      sx={{ 
        p: 4, 
        mb: 4, 
        background: theme.palette.background.gray,
        borderRadius: 3,
        position: 'relative',
        overflow: 'hidden',
        color:theme.palette.text.primary,
      }}
    >
      {/* Decorative elements */}
      <Box sx={{ 
        position: 'absolute', 
        top: 20, 
        right: 20, 
        width: 8, 
        height: 8, 
        borderRadius: '50%', 
      }} />
      <Box sx={{ 
        position: 'absolute', 
        top: 40, 
        right: 60, 
        width: 6, 
        height: 6, 
        borderRadius: '50%',  
      }} />
      <Box sx={{ 
        position: 'absolute', 
        bottom: 30, 
        left: 30, 
        width: 4, 
        height: 4, 
        borderRadius: '50%', 
 
      }} />
      <Box sx={{ 
        position: 'absolute', 
        bottom: 50, 
        left: 60, 
        width: 5, 
        height: 5, 
        borderRadius: '50%', 
         
      }} />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', }}>
        <Box sx={{ flex: 1, pr: 4 }}>
          <Typography variant="h5" component="h2" sx={{ fontWeight: 700, mb: 2,color:theme.palette.text.primary  }}>
            Invite Your Friends And Get Rewards
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 ,color:theme.palette.text.primary}}>
            Tell your friends about Smart Energy Pay. Copy and paste the referral URL provided below to as many people as possible. Receive interesting incentives and deals as a reward for your recommendation!
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              value={referralLink}
              variant="outlined"
              size="small"
              sx={{ 
                flex: 1,
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'theme.palette.background.gray',
                  '& fieldset': {
                    borderColor: '#ddd',
                  },
                }
              }}
              InputProps={{
                readOnly: true,
                sx: { fontSize: '0.875rem' }
              }}
            />
            <Button
              onClick={handleCopyLink}
              sx={{
                bgcolor: '#483594',
                color: 'white',
                minWidth: 'auto',
                p: 1,
                '&:hover': {
                  bgcolor: '#3a2b7a',
                }
              }}
            >
              <ContentCopy sx={{ fontSize: '1.2rem' }} />
            </Button>
          </Box>
        </Box>

        {/* Coin Image */}
        <Box sx={{ 
          display: { xs: 'none', md: 'block' },
          width: 200,
          height: 200,
          backgroundImage: 'url("/userdashboard2.png")',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center'
        }} />
      </Box>
    </Paper>
  );
};

export default ReferralCard;

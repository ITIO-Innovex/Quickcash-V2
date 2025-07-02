
import React from 'react';
import { Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const HowItWorksSection = () => {
  const theme = useTheme();

  const steps = [
    {
      number: 1,
      title: "GET YOUR LINK",
      description: "Sign up for the platform, begin trading, and receive the above-mentioned referral link."
    },
    {
      number: 2,
      title: "SHARE YOUR LINK",
      description: "Distribute the generated link to the specified number of sources."
    },
    {
      number: 3,
      title: "EARN WHEN THEY TRADE",
      description: "Receive interesting incentives and deals as a reward for your recommendation.",
      highlight: true
    }
  ];

  return (
    <Box sx={{ mb: 6 }}>
      <Typography variant="h5" component="h2" sx={{ 
        textAlign: 'center', 
        mb: 2, 
        fontWeight: 600,
        color: theme.palette.text.primary 
      }}>
        How Does it Work?
      </Typography>
      <Typography variant="body1" sx={{ 
        textAlign: 'center', 
        mb: 4, 
        color: theme.palette.text.primary,
        maxWidth: '800px',
        mx: 'auto'
      }}>
        All you have to do is develop campaigns, distribute them, and you'll be able to profit from our lucrative trading platform in no time.
      </Typography>

      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
        gap: 4,
        mt: 4
      }}>
        {steps.map((step) => (
          <Box key={step.number} sx={{ textAlign: 'center', position: 'relative' }}>
            <Box sx={{ 
              width: 60, 
              height: 60, 
              borderRadius: '50%', 
              bgcolor: '#483594', 
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
              fontSize: '1.5rem',
              fontWeight: 'bold'
            }}>
              {step.number}
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              {step.title}
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>
              {step.description}
            </Typography>
            
            {step.highlight && (
              <Box sx={{
                position: 'absolute',
                top: -10,
                left: -10,
                right: -10,
                bottom: -10,
                border: '2px solid #483594',
                borderRadius: 2,
                zIndex: -1,
                opacity: 0.3
              }} />
            )}
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default HowItWorksSection;

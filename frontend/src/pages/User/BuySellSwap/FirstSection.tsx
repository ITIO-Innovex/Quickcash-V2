
import React, { useEffect } from 'react'
import CryptoRatesSection from './CryptoRatesSection'
import { Typography, useTheme, Box } from '@mui/material'
import { useLocation } from 'react-router-dom'

const FirstSection = () => {
  const theme = useTheme();
  const location = useLocation();
  
  // Get activeTab from location state
  const activeTab = location.state?.type || 'buy';
  
  // Log the activeTab for debugging
  useEffect(() => {
    console.log('FirstSection - Current Active Tab:', activeTab);
    console.log('FirstSection - Location State:', location.state);
    console.log('FirstSection - Full Location Object:', location);
  }, [activeTab, location.state, location]);

  // Log whenever location changes
  useEffect(() => {
    console.log('FirstSection - Location Changed, New activeTab:', activeTab);
  }, [location]);

  return (
     <Box className="crypto-form-header">
           <Typography variant="h4" className="crypto-form-title" sx={{ color: theme.palette.text.primary }}>
            Setup Currency
         </Typography>
         <Typography 
          variant="body1" 
           className="crypto-form-subtitle" 
          sx={{ color: theme.palette.text.gray }}
        >
           Exchange crypto manually from the comfort of your home, quickly, safely with minimal fees.
           </Typography>

           <CryptoRatesSection/>
           
        </Box> 
  )
}

export default FirstSection

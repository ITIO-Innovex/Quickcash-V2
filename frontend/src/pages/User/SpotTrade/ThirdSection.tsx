import { useState } from 'react';
import RightSection from './ThirdRightSectionTables';
import { Box, Tabs, Tab, TextField, Slider, Typography, Button, useTheme, useMediaQuery } from '@mui/material';

const ThirdSectionLeft = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const isMobile = useMediaQuery('(max-width:600px)');

  const handleTabChange = (_: any, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Box className="third-section-container">
      <Box className="t-left">
      <Tabs value={activeTab} onChange={handleTabChange} className="tab-header" orientation={isMobile ? 'vertical' : 'horizontal'} variant={isMobile ? 'standard' : 'scrollable'}  sx={{color:theme.palette.text.primary}}>
        <Tab label="Limit" sx={{color:theme.palette.text.primary}} />
        <Tab label="Market" sx={{color:theme.palette.text.primary}}/>
        <Tab label="Stop Limit" sx={{color:theme.palette.text.primary}}/>
      </Tabs>

      {/* Form content */}
      <Box className="form-content">
        {/* Common fields */}
        <Box className="label-row">
          <Typography>USD BALANCE</Typography>
          <Typography className="value-text">6188.827750116079 USD</Typography>
        </Box>

        {activeTab !== 1 && (
          <>
          <Box className="label-row">
            <Typography>PRICE</Typography>
            <Typography className="value-text">96573.99000000 USDT</Typography>
            </Box>
          </>
        )}
        <Box className="label-row">
        <Typography>NO OF COINS</Typography>
        <Typography className="value-text">0.01281345918959057 BTC</Typography>
        </Box>

        {activeTab === 0 && (
          <>
          <Box className="label-row">
            <Typography>LIMIT PRICE</Typography>
            <TextField size="small" fullWidth />
            </Box>
          </>
        )}

        {activeTab === 2 && (
          <>
          <Box className="label-row">
            <Typography>STOP PRICE</Typography>
            <TextField size="small" fullWidth />
            </Box>
          <Box className="label-row">
            <Typography>LIMIT PRICE</Typography>
            <TextField size="small" fullWidth />
            </Box>
          </>
        )}

        {/* Amount Slider */}
        <Typography>AMOUNT RANGE</Typography>
        <Slider defaultValue={50} step={1} marks min={0} max={100} valueLabelDisplay="auto" />

        <Box className="label-row">
        <Typography>TOTAL</Typography>
        <Typography className="value-text green">1237.7655500232158 USD</Typography>
        </Box>
      </Box>

      {/* Bottom Buttons */}
      <Box className="button-row">
         <Button className="custom-button" sx={{width:'40%'}} >Buy</Button>
         <Button className="custom-button" sx={{width:'40%'}}>Sell</Button>
      </Box>
    </Box>
     <Box className="t-right">
        <RightSection />
      </Box>
    </Box>
  );
};

export default ThirdSectionLeft;

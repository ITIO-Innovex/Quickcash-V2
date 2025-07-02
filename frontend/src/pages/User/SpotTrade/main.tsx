import { Box, Typography, useTheme } from '@mui/material';
import { useState } from 'react';
import FirstSection from './FirstSection';
import SecondSection from './SecondSection';
import ThirdSection from './ThirdSection';
import PageHeader from '@/components/common/pageHeader';

const Main = () => {
  const theme = useTheme();
  const [selectedCoin, setSelectedCoin] = useState('BTCUSDT'); 

  return (
    <Box className="dashboard-container"
      sx={{ backgroundColor: theme.palette.background.default }}
    >
      <PageHeader title="Spot Trading"/>

      {/*  Pass props to control coin */}
      <FirstSection selectedCoin={selectedCoin} onCoinChange={setSelectedCoin} />
      <SecondSection selectedCoin={selectedCoin} />
      <ThirdSection />
    </Box>
  );
};

export default Main;

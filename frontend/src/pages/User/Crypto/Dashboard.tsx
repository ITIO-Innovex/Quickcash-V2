import ThirdSection from './ThirdSection';
import FourthSection from './FourthSection';
import CryptoCardsSlider from './CardSlider';
import PageHeader from '@/components/common/pageHeader';
import MarqueeSection from '@/components/common/marquee';
import { Box, useTheme } from '@mui/material';

const dashboard = () => {
  const theme = useTheme();

  return (
    <Box
      className="dashboard-container"
      sx={{ backgroundColor: theme.palette.background.default }}
    >
      <PageHeader title="Crypto Dashboard" />

      <MarqueeSection />
      <CryptoCardsSlider />
      <ThirdSection />
      <FourthSection />
    </Box>
  );
};

export default dashboard;

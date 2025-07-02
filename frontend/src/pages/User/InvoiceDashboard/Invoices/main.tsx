import FirstSection from './FirstSection';
import { Box, useTheme } from '@mui/material';
import PageHeader from '@/components/common/pageHeader';

const Main = () => {
  const theme = useTheme();

  return (
    <Box 
      className="clients-container dashboard-container" 
      sx={{ backgroundColor: theme.palette.background.default }}
    >
      <PageHeader title='Invoice-section' />
      <FirstSection />
    </Box>
  );
};

export default Main;

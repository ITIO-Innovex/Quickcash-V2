import FirstSection from './FirstSection';
import PageHeader from '@/components/common/pageHeader';
import { Box, useTheme } from '@mui/material';

const Main = () => {
    const theme = useTheme();

  return (
    <Box 
      className="dashboard-container" 
      sx={{ backgroundColor: theme.palette.background.default }}
    >
       <PageHeader title="User-list" />

      <FirstSection/>
      </Box>
  );
};

export default Main;

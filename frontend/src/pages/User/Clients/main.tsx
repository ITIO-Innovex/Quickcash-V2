
import FirstSection from './FirstSection';
import { Box, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/common/pageHeader';

const Main = () => {
  
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <Box 
      className="dashboard-container" 
      sx={{ backgroundColor: theme.palette.background.default }}
    >
       <PageHeader title="Invoice-clients" buttonText="New Client" onButtonClick={() => navigate('/add-client')}/>
      <FirstSection />
    </Box>
  );
};

export default Main;

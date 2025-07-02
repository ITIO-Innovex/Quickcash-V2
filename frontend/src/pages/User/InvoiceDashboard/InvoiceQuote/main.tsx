
import FirstSection from './FirstSection';
import { Box, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/common/pageHeader';

const Main = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  
    const handleOpen = () => {
      navigate('/add-quote');
    };

  return (
    <Box 
      className="clients-container dashboard-container" 
      sx={{ backgroundColor: theme.palette.background.default }}
    >
      <PageHeader title='Invoice-quotes' buttonText='Quote' onButtonClick={handleOpen}/>
      <FirstSection />
    </Box>
  );
};

export default Main;

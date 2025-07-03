import PageHeader from '@/components/common/pageHeader';
import { Box, useTheme } from '@mui/material';
import UserProfile from './UserProfile';
import { useParams } from 'react-router-dom';

const Main = () => {
    const theme = useTheme();
    const { id } = useParams();

  return (
    <Box className="dashboard-container" sx={{ backgroundColor: theme.palette.background.default }}>
       <PageHeader title="User-details" />
        <UserProfile userId={id} />
      </Box>
  );
};

export default Main;

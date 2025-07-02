import PageHeader from '@/components/common/pageHeader';
import { Box, useTheme } from '@mui/material';
import UserProfile from './UserProfile';

const Main = () => {
    const theme = useTheme();

  return (
    <Box className="dashboard-container" sx={{ backgroundColor: theme.palette.background.default }}>
       <PageHeader title="User-details" />
        <UserProfile/>
      </Box>
  );
};

export default Main;

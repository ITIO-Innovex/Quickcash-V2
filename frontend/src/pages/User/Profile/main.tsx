import UserProfile from './UserProfile';
import { Box, useTheme } from '@mui/material';
import PageHeader from '@/components/common/pageHeader';

const main = () => {
    const theme  = useTheme();

  return (
     <Box 
      className="dashboard-container" 
      sx={{ backgroundColor: theme.palette.background.default }}
    >
       <PageHeader title="User Profile" />
       <UserProfile/>
    </Box>
  )
}

export default main
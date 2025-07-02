import { Box, useMediaQuery, useTheme } from '@mui/material';
import FirstSection from './FirstSection';
import PageHeader from '@/components/common/pageHeader';


const main = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  return (
      <Box  className="dashboard-container"
        sx={{ backgroundColor: theme.palette.background.default }}>
           <PageHeader title='Profile'/>
          <FirstSection />
      </Box>
    )
  }

export default main
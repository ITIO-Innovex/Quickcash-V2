import FirstSection from './BusinessRegister';
import PageHeader from '@/components/common/pageHeader';
import { Box, Typography, useTheme } from '@mui/material';


const main = () => {
  const theme = useTheme();

  return (
      <Box  className="dashboard-container"
        sx={{ backgroundColor: theme.palette.background.default }}>
          <PageHeader title='Business Register'/>
          <FirstSection />
      </Box>
    )
  }

export default main
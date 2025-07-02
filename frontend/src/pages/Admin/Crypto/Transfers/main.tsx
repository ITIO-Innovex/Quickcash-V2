import { Box, Typography, useTheme } from '@mui/material';
import FirstSection from './FirstSection';
import PageHeader from '@/components/common/pageHeader';

const main = () => {
  const theme = useTheme();

  return (
      <Box  className="dashboard-container"
        sx={{ backgroundColor: theme.palette.background.default }}>
           <PageHeader title='Crypto-transfer Request'/>
          <FirstSection />
      </Box>
    )
  }

export default main
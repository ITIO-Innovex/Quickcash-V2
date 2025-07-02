import FirstSection from './FirstSection';
import PageHeader from '@/components/common/pageHeader';
import { Box, useTheme } from '@mui/material';

const main = () => {
  const theme = useTheme();

  return (
      <Box  className="dashboard-container"
        sx={{ backgroundColor: theme.palette.background.default }}>
          <PageHeader title='Transactions'/>
          <FirstSection />
      </Box>
    )
  }

export default main
import { Box } from '@mui/material';
import ReferralCard from './ReferralCard';
import { useTheme } from '@mui/material/styles';
import HowItWorksSection from './HowItWorksSection';
import ReferredUsersTable from './ReferredUsersTable';
import PageHeader from '@/components/common/pageHeader';

const ReferEarnHeader = () => {
  const theme = useTheme();

  return (
    <Box
      className="dashboard-container"
      sx={{ backgroundColor: theme.palette.background.default }}
    >
      <PageHeader title="Refer & Earn" />
      <ReferralCard />
      <HowItWorksSection />
      <ReferredUsersTable />
    </Box>
  );
};

export default ReferEarnHeader;

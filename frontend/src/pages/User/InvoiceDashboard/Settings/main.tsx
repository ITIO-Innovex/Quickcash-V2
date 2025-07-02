
import SettingsForm from './SettingsForm';
import { Box, useTheme } from '@mui/material';
import PageHeader from '@/components/common/pageHeader';

const Settings = () => {
  const theme = useTheme();

  return (
    <Box 
      className="dashboard-container" 
      sx={{ backgroundColor: theme.palette.background.default }}
    >
      <PageHeader title='Invoice-settings' />
      <SettingsForm />
    </Box>
  );
};

export default Settings;

import { Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import GenericTable from '../../../../components/common/genericTable';

const LoginHistory = () => {
  const theme = useTheme();

  // ✅ Dummy session list
  const sessionList = [
    {
      date: '2025-06-18 09:15:00',
      browser: 'Chrome - Windows',
      os: 'Windows 11',
      ip: '192.168.1.12',
    },
    {
      date: '2025-06-17 20:42:31',
      browser: 'Safari - iPhone',
      os: 'iOS 17',
      ip: '103.21.244.1',
    },
    {
      date: '2025-06-15 12:05:44',
      browser: 'Edge - Mac',
      os: 'macOS Ventura',
      ip: '203.45.22.14',
    },
  ];

  const columns = [
    { field: 'date', headerName: 'DATE & TIME' },
    { field: 'browser', headerName: 'BROWSER' },
    { field: 'os', headerName: 'OPERATING SYSTEM' },
    { field: 'ip', headerName: 'IP ADDRESS' },
  ];

  return (
    <Box sx={{ p: 3, backgroundColor: theme.palette.background.default, color: theme.palette.text.primary }}>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
        Login History
      </Typography>
      <GenericTable columns={columns} data={sessionList} />
    </Box>
  );
};

export default LoginHistory;


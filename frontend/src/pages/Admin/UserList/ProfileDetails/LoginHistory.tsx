import { Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import GenericTable from '../../../../components/common/genericTable';
import moment from 'moment';

interface LoginHistoryProps {
  loginHistory: any[];
}

const LoginHistory = ({ loginHistory }: LoginHistoryProps) => {
  const theme = useTheme();

  const columns = [
  {
      field: 'createdAt',
      headerName: 'Date',
      render: (row) => moment(row.createdAt).format('MMMM Do YYYY, h:mm:ss A'), 
    },
    { field: 'device', headerName: 'Device' },
    { field: 'OS', headerName: 'OS' },
    { field: 'ipAddress', headerName: 'Ip Address' },
    {
      field: 'isActiveNow',
      headerName: 'Status',
      render: (row) =>
        typeof row.isActiveNow === 'boolean'
          ? row.isActiveNow ? 'LoggedIN' : 'LoggedOUT'
          : String(row.isActiveNow),
    }
  ];

  return (
    <Box sx={{ p: 3, backgroundColor: theme.palette.background.default, color: theme.palette.text.primary }}>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
        Login History
      </Typography>
      <GenericTable columns={columns} data={loginHistory} />
    </Box>
  );
};

export default LoginHistory;


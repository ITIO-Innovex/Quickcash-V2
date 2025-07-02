import { Box, Typography, useTheme } from '@mui/material';
import CustomModal from '@/components/CustomModal';
import CustomButton from '@/components/CustomButton';
import GenericTable from '../../../components/common/genericTable';

const sessionColumns = [
  { field: 'date', headerName: 'Date' },
  { field: 'device', headerName: 'Device' },
  { field: 'os', headerName: 'OS' },
  { field: 'ip', headerName: 'Ip Address' },
  { field: 'active', headerName: 'Is Active?' },
];

export const dummySessionData = [
  {
    date: '2025-06-18 09:15:00',
    device: 'Chrome - Windows',
    os: 'Windows 11',
    ip: '192.168.1.12',
    active: 'Yes',
  },
  {
    date: '2025-06-17 20:42:31',
    device: 'Safari - iPhone',
    os: 'iOS 17',
    ip: '103.21.244.1',
    active: 'No',
  },
  {
    date: '2025-06-15 12:05:44',
    device: 'Edge - Mac',
    os: 'macOS Ventura',
    ip: '203.45.22.14',
    active: 'No',
  },
];


const SessionHistoryModal = ({ open, onClose, data }) => {
  const theme = useTheme();
  const isValidData = Array.isArray(data) && data.length > 0;

  return (
    <CustomModal open={open} onClose={onClose} title="Session History" maxWidth="md" sx={{backgroundColor:theme.palette.background.default}}>
      <div className="header-divider" />

      {isValidData ? (
        <GenericTable columns={sessionColumns} data={data} />
      ) : (
        <Box p={2}>
          <Typography variant="body1">No session history found.</Typography>
        </Box>
      )}

      <Box display="flex" justifyContent="flex-end" mt={2}>
        <CustomButton onClick={onClose}>Close</CustomButton>
      </Box>
    </CustomModal>
  );
};

export default SessionHistoryModal;

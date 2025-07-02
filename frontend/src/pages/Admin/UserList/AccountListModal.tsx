import { Box, Typography, useTheme } from '@mui/material';
import CustomModal from '@/components/CustomModal';
import CustomButton from '@/components/CustomButton';
import GenericTable from '../../../components/common/genericTable';

export const accountColumns = [
  { field: 'date', headerName: 'Date' },
  { field: 'name', headerName: 'Name' },
  { field: 'currency', headerName: 'Currency' },
  { field: 'accountNo', headerName: 'IBAN/Account No' },
  { field: 'bicCode', headerName: 'BIC/IFC Code' },
  { field: 'status', headerName: 'Status' },
];

// ✅ You can import this in your handler to test or use
export const dummyAccountData = [
  {
    date: '2025-06-18 09:00 AM',
    name: 'John Doe',
    currency: 'USD',
    accountNo: 'US98BANK1234567890',
    bicCode: 'BOFAUS3N',
    status: 'Active',
  },
  {
    date: '2025-06-17 03:20 PM',
    name: 'Jane Smith',
    currency: 'EUR',
    accountNo: 'DE89BANK9876543210',
    bicCode: 'DEUTDEFF',
    status: 'Inactive',
  },
  {
    date: '2025-06-16 11:45 AM',
    name: 'Acme Corp',
    currency: 'INR',
    accountNo: 'IN23BANK0011223344',
    bicCode: 'SBININBB',
    status: 'Pending',
  },
];

const AccountListModal = ({ open, onClose, data }) => {
  const theme = useTheme();
  const isValidData = Array.isArray(data) && data.length > 0;

  return (
    <CustomModal
      open={open}
      onClose={onClose}
      title="Account Lists"
      maxWidth="md"
      sx={{ backgroundColor: theme.palette.background.default }}
    >
      <div className="header-divider" />

      {isValidData ? (
        <GenericTable columns={accountColumns} data={data} />
      ) : (
        <Box p={2}>
          <Typography variant="body1">No invoices found.</Typography>
        </Box>
      )}

      <Box display="flex" justifyContent="flex-end" mt={2}>
        <CustomButton onClick={onClose}>Close</CustomButton>
      </Box>
    </CustomModal>
  );
};

export default AccountListModal;

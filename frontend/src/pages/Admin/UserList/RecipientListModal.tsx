import { Box, Typography, useTheme } from '@mui/material';
import CustomModal from '@/components/CustomModal';
import CustomButton from '@/components/CustomButton';
import GenericTable from '../../../components/common/genericTable';
import moment from 'moment';

// ✅ Column structure for GenericTable
export const recipientColumns = [
 {
    field: 'createdAt',
    headerName: 'Date',
    render: (row) => moment(row.createdAt).format('MMMM Do YYYY, h:mm:ss A'),
  },
  { field: 'name', headerName: 'Name' },
  { field: 'currency', headerName: 'Currency' },
  { field: 'iban', headerName: 'IBAN/Account Number' },
  { field: 'bic_code', headerName: 'BIC/IFSC Code' },
   {
    field: 'status',
    headerName: 'Status',
    render: (row) =>
      typeof row.status === 'boolean'
        ? row.status ? 'Active' : 'Inactive'
        : String(row.status),
  }
];


// ✅ Use this for Recipient List testing
export const dummyRecipientData = [
  {
    date: '2025-06-18 10:30 AM',
    name: 'Rahul Verma',
    currency: 'INR',
    accountNo: 'IN45HDFC0001234567',
    bicCode: 'HDFCINBBXXX',
    status: 'Active',
  },
  {
    date: '2025-06-17 02:15 PM',
    name: 'Emily Johnson',
    currency: 'USD',
    accountNo: 'US64BOFA1234567890',
    bicCode: 'BOFAUS3N',
    status: 'Pending',
  },
  {
    date: '2025-06-16 05:50 PM',
    name: 'Mohammed Ali',
    currency: 'AED',
    accountNo: 'AE07NBAD0001234567',
    bicCode: 'NBADAEAAXXX',
    status: 'Inactive',
  },
];

const RecipientListModal = ({ open, onClose, data }) => {
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
        <GenericTable columns={recipientColumns} data={data} />
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

export default RecipientListModal;

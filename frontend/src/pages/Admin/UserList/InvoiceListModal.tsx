import { Box, Typography, useTheme } from '@mui/material';
import CustomModal from '@/components/CustomModal';
import CustomButton from '@/components/CustomButton';
import GenericTable from '../../../components/common/genericTable';

const invoiceColumns = [
  { field: 'date', headerName: 'Date' },
  { field: 'invoiceNo', headerName: 'Invoice No' },
  { field: 'invoiceDate', headerName: 'Invoice Date' },
  { field: 'dueDate', headerName: 'Due Date' },
  { field: 'amount', headerName: 'Amount' },
  { field: 'currency', headerName: 'Currency' },
  { field: 'tax', headerName: 'Tax' },
];

// ✅ Exported so you can use this in the handler or for testing
export const dummyInvoiceData = [
  {
    date: '2025-06-18 10:45 AM',
    invoiceNo: 'INV-001',
    invoiceDate: '2025-06-15',
    dueDate: '2025-06-22',
    amount: '$1200.00',
    currency: 'USD',
    tax: '18%',
  },
  {
    date: '2025-06-18 11:00 AM',
    invoiceNo: 'INV-002',
    invoiceDate: '2025-06-16',
    dueDate: '2025-06-23',
    amount: '$750.50',
    currency: 'EUR',
    tax: '10%',
  },
  {
    date: '2025-06-18 11:15 AM',
    invoiceNo: 'INV-003',
    invoiceDate: '2025-06-17',
    dueDate: '2025-06-24',
    amount: '$2100.00',
    currency: 'INR',
    tax: '0%',
  },
];

const InvoiceGeneratedListModal = ({ open, onClose, data }) => {
  const theme = useTheme();
  const isValidData = Array.isArray(data) && data.length > 0;

  return (
    <CustomModal
      open={open}
      onClose={onClose}
      title="Generated Invoices"
      maxWidth="md"
      sx={{ backgroundColor: theme.palette.background.default }}
    >
      <div className="header-divider" />

      {isValidData ? (
        <GenericTable columns={invoiceColumns} data={data} />
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

export default InvoiceGeneratedListModal;

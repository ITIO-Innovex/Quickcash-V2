import { Box, Typography, useTheme } from '@mui/material';
import CustomModal from '@/components/CustomModal';
import CustomButton from '@/components/CustomButton';
import GenericTable from '../../../components/common/genericTable';
import moment from 'moment';

const invoiceColumns = [
 {
     field: 'createdAt',
     headerName: 'Date',
     render: (row) => moment(row.createdAt).format('MMMM Do YYYY, h:mm:ss A'), 
   },
  { field: 'invoice_number', headerName: 'Invoice No' },
  { field: 'invoice_date', headerName: 'Invoice Date' },
  {
  field: 'due_date',
  headerName: 'Due Date',
  render: (row) =>
    moment(row.due_date).format('ddd MMM DD YYYY'),
},
  { field: 'total', headerName: 'Amount' },
  { field: 'currency', headerName: 'Currency' },
  {
    field: 'sub_tax',
    headerName: 'Tax',
    render: (item) => item?.sub_tax ?? '—', // fallback to '—' if undefined
  }

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

import { Box, Typography, useTheme } from '@mui/material';
import CustomModal from '@/components/CustomModal';
import CustomButton from '@/components/CustomButton';
import GenericTable from '../../../components/common/genericTable';

const invoiceColumns = [
  { field: 'dateadded', headerName: 'Transaction Date' },
  { field: '_id', headerName: 'Transaction Id' },
  { field: 'amount', headerName: 'Amount' },
  { field: 'convertAmount', headerName: 'Paid Amount' },
  { field: 'trans_type', headerName: 'Payment Mode' },
];

// ✅ Exported so you can use this in the handler or for testing

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

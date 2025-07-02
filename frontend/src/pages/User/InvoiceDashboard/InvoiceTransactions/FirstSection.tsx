
import { Box, Button, Typography, useTheme } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import GenericTable from '../../../../components/common/genericTable';
import CustomModal from '@/components/CustomModal';
import { useEffect, useState } from 'react';
import api from '@/helpers/apiHelper';
import getSymbolFromCurrency from 'currency-symbol-map';

const url = import.meta.env.VITE_NODE_ENV == "production" ? 'api' : 'api';
const FirstSection = () => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any | null>(null);
  const [TransactionsData, setTransactionsData] = useState<any>([]);

  useEffect(() => {
    getInvoiceTransactions();
  }, []);

  const getInvoiceTransactions = async () => {
    try{
      const result = await api.get(`/${url}/v1/manualPayment/transaction-list`);
      if (result.data.status === 201) {
          setTransactionsData(result.data.data);
      }
    }catch (error) {
      console.error('Error fetching invoice transactions:', error);
    }
  }

   const handleActionClick = (row: any) => {
    setSelectedRow(row);
    console.log('Selected Row:', row);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedRow(null);
  };

  const columns = [
  { 
    field: 'dateadded', 
    headerName: 'Payment Date'
   },
  { 
    field: 'invoiceNumber', 
    headerName: 'Invoice Number',
    render: (row: any) => (
      <span>{row?.invoiceDetails?.[0]?.invoice_number}</span>
    )
  },
  { 
    field: 'total', 
    headerName: 'Total',
    render: (row: any) => (
       <span className={`status-chip success`}>
        {getSymbolFromCurrency(row?.invoiceDetails?.[0]?.currency)} {row?.invoiceDetails?.[0]?.total}
        </span>
    )
    
  },
  {
    field: 'amount',
    headerName: 'Amount',
    render: (row: any) => (
      <span className={`status-chip success`}>
       {getSymbolFromCurrency(row?.fromCurrency)} {row?.amount}
      </span>
    )
  },
  {
    field: 'trans_type',
    headerName: 'Transaction Type'
  },
   {
      field: 'action',
      headerName: 'Action',
      render: (row: any) => (
        <VisibilityIcon style={{ cursor: 'pointer' }} onClick={() => handleActionClick(row)} />
      )
    }
];

  return (
    <Box>
      <GenericTable columns={columns} data={TransactionsData} />

         <CustomModal open={open} onClose={handleClose} title="Statement Details" sx={{backgroundColor: theme.palette.background.default }}>
              <div className="header-divider" />
              
              <Box sx={{ mt: 2 }}>
                 <Box display="flex" justifyContent="space-between" mb={2}>
                      <Typography><strong>Date:</strong></Typography>
                      <Typography>{selectedRow?.dateadded}</Typography>
                      </Box>
      
                      <Box display="flex" justifyContent="space-between" mb={2}>
                      <Typography><strong>Invoice Number:</strong></Typography>
                      <Typography>{selectedRow?.invoiceDetails?.[0]?.invoice_number}</Typography>
                      </Box>
      
                      <Box display="flex" justifyContent="space-between" mb={2}>
                      <Typography><strong>Transaction Type:</strong></Typography>
                      <Typography>{selectedRow?.trans_type}</Typography>
                      </Box>
      
                      <Box display="flex" justifyContent="space-between" mb={2}>
                      <Typography><strong>Amount:</strong></Typography>
                      <Typography>${selectedRow?.amount}</Typography>
                      </Box>
      
                      <Box display="flex" justifyContent="space-between" mb={2}>
                      <Typography><strong>Total:</strong></Typography>
                      <Typography>${selectedRow?.invoiceDetails?.[0]?.total}</Typography>
                      </Box>
      
      
                      <Button
                      className="custom-button"
                      onClick={handleClose}
                      sx={{ mt: 3 }}
                      >
                      <span className="button-text">Close</span>
                      </Button>
              </Box>
              </CustomModal>
    </Box>
  );
};

export default FirstSection;

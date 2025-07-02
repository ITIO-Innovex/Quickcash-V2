
import React from 'react';
import CustomTable from '../../../../components/CustomTable';
import { Box, useTheme } from '@mui/material';

const InvoiceItemsTable = () => {

  const theme = useTheme();
  const columns = [
    { id: 'number', label: '#', minWidth: 50, align: 'center' as const },
    { id: 'item', label: 'Item', minWidth: 200 },
    { id: 'qty', label: 'Qty', minWidth: 80, align: 'center' as const },
    { id: 'amount', label: 'Amount', minWidth: 120, align: 'right' as const }
  ];

  const rows = [
    { number: 1, item: 'Item 1', qty: 1, amount: '₹100.00' },
    { number: 2, item: 'Item 2', qty: 1, amount: '₹100.00' },
    { number: 3, item: 'Item 3', qty: 1, amount: '₹100.00' }
  ];

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  return (
    <Box className="invoice-items-section" sx={{backgroundColor:theme.palette.background.default}} >
      <CustomTable
        columns={columns}
        rows={rows}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
      
      <Box className="invoice-totals" >
        <Box className="totals-row">
          <span className="totals-label">Amount:</span>
          <span className="totals-value">₹300.00</span>
        </Box>
        <Box className="totals-row">
          <span className="totals-label">Discount:</span>
          <span className="totals-value">₹50.00</span>
        </Box>
        <Box className="totals-row">
          <span className="totals-label">Tax:</span>
          <span className="totals-value">₹0.00</span>
        </Box>
        <Box className="totals-row total-row">
          <span className="totals-label">Total:</span>
          <span className="totals-value">₹250.00</span>
        </Box>
      </Box>
    </Box>
  );
};

export default InvoiceItemsTable;

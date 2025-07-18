
import React from 'react';
import InvoicePreviewHeader from './InvoicePreviewHeader';
import InvoicePreviewDetails from './InvoicePreviewDetails';
import InvoiceItemsTable from './InvoiceItemsTable';
import InvoicePreviewFooter from './InvoicePreviewFooter';
import { Box } from '@mui/material';

const InvoicePreview = ({ color }: { color: string }) => {
  return (
    <Box className="invoice-preview">
      <Box className="invoice-preview-header-section">
        <h3 className="preview-title">Invoice Preview</h3>
      </Box>
      
      <Box className="invoice-preview-content">
        <InvoicePreviewHeader color={color} />
        <InvoicePreviewDetails />
        <InvoiceItemsTable />
        <InvoicePreviewFooter />
      </Box>
    </Box>
  );
};

export default InvoicePreview;

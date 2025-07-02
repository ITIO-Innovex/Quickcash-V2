
import { Box } from '@mui/material';
import React from 'react';

const InvoicePreviewHeader = () => {
  return (
    <Box className="invoice-header">
      <Box className="invoice-header-content">
        <Box className="invoice-title-section">
          <h2 className="invoice-title">INVOICE</h2>
          <p className="invoice-id">Invoice ID #PDC83X7</p>
        </Box>
        
        <Box className="company-info">
          <Box className="company-logo">
            <span className="logo-icon">⚡</span>
            <span className="company-name">Quick Cash</span>
          </Box>
        </Box>
      </Box>
      
      <Box className="qr-code-section">
        <Box className="qr-code-label">Payment QR Code</Box>
        <Box className="qr-code-placeholder">
          <Box className="qr-pattern"></Box>
        </Box>
      </Box>
    </Box>
  );
};

export default InvoicePreviewHeader;

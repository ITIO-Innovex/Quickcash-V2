
import React from 'react';
import { Receipt } from '@mui/icons-material';
import { Box } from '@mui/material';
import ThemeConfig from '@/theme';

interface InvoiceQuoteToggleProps {
  activeTab: 'invoice' | 'quote';
  setActiveTab: (tab: 'invoice' | 'quote') => void;
}

const InvoiceQuoteToggle: React.FC<InvoiceQuoteToggleProps> = ({

  activeTab,
  setActiveTab,
}) => {

  return (
    <Box className="invoice-quote-toggle">
      <button
        className={`toggle-button ${activeTab === 'invoice' ? 'active' : ''}`}
        onClick={() => setActiveTab('invoice')}
      >
        <Receipt style={{ marginRight: '8px', fontSize: '20px' }} />
        INVOICE
      </button>
      <button
        className={`toggle-button ${activeTab === 'quote' ? 'active' : ''}`}
        onClick={() => setActiveTab('quote')}
      >
        <Receipt style={{ marginRight: '8px', fontSize: '20px' }} />
        QUOTE
      </button>
    </Box>
  );
};

export default InvoiceQuoteToggle;

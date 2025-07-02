
import React from 'react';
import { Add } from '@mui/icons-material';
import CustomButton from '../../../components/CustomButton';
import { Box } from '@mui/material';

interface InvoiceActionsProps {
  activeTab: 'invoice' | 'quote';
}

const InvoiceActions: React.FC<InvoiceActionsProps> = ({ activeTab }) => {
  return (
    <Box className="invoice-actions">
      <CustomButton>
        <Add style={{ marginRight: '8px' }} />
        New {activeTab === 'invoice' ? 'Invoice' : 'Quote'}
      </CustomButton>
    </Box>
  );
};

export default InvoiceActions;

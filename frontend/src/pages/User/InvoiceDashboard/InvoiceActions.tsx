
import React from 'react';
import { Box } from '@mui/material';
import { Add } from '@mui/icons-material';
import {useNavigate } from 'react-router-dom';
import CustomButton from '../../../components/CustomButton';

interface InvoiceActionsProps {
  activeTab: 'invoice' | 'quote';
}

const InvoiceActions: React.FC<InvoiceActionsProps> = ({ activeTab }) => {
  const navigate = useNavigate();

 const handleNewClick = () => {
  if (activeTab === 'invoice') {
    navigate('/new-invoice');
  } else {
    navigate('/add-quote'); 
  }
};

  return (
    <Box className="invoice-actions">
      <CustomButton onClick={handleNewClick}>
        <Add style={{ marginRight: '8px' }} />
        New {activeTab === 'invoice' ? 'Invoice' : 'Quote'}
      </CustomButton>
    </Box>
  );
};

export default InvoiceActions;

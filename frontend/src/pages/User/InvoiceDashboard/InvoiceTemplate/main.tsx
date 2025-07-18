import React, { useState } from 'react';
import { Box, Container, useTheme } from '@mui/material';
import InvoiceTemplateForm from './InvoiceTemplateForm';
import InvoicePreview from './InvoicePreview';
import PageHeader from '@/components/common/pageHeader';

const InvoiceTemplate = () => {
  const theme = useTheme();
  const [color, setColor] = useState('#483594');

  return (
    <Box 
      className="dashboard-container" 
      sx={{ backgroundColor: theme.palette.background.default }}
    >
      <PageHeader title="Invoice-template"/>
      <Box className="invoice-template-content">
        <InvoiceTemplateForm color={color} setColor={setColor} />
        <InvoicePreview color={color} />
      </Box>
    </Box>
  );
};

export default InvoiceTemplate;

import InvoiceActions from './InvoiceActions';
import { useTheme } from '@mui/material/styles';
import React, { useState, useEffect } from 'react';
import InvoiceStatsCards from './InvoiceStatsCards';
import InvoiceQuoteToggle from './InvoiceQuoteToggle';
import InvoiceIncomeChart from './InvoiceIncomeChart';
import InvoiceStatsSection from './InvoiceStatsSection';
import PageHeader from '@/components/common/pageHeader';
import { Box, Container, Typography } from '@mui/material';

const InvoiceDashboard = () => {
  const [activeTab, setActiveTab] = useState<'invoice' | 'quote'>('invoice');
  const theme = useTheme();

  useEffect(() => {
    // Apply theme class to body for CSS variables
    document.body.setAttribute('data-theme', theme.palette.mode);
    return () => {
      document.body.removeAttribute('data-theme');
    };
  }, [theme.palette.mode]);

  return (
    <Container maxWidth="lg">
      <Box 
      className="dashboard-container" 
      sx={{ backgroundColor: theme.palette.background.default }}
    >
       <PageHeader title="Invoice Dashboard" />
        
        <InvoiceQuoteToggle activeTab={activeTab} setActiveTab={setActiveTab} />
        <InvoiceStatsCards activeTab={activeTab} />
        <InvoiceActions activeTab={activeTab} />
        <InvoiceStatsSection />
        <InvoiceIncomeChart />
      </Box>
    </Container>
  );
};

export default InvoiceDashboard;

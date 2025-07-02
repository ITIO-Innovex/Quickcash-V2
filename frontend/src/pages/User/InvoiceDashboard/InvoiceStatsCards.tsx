
import React from 'react';
import { Receipt, CheckCircle, Cancel, Schedule } from '@mui/icons-material';
import { Box, useTheme } from '@mui/material';

interface InvoiceStatsCardsProps {
  activeTab: 'invoice' | 'quote';
}

const InvoiceStatsCards: React.FC<InvoiceStatsCardsProps> = ({ activeTab }) => {
  const theme = useTheme();
  const invoiceStats = [
    {
      title: 'Total Invoice',
      value: '$0.00',
      icon: <Receipt style={{ fontSize: '24px', color: 'inherit' }} />,
      isPrimary: true
    },
    {
      title: 'Total Paid',
      value: '$0.00',
      icon: <CheckCircle style={{ fontSize: '24px', color: '#483594' }} />,
      isPrimary: false
    },
    {
      title: 'Total Unpaid',
      value: '$0.00',
      icon: <Cancel style={{ fontSize: '24px', color: '#483594' }} />,
      isPrimary: false
    },
    {
      title: 'Total Overdue',
      value: '$0.00',
      icon: <Schedule style={{ fontSize: '24px', color: '#483594' }} />,
      isPrimary: false
    }
  ];

  const quoteStats = [
    {
      title: 'Total Quote',
      value: '$0.00',
      icon: <Receipt style={{ fontSize: '24px', color: 'inherit' }} />,
      isPrimary: true
    },
    {
      title: 'Total Accepted',
      value: '$0.00',
      icon: <CheckCircle style={{ fontSize: '24px', color: '#483594' }} />,
      isPrimary: false
    },
    {
      title: 'Total Pending',
      value: '$0.00',
      icon: <Schedule style={{ fontSize: '24px', color: '#483594' }} />,
      isPrimary: false
    },
    {
      title: 'Total Declined',
      value: '$0.00',
      icon: <Cancel style={{ fontSize: '24px', color: '#483594' }} />,
      isPrimary: false
    }
  ];

  const stats = activeTab === 'invoice' ? invoiceStats : quoteStats;

  return (
    <Box className="invoice-stats-grid" >
      {stats.map((stat, index) => (
        <Box key={index} className={`stats-card ${stat.isPrimary ? 'primary' : ''}`} sx={{backgroundColor: theme.palette.background.default}}>
          <Box className="stats-card-content" >
            <Box className="stats-card-title">{stat.title}</Box>
            <Box className="stats-card-value">{stat.value}</Box>
          </Box>
          <Box className="stats-card-icon">
            {stat.icon}
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default InvoiceStatsCards;

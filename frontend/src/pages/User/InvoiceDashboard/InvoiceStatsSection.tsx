
import { Box } from '@mui/material';
import React from 'react';

const InvoiceStatsSection = () => {
  const statsData = [
    {
      title: 'PRODUCTS',
      value: '216',
      link: 'View Products'
    },
    {
      title: 'CATEGORIES',
      value: '15',
      link: 'View Categories'
    },
    {
      title: 'CLIENTS',
      value: '1267',
      link: 'View Clients'
    }
  ];

  return (
    <Box className="invoice-info-section">
      <Box className="invoice-info-grid">
        {statsData.map((stat, index) => (
          <Box key={index} className="info-card">
            <Box className="info-card-title">{stat.title}</Box>
            <Box className="info-card-value">{stat.value}</Box>
            <a href="#" className="info-card-link">{stat.link}</a>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default InvoiceStatsSection;

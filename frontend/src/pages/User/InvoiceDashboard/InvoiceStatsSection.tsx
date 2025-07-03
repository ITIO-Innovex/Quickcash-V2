import { Box } from '@mui/material';
import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface InvoiceStatsSectionProps {
  activeTab: 'invoice' | 'quote';
}

const url = import.meta.env.VITE_NODE_ENV == "production" ? 'api' : 'api';
const InvoiceStatsSection: React.FC<InvoiceStatsSectionProps> = ({ activeTab }) => {
  const [statsData, setStatsData] = useState([
    { title: 'PRODUCTS', value: '', link: 'View Products' },
    { title: 'CATEGORIES', value: '', link: 'View Categories' },
    { title: 'CLIENTS', value: '', link: 'View Clients' }
  ]);

  useEffect(() => {
    const fetchDashboardDetails = async () => {
      try {
        const result = await axios.get(`${url}/v1/invoice/dashboard/details`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (result.data && (result.data.status === "201" || result.data.status === 201)) {
          const apiData = result.data.data;
          // Transform API data to card format
          const cards = [
            { title: 'PRODUCTS', value: apiData.totalProducts, link: 'View Products' },
            { title: 'CATEGORIES', value: apiData.totalCategory, link: 'View Categories' },
            { title: 'CLIENTS', value: apiData.totalClients, link: 'View Clients' }
          ];
          setStatsData(cards);
        }
      } catch (error) {
        console.log("error", error);
      }
    };

    fetchDashboardDetails();
  }, []);

  if (activeTab !== 'invoice') return null;

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

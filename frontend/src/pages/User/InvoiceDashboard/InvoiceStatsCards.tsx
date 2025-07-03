import React, { useEffect, useState } from 'react';
import { Receipt, CheckCircle, Cancel, Schedule, SwapHoriz, DoneAll, ThumbUp, ThumbDown } from '@mui/icons-material';
import { Box, useTheme } from '@mui/material';
import axios from 'axios';
const url = import.meta.env.VITE_NODE_ENV == "production" ? 'api' : 'api';

interface InvoiceStatsCardsProps {
  activeTab: 'invoice' | 'quote';
}

const InvoiceStatsCards: React.FC<InvoiceStatsCardsProps> = ({ activeTab }) => {
  const theme = useTheme();
  const [statsData, setStatsData] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        let endpoint = '';
        if (activeTab === 'invoice') {
          endpoint = `/${url}/v1/invoice/dashboard/details`;
        } else {
          endpoint = `/${url}/v1/invoice/dashboard/quote`;
        }
        const result = await axios.get(endpoint, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (result.data && (result.data.status === "201" || result.data.status === 201)) {
          setStatsData(result.data.data);
        } else {
          setStatsData(null);
        }
      } catch (error) {
        console.log("error", error);
        setStatsData(null);
      }
    };
    fetchStats();
  }, [activeTab]);

  const invoiceStats = [
    {
      title: 'Total Invoice',
      value: statsData ? `$${Number(statsData.totalInvoice).toFixed(2)}` : '$0.00',
      icon: <Receipt style={{ fontSize: '24px', color: 'inherit' }} />, 
      isPrimary: true
    },
    {
      title: 'Total Paid',
      value: statsData ? `$${Number(statsData.totalPaid).toFixed(2)}` : '$0.00',
      icon: <CheckCircle style={{ fontSize: '24px', color: '#483594' }} />, 
      isPrimary: false
    },
    {
      title: 'Total Unpaid',
      value: statsData ? `$${Number(statsData.totalUnpaid).toFixed(2)}` : '$0.00',
      icon: <Cancel style={{ fontSize: '24px', color: '#483594' }} />, 
      isPrimary: false
    },
    {
      title: 'Total Overdue',
      value: statsData ? `$${Number(statsData.totalOverdue).toFixed(2)}` : '$0.00',
      icon: <Schedule style={{ fontSize: '24px', color: '#483594' }} />, 
      isPrimary: false
    }
  ];

  const quoteStats = [
    {
      title: 'Total Quote',
      value: statsData ? statsData.totalQuote : '0',
      icon: <Receipt style={{ fontSize: '24px', color: 'inherit' }} />, 
      isPrimary: true
    },
    {
      title: 'Total Converted',
      value: statsData ? statsData.totalConverted : '0',
      icon: <SwapHoriz style={{ fontSize: '24px', color: '#483594' }} />, 
      isPrimary: false
    },
    {
      title: 'Total Accepted',
      value: statsData ? statsData.totalAccept : '0',
      icon: <ThumbUp style={{ fontSize: '24px', color: '#483594' }} />, 
      isPrimary: false
    },
    {
      title: 'Total Rejected',
      value: statsData ? statsData.totalReject : '0',
      icon: <ThumbDown style={{ fontSize: '24px', color: '#483594' }} />, 
      isPrimary: false
    }
  ];

  const statsToShow = activeTab === 'invoice' ? invoiceStats : quoteStats;

  return (
    <Box className="invoice-stats-grid" >
      {statsToShow.map((stat, index) => (
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

import React, { useEffect, useState } from 'react';
import { Grid, Typography, useTheme } from '@mui/material';
import { PieChart } from '@mui/x-charts/PieChart';
import axios from 'axios';

const url = import.meta.env.VITE_NODE_ENV == "production" ? 'api' : 'api';

// Add prop type for activeTab
interface InvoicePaymentOverviewProps {
  activeTab: 'invoice' | 'quote';
}

const InvoicePaymentOverview = ({ activeTab = 'invoice' }: InvoicePaymentOverviewProps) => {
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
        setStatsData(null);
      }
    };
    fetchStats();
  }, [activeTab]);

  const paymentData = [
    { id: 0, value: Number(statsData?.totalPaid) || 0, label: 'Paid' },
    { id: 1, value: Number(statsData?.totalUnpaid) || 0, label: 'Unpaid' },
  ];
  const invoiceData = [
    { id: 0, value: Number(statsData?.totalPaid) || 0, label: 'Paid' },
    { id: 1, value: Number(statsData?.totalUnpaid) || 0, label: 'Unpaid' },
    { id: 2, value: Number(statsData?.totalOverdue) || 0, label: 'Overdue' },
  ];

  return (
    activeTab === 'invoice' && (
      <Grid container spacing={2} sx={{ background: `${theme.palette.mode === 'dark' ? 'transparent' : 'white'}`, border: `${theme.palette.mode === 'dark' ? '2px solid lightblue' : '1px solid white'}`, height: { xs: 'auto', md: 'auto' }, boxShadow: '2px 10px 10px #8888883b', marginTop: '2%', borderRadius: '.5rem', width: '100%', overflowX: 'hidden' }}>
        <Grid item xs={12} sm={6} sx={{ borderRight: '1px dotted silver' }}>
          <Typography variant='h5' sx={{ textAlign: 'center', marginBottom: '5%', color: `${theme.palette.mode === 'dark' ? 'white' : 'black'}` }}>Payment Overview</Typography>
          <PieChart
            series={[
              {
                data: paymentData,
              },
            ]}
            slotProps={{ legend: {} }}
            height={200}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant='h5' sx={{ textAlign: 'center', marginBottom: '5%', color: `${theme.palette.mode === 'dark' ? 'white' : 'black'}` }}>Invoice Overview</Typography>
          <PieChart
            series={[
              {
                data: invoiceData,
              },
            ]}
            sx={{ marginBottom: '2%' }}
            slotProps={{ legend: {} }}
            height={200}
          />
        </Grid>
      </Grid>
    )
  );
};

export default InvoicePaymentOverview;

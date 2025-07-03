import React, { useEffect, useState } from 'react';
import { Box, Grid, Typography, Select, MenuItem, CircularProgress } from '@mui/material';
import axios from 'axios';
import dayjs from 'dayjs';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
const url = import.meta.env.VITE_NODE_ENV == "production" ? 'api' : 'api';
import { LineChart } from '@mui/x-charts';

// Add prop type for activeTab
type InvoiceIncomeChartProps = {
  theme?: boolean;
  activeTab: 'invoice' | 'quote';
};

const InvoiceIncomeChart = ({ theme = false, activeTab }: InvoiceIncomeChartProps) => {
  const [selectFilter, setSelectFilter] = useState('Today');
  const [xAxisData, setxAxisData] = useState<any[]>([]);
  const [seriesData, setSeriesData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Helper to get API endpoint and label based on tab
  const getApiAndLabel = () => {
    if (activeTab === 'invoice') {
      return {
        api: `/${url}/v1/invoice/dashboard/filter?filter=${selectFilter}`,
        label: 'Invoice Income',
      };
    } else {
      return {
        api: `/${url}/v1/invoice/dashboard/quote-filter?filter=${selectFilter}`,
        label: 'Quote Income',
      };
    }
  };

  const HandleFilterStats = async (filterValue: string, tab: 'invoice' | 'quote' = activeTab) => {
    setSelectFilter(filterValue);
    setxAxisData([]);
    setSeriesData([]);
    setLoading(true);
    try {
      const api = tab === 'invoice'
        ? `/${url}/v1/invoice/dashboard/filter?filter=${filterValue}`
        : `/${url}/v1/invoice/dashboard/quote-filter?filter=${filterValue}`;
      const result = await axios.get(api, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (result.data.status === 201) {
        if (tab === 'invoice') {
          const validData = (result.data.labelValue || []).filter(
            (item: any) =>
              item.label &&
              !isNaN(new Date(item.label).getTime()) &&
              typeof item.value === 'number' &&
              isFinite(item.value)
          );
          if (validData.length === 0) {
            setSeriesData([]);
            setxAxisData([]);
          } else {
            const xData = validData.map((item: any) => new Date(item.label));
            const yData = validData.map((item: any) => item.value);
            setxAxisData(xData);
            setSeriesData(yData);
          }
        } else {
          const { range = [], jk = [] } = result.data;
          const xData = range.map((date: string) => new Date(date));
          const yData = range.map((date: string) => {
            const jkItem = jk.find((item: any) => item.element === date);
            if (jkItem && Array.isArray(jkItem.totalPaid2) && jkItem.totalPaid2.length > 0) {
              return jkItem.totalPaid2.reduce((sum: number, val: number) => sum + val, 0);
            }
            return 0;
          });
          setxAxisData(xData);
          setSeriesData(yData);
        }
      }
    } catch (error) {
      setSeriesData([]);
      setxAxisData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    HandleFilterStats(selectFilter, activeTab);
  }, [activeTab, selectFilter]);

  const { label } = getApiAndLabel();

  return (
    <Grid
      sx={{
        background: `${theme ? 'transparent' : 'white'}`,
        border: `${theme ? '2px solid lightblue' : '1px solid white'}`,
        height: { xs: 'auto', md: 'auto' },
        boxShadow: '2px 10px 10px #8888883b',
        marginTop: '2%',
        borderRadius: '.5rem',
        width: { xs: '100%', md: '100%' },
      }}
    >
      <Grid
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          padding: '12px',
        }}
      >
        <Grid>
          <Typography
            variant="h5"
            sx={{
              padding: '12px',
              color: { xs: `${theme ? 'white' : 'black'}`, sm: `${theme ? 'white' : 'black'}` },
            }}
          >
            {label} Overview
          </Typography>
        </Grid>
        <Grid>
          <Select
            value={selectFilter}
            onChange={(e) => HandleFilterStats(e.target.value, activeTab)}
            sx={{
              minWidth: '200px',
              color: { xs: `${theme ? 'white' : 'black'}`, sm: `${theme ? 'white' : 'black'}` },
              border: `${theme ? '1px solid white' : 'black'}`,
            }}
            fullWidth
          >
            <MenuItem value="Today" sx={{ color: `${theme ? 'white' : 'black'}` }}>
              Today
            </MenuItem>
            <MenuItem value="This_Week" sx={{ color: `${theme ? 'white' : 'black'}` }}>
              This Week
            </MenuItem>
            <MenuItem value="Last_Week" sx={{ color: `${theme ? 'white' : 'black'}` }}>
              Last Week
            </MenuItem>
            <MenuItem value="This_Month" sx={{ color: `${theme ? 'white' : 'black'}` }}>
              This Month
            </MenuItem>
            <MenuItem value="Last_Month" sx={{ color: `${theme ? 'white' : 'black'}` }}>
              Last Month
            </MenuItem>
          </Select>
        </Grid>
      </Grid>
      {/* Only render the chart if there is valid data */}
      {loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
          <CircularProgress size={60} thickness={4} color="inherit" />
        </Box>
      ) : seriesData.length > 0 && xAxisData.length > 0 ? (
        <LineChart
          xAxis={[
            {
              label: 'Date',
              data: xAxisData,
              tickInterval: 'auto',
              scaleType: 'time',
              valueFormatter: (date) => dayjs(date).format('MMM D'),
            },
          ]}
          slotProps={{
            legend: {},
          }}
          sx={{ color: `${theme ? 'white' : 'black'}` }}
          yAxis={[{ label: 'Amount' }]}
          series={[
            {
              label: label,
              data: seriesData,
              area: true,
            },
          ]}
          height={300}
        />
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
          <Box sx={{ position: 'relative', display: 'inline-flex' }}>
            <CircularProgress size={60} thickness={4} color="inherit" />
            <Box
              sx={{
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                position: 'absolute',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <SentimentDissatisfiedIcon sx={{ fontSize: 36, color: 'grey.500' }} />
            </Box>
          </Box>
          <Typography variant="h6" sx={{ mt: 2, color: 'grey.600' }}>
            No data found
          </Typography>
          <Typography variant="body2" sx={{ color: 'grey.500' }}>
            Try changing the filter or check back later.
          </Typography>
        </Box>
      )}
    </Grid>
  );
};

export default InvoiceIncomeChart;

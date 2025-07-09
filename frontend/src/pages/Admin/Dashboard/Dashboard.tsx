import { Box, useTheme, Select, MenuItem, Backdrop, CircularProgress } from '@mui/material';
import { useEffect, useState, useCallback } from 'react';
import LeftBox1 from "./FirstLeftSection";
import LeftBox2 from "./SecondLeftSection";
import LeftBox3 from "./ThirdLeftSection";
import LeftBox4 from "./FourthLeftSection";
import RightBox3 from "./ThirdRightSection";
import RightBox1 from "./FirstRigthSection";
import RightBox2 from "./SecondRightSection";
import MarqueeSection from '@/components/common/marquee';
import PageHeader from '@/components/common/pageHeader';
import admin from '@/helpers/adminApiHelper';
import DateFilter from '@/components/filter/DateFilter';
import dayjs from 'dayjs';

const url = import.meta.env.VITE_NODE_ENV == "production" ? 'api' : 'api';

const FILTER_OPTIONS = [
  { label: 'Last 7 Days', value: '7' },
  { label: 'Last 30 Days', value: '30' },
  { label: 'Custom', value: 'custom' },
];

const AdminDashboard = () => {
  const theme = useTheme();
  const [summary, setSummary] = useState<any>(null);
  const [loaderResult, setLoaderResult] = useState(true);
  const [filter, setFilter] = useState<string>('7');
  const [startDate, setStartDate] = useState<string>(dayjs().format('YYYY-MM-DD'));
  const [endDate, setEndDate] = useState<string>(dayjs().subtract(7, 'day').format('YYYY-MM-DD'));
  const [showCustom, setShowCustom] = useState(false);
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');

  const getDetails = useCallback(async (params?: { filter?: string, startDate?: string, endDate?: string }) => {
    setLoaderResult(true);
    try {
      let filterVal = params?.filter || filter;
      let start = params?.startDate || startDate;
      let end = params?.endDate || endDate;
      let apiUrl = `/${url}/v1/admin/dashboarddetails?filter=${filterVal}&start=${start}&end=${end}`;
      const result = await admin.get(apiUrl);
      if (result.data.status === 201) {
        setTimeout(() => {
          setLoaderResult(false);
          setSummary(result?.data?.summary?.[0]);
          localStorage.setItem("totalw", result?.data?.summary?.[0]?.wallet);
        }, 300);
      }
    } catch (error) {
      console.log(error);
      setLoaderResult(false);
    }
  }, [filter, startDate, endDate]);

  useEffect(() => {
    getDetails();
  }, []);

  const handleFilterChange = (e: any) => {
    const value = e.target.value;
    setFilter(value);
    if (value === 'custom') {
      setShowCustom(true);
    } else {
      setShowCustom(false);
      setStartDate(dayjs().format('YYYY-MM-DD'));
      setEndDate(dayjs().subtract(parseInt(value, 10), 'day').format('YYYY-MM-DD'));
      getDetails({ filter: value, startDate: dayjs().format('YYYY-MM-DD'), endDate: dayjs().subtract(parseInt(value, 10), 'day').format('YYYY-MM-DD') });
    }
  };

  const handleCustomDateChange = ({ startDate, endDate }: { startDate: string, endDate: string }) => {
    setCustomStartDate(startDate);
    setCustomEndDate(endDate);
    if (startDate && endDate) {
      const later = dayjs(startDate).isAfter(dayjs(endDate)) ? startDate : endDate;
      const earlier = dayjs(startDate).isAfter(dayjs(endDate)) ? endDate : startDate;
      setStartDate(later);
      setEndDate(earlier);
      setFilter('custom');
      getDetails({ filter: 'custom', startDate: later, endDate: earlier });
    }
  };

  return (
    <Box className="dashboard-container" sx={{ backgroundColor: theme.palette.background.default }}>
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loaderResult}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <PageHeader title="Admin-dashboard" />
        <Box display="flex" alignItems="center" gap={2}>
          <Select
            value={filter}
            onChange={handleFilterChange}
            size="small"
          >
            {FILTER_OPTIONS.map(opt => (
              <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
            ))}
          </Select>
          {showCustom && (
            <DateFilter
              startDate={customStartDate}
              endDate={customEndDate}
              onFilterChange={({ startDate, endDate }) => handleCustomDateChange({ startDate, endDate })}
            />
          )}
        </Box>
      </Box>
      <MarqueeSection />

      {/* Two Column Layout */}
      <Box className="dashboard-flex-container">
        <Box className="dashboard-left-column">
          <LeftBox1 summary={summary} loaderResult={loaderResult} />
          <LeftBox2 summary={summary} loaderResult={loaderResult} />
          <LeftBox3 walletItems={summary?.walletItems} loaderResult={loaderResult} />
        </Box>

        <Box className="dashboard-right-column">
          <RightBox1 summary={summary} loaderResult={loaderResult} />
          <RightBox2 summary={summary} loaderResult={loaderResult} />
          <RightBox3 summary={summary} loaderResult={loaderResult} />
        </Box>
      </Box>

      <Box className="dashboard-full-width-box">
        <LeftBox4 cryptoTransactions={summary?.crypto_transactions} loaderResult={loaderResult} />
      </Box>
    </Box>
  );
};

export default AdminDashboard;

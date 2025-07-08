import { Box, useTheme } from '@mui/material';
import { useEffect, useState } from 'react';
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
const url = import.meta.env.VITE_NODE_ENV == "production" ? 'api' : 'api';
const AdminDashboard = () => {
  const theme = useTheme();
  const [summary, setSummary] = useState<any>(null);
  const [loaderResult, setLoaderResult] = useState(true);

  useEffect(() => {
    const getDetails = async () => {
      try {
        const result = await admin.get(`/${url}/v1/admin/dashboarddetails`, {
        });
        // console.log('API result:', result); 
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
    };
    getDetails();
  }, []);

  return (
    <Box className="dashboard-container" sx={{ backgroundColor: theme.palette.background.default }}>
      <PageHeader title="Admin-dashboard" />
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

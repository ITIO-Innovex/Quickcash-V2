import FiatCrypto from './FiatCrypto';
import api from '@/helpers/apiHelper';
import DashboardStats from './StatsSection';
import CryptoSection from './CryptoSection';
import { Box, useTheme,} from '@mui/material';
import { useNavigate } from 'react-router-dom'; 
import { useEffect, useState } from 'react';
import KYCPendingModal from '@/modal/kycPendingModal';
import KYCSubmittedModal from '@/modal/kycSubmittedModal';
import TransactionHistory from './TransactionHistory';
import PageHeader from '@/components/common/pageHeader';
const url = import.meta.env.VITE_NODE_ENV == 'production' ? 'api' : 'api';

const UserDashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [pendingModalOpen, setPendingModalOpen] = useState(false);
  const [submittedModalOpen, setSubmittedModalOpen] = useState(false);

    const handleStartVerification = () => {
    navigate('/kyc');             
  };

 useEffect(() => {
  const fetchKycStatus = async () => {
    try {
      const res = await api.get(`${url}/v1/kyc/status`);
      if (res.status === 200) {
        const kycStatus = res.data.status;
        console.log('KYC status of USER :', kycStatus);

        if (kycStatus === 'pending') {
          setPendingModalOpen(true);
        } else if (kycStatus === 'submitted') {
          setSubmittedModalOpen(true);
        }

      } else {
        console.error('Failed to fetch KYC status:', res.data.message);
      }
    } catch (error) {
      console.error('Error while fetching the kyc status', error);
    }
  };
  fetchKycStatus();
}, []);


  function handleLogout() {
    throw new Error('Function not implemented.');
  }

 return (
  <>
    {/* 🔒 KYC PENDING MODAL */}
    <KYCPendingModal
      open={pendingModalOpen}
      onStartVerification={handleStartVerification}
    />

    {/* ⏳ KYC SUBMITTED MODAL */}
<KYCSubmittedModal
  open={submittedModalOpen}
/>


    {/* ✅ SHOW DASHBOARD ONLY IF NOT PENDING OR SUBMITTED */}
    {!pendingModalOpen && !submittedModalOpen && (
      <Box
        className="dashboard-container"
        sx={{ backgroundColor: theme.palette.background.default }}
      >
        <PageHeader title="Dashboard" />
        <DashboardStats />
        <CryptoSection />
        <FiatCrypto />
        <TransactionHistory />
      </Box>
    )}
  </>
);

};

export default UserDashboard;

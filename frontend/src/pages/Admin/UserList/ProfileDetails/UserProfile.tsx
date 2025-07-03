import React, { useState, useEffect } from 'react';
import { Box, Container, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import UserInformation from './UserInformation';
import TabNavigation from './TabNavigation';
import AccountsList from './AccountList';
import BeneficiaryAccountsList from './BeneficiaryAccountsList';
import AdditionalInformation from './AdditionalInformation';
import LoginHistory from './LoginHistory';
import Documents from './Documents';
import adminApi from '@/helpers/adminApiHelper';
import admin from '@/helpers/adminApiHelper';

interface UserProfileProps {
  userId?: string;
}

const UserProfile = ({ userId }: UserProfileProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery('(max-width:600px)');
  const [activeTab, setActiveTab] = useState('User Information');
  const [activeSubTab, setActiveSubTab] = useState('Additional Information');

  // State for all user data
  const [userDetails, setUserDetails] = useState<any>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [beneficiaryAccounts, setBeneficiaryAccounts] = useState<any[]>([]);
  const [loginHistory, setLoginHistory] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    // Fetch user details
    admin.get(`/api/v1/admin/usergetbyId/${userId}`)
      .then(res => {
        if (res.data.status === 201) {
          const data = res.data.data?.[0] || {};
          setUserDetails(data);
          setAccounts(data.accountDetails || []);
          setBeneficiaryAccounts(data.beneDetails || []);
          setDocuments({
            owneridofindividual: data.owneridofindividual || '',
            ownertaxid: data.ownertaxid || '',
            ownerbrd: data.ownerbrd || '',
            ownerProfile: data.ownerProfile || '',
          });
          // console.log('User Details:', data);
        } else {
          setError('User not found');
        }
      })
      .catch(() => setError('Failed to fetch user details'))
      .finally(() => setLoading(false));
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    // Fetch login history
    admin.get(`/api/v1/session/getusersession/${userId}`)
      .then(res => {
        if (res.data.status === 201) {
          setLoginHistory(res.data.data || []);
        }
      })
      .catch(() => setLoginHistory([]));
  }, [userId]);

  const tabs = [
    'User Information',
    'Login History',
    'Documents'
  ];

  const subTabs = ['Additional Information', 'Accounts List', 'Beneficiary Accounts List'];

  if (loading) return <Container maxWidth="lg"><Box p={4}>Loading...</Box></Container>;
  if (error) return <Container maxWidth="lg"><Box p={4} color="red">{error}</Box></Container>;
  if (!userDetails) return null;

  const renderSubTabContent = () => {
    switch (activeSubTab) {
      case 'Additional Information':
        return <AdditionalInformation userDetails={userDetails} />;
      case 'Accounts List':
        return <AccountsList accounts={accounts} />;
      case 'Beneficiary Accounts List':
        return <BeneficiaryAccountsList accounts={beneficiaryAccounts} />;
      default:
        return <AdditionalInformation userDetails={userDetails} />;
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'User Information':
        return (
          <Box>
            <UserInformation userDetails={userDetails} />
            <Box sx={{ mt: 3 }}>
              <TabNavigation
                tabs={subTabs}
                activeTab={activeSubTab}
                onTabChange={setActiveSubTab}
                orientation={isMobile ? 'vertical' : 'horizontal'}
                variant={isMobile ? 'standard' : 'scrollable'}
              />
              <Box sx={{ mt: 2 }}>
                {renderSubTabContent()}
              </Box>
            </Box>
          </Box>
        );
      case 'Login History':
        return <LoginHistory loginHistory={loginHistory} />;
      case 'Documents':
        return <Documents documents={documents} />;
      default:
        return (
          <Box sx={{ p: 3, textAlign: 'center', color: theme.palette.text.secondary }}>
            {activeTab} content will be implemented here
          </Box>
        );
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Box
        sx={{
          backgroundColor: theme.palette.background.default,
          borderRadius: 2,
          overflow: 'hidden'
        }}
        data-theme={theme.palette.mode}
      >
        <TabNavigation
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          orientation={isMobile ? 'vertical' : 'horizontal'} variant={isMobile ? 'standard' : 'scrollable'}
        />
        {renderTabContent()}
      </Box>
    </Container>
  );
};

export default UserProfile;

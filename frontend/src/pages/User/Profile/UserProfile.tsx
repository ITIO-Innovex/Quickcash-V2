
import React, { useState } from 'react';
import { Box, Container, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import UserInformation from './UserInformation';
import TabNavigation from './TabNavigation';
import AccountsList from './AccountsList';
import BeneficiaryAccountsList from './BeneficiaryAccountsList';
import AdditionalInformation from './AdditionalInformation';
import LoginHistory from './LoginHistory';
import SecurityForm from './SecurityForm';
import UpdateDetails from './UpdateDetails';
import Documents from './Documents';
import Settings from './Settings';

const UserProfile = () => {
  const theme = useTheme();
    const isMobile = useMediaQuery('(max-width:600px)');
  const [activeTab, setActiveTab] = useState('User Information');
  const [activeSubTab, setActiveSubTab] = useState('Additional Information');

  const tabs = [
    'User Information',
    'Login History',
    'Security',
    'Update Details',
    'Documents',
    'Settings'
  ];

  const subTabs = ['Additional Information', 'Accounts List', 'Beneficiary Accounts List'];

  const renderSubTabContent = () => {
    switch (activeSubTab) {
      case 'Additional Information':
        return <AdditionalInformation />;
      case 'Accounts List':
        return <AccountsList />;
      case 'Beneficiary Accounts List':
        return <BeneficiaryAccountsList />;
      default:
        return <AdditionalInformation />;
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'User Information':
        return (
          <Box>
            <UserInformation />
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
        return <LoginHistory />;
      case 'Security':
        return <SecurityForm />;
      case 'Update Details':
        return <UpdateDetails />;
      case 'Documents':
        return <Documents />;
      case 'Settings':
        return <Settings/>;
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

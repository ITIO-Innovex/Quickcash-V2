
import React, { useState } from 'react';
import { Box, useTheme } from '@mui/material';
import Header from './Header';
import ContactDetails from './ContactDetails';
import DocumentDetails from './DocumentDetails';
import ResidentialAddress from './ResidentialAddress';
import KYCPendingModal from '@/modal/kycPendingModal';
import EmailVerifyModal from '@/modal/emailVerifyModal';
import KYCSubmittedModal from '@/modal/kycSubmittedModal';

const KYCMain = () => {
  const theme = useTheme();
  const [currentStep, setCurrentStep] = useState(1);
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  
  const handleEmailVerified = () => {
    setVerifyModalOpen(false);
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <ContactDetails onNext={() => setCurrentStep(2)} />;
      case 2:
        return <DocumentDetails onNext={() => setCurrentStep(3)} onBack={() => setCurrentStep(1)} />;
      case 3:
        return <ResidentialAddress onBack={() => setCurrentStep(2)} />;
      default:
        return <ContactDetails onNext={() => setCurrentStep(2)} />;
    }
  };

  return (
    <Box 
      className="kyc-container"
      sx={{ backgroundColor: theme.palette.background.default }}
    >
      <Header 
        onOpenVerify={() => setVerifyModalOpen(true)} onOpenPending={function (): void {
          throw new Error('Function not implemented.');
        } } onOpenSubmitted={function (): void {
          throw new Error('Function not implemented.');
        } }      />
      
      {renderCurrentStep()}
      
      <EmailVerifyModal
        open={verifyModalOpen}
        onClose={() => setVerifyModalOpen(false)}
        onProceed={handleEmailVerified}
      />
    </Box>
  );
};

export default KYCMain;

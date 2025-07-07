import React, { useState, useEffect } from 'react';
import { ArrowLeft } from "lucide-react";
import {
  Box,
  Typography,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  useTheme,
  useMediaQuery,
  Alert,
  Slide,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import './sendMoney.css';
import SelectDestinationStep from './SelectDestinationStep';
import CurrencySelectionStep from './CurrencySelectionStep';
import TransferMethodStep from './TransferMethodStep';
import TransferDetailsStep from './TransferDetailsStep';
import { jwtDecode } from 'jwt-decode';
import { JwtPayload } from '@/types/jwt';
import { useAccount } from '@/hooks/useAccount';
import { useCurrency } from '@/hooks/useCurrency';
import StatusModal from './StatusModal';
import { getRecommendedTransferMethod, getAvailableTransferMethods } from '@/utils/transferMethodUtils';

// Define beneficiary interface for type safety
interface Beneficiary {
  id: string;
  name: string;
  accountNumber: string;
  country: string;
  currency: string;
  avatar?: string;
}

// Main Send Money Component - Handles the multi-step money transfer process
const SendMoney = () => {
  const accountId = jwtDecode<JwtPayload>(localStorage.getItem('token') as string);
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [activeStep, setActiveStep] = useState(0);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<Beneficiary | null>(null);
  const [formData, setFormData] = useState({
    selectedCountry: '',
    fromCurrency: 'USD',
    toCurrency: '',
    sendAmount: '',
    receiveAmount: '',
    receivingOption: 'bank_account', // Set statically
    transferMethod: '',
    beneficiaryData: {},
    // New fields for automatic transfer method selection
    destinationCountry: '',
    destinationCurrency: '',
    recommendedTransferMethod: '',
    availableTransferMethods: [],
    transferMethodDetails: null,
  });

  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusModalStatus, setStatusModalStatus] = useState<'pending' | 'success' | 'error'>('pending');

  // Step labels for the stepper component
  const steps = ['Select Destination', 'Select Currencies', 'Transfer Method', 'Transfer Details'];

  // API integeration for sending money by Pawnesh Kumar
  const {list} = useAccount(accountId?.data?.id);
  const { currencyList } = useCurrency();
  const url = import.meta.env.VITE_NODE_ENV == "production" ? 'api' : 'api';
  const handleBack = () => {
    navigate("/dashboard");
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handlePrevious = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const updateFormData = (newData: any) => {
    setFormData(prev => ({ ...prev, ...newData }));
  };

  // Navigate to separate beneficiary selection page
  const handleBeneficiaryTab = () => {
    navigate("/beneficiary", { 
      state: { 
        returnToSendMoney: true 
      } 
    });
  };

  // Handle beneficiary selection and move to currency step
  const handleBeneficiarySelect = (beneficiary: Beneficiary) => {
    setSelectedBeneficiary(beneficiary);
    // Auto-fetch recommended transfer method and available methods
    const recommendedMethod = getRecommendedTransferMethod(beneficiary.country, beneficiary.currency);
    const availableMethods = getAvailableTransferMethods(beneficiary.country, beneficiary.currency);
    updateFormData({
      toCurrency: beneficiary.currency,
      selectedCountry: beneficiary.country,
      beneficiaryData: beneficiary,
      recommendedTransferMethod: recommendedMethod.methodId,
      availableTransferMethods: availableMethods.map(m => m.methodId),
      transferMethod: recommendedMethod.methodId,
      transferMethodDetails: recommendedMethod,
      destinationCountry: beneficiary.country,
      destinationCurrency: beneficiary.currency
    });
    setActiveStep(1); // Move to currency selection step
  };

  // Listen for beneficiary selection from navigation state
  useEffect(() => {
    if (location.state?.selectedBeneficiary) {
      const beneficiary = location.state.selectedBeneficiary;
      handleBeneficiarySelect(beneficiary);
      // Clear the state to prevent re-triggering
      navigate(location.pathname, { replace: true });
    }
  }, [location.state]);

  // On mount, check for ?step=2 in the URL and set activeStep accordingly
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const stepParam = params.get('step');
    if (stepParam === '2') {
      setActiveStep(1); // Step 2 (Select Currencies) is index 1
      // Fetch selected currency and transfer method from localStorage
      const beneficiaryData = JSON.parse(localStorage.getItem('beneficiaryData') || '{}');
      const selectedCurrency = beneficiaryData.currency;
      const selectedTransferMethod = beneficiaryData.selectedMethod;
      console.log("currency",selectedCurrency);
      if (selectedCurrency) {
        updateFormData({
          toCurrency: selectedCurrency,
          destinationCurrency: selectedCurrency
        });
      }
      if (selectedTransferMethod) {
        updateFormData({
          transferMethod: selectedTransferMethod
        });
      }
    }
  }, [location.search]);

  // Handler to show status modal
  const handleShowStatusModal = (status: 'pending' | 'success' | 'error' = 'pending') => {
    setStatusModalStatus(status);
    setStatusModalOpen(true);
  };

  // Step 1: Destination Selection Component - Choose country or go to beneficiary selection
  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <SelectDestinationStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={handleNext}
            onBeneficiaryTab={handleBeneficiaryTab}
            onSelectBeneficiary={handleBeneficiarySelect}
            currencyList={currencyList}
          />
        );
      case 1:
        // Step 2: Currency Selection Component - Choose send/receive currencies and amounts
        return (
          <CurrencySelectionStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={handleNext}
            onPrevious={handlePrevious}
            selectedBeneficiary={selectedBeneficiary}
          />
        );
      case 2:
        // Step 3: Transfer Method Component - Choose how to send money (bank, card, etc.)
        return (
          <TransferMethodStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 3:
        // Step 4: Transfer Details Component - Final confirmation and payment details
        return (
          <TransferDetailsStep
            formData={formData}
            updateFormData={updateFormData}
            onPrevious={handlePrevious}
            onShowStatusModal={handleShowStatusModal}
            pending={statusModalStatus === 'pending'}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Box className="send-money-container">
      {/* Header Section */}
      <Box className="send-money-header">
          {/* <Typography variant="subtitle1" className="header-subtitle" sx={{color:theme.palette.text.gray}}>
            Fast, secure money transfers worldwide
          </Typography> */}
      </Box>

      {/* Stepper Navigation - Shows current step progress */}
      <Box className="stepper-container">
        <Stepper 
          activeStep={activeStep} 
          className="send-money-stepper"
          orientation={isMobile ? 'vertical' : 'horizontal'}
          sx={{
            '& .MuiStepConnector-root': {
              ...(isMobile && {
                marginLeft: '12px',
                minHeight: '30px',
              }),
            },
            '& .MuiStepLabel-root': {
              ...(isMobile && {
                padding: '8px 0',
              }),
            },
          }}
        >
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel 
                className={`step-label ${index <= activeStep ? 'active' : ''}`}
              >
                <Typography className="step-text" sx={{color:theme.palette.text.gray}}>
                  {label}
                </Typography>
              </StepLabel>
            </Step>
          ))}
        </Stepper>  
      </Box>

      {/* Step Content - Renders the current step component */}
      <Box className="step-content">
        {renderStepContent()}
      </Box>
      <StatusModal
        open={statusModalOpen}
        status={statusModalStatus}
        onClose={() => setStatusModalOpen(false)}
      />
    </Box>
  );
};

export default SendMoney;

import api from '@/helpers/apiHelper';
import { jwtDecode } from "jwt-decode";
import { JwtPayload } from '@/types/jwt';
import { useAppToast } from "@/utils/toast";
import { useEffect, useState } from 'react';
import CountdownTimer from '@/components/CountDownTimer';
import { useLocation, useNavigate } from 'react-router-dom';
import CustomButton from '../../../components/CustomButton';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CustomDropdown from '../../../components/CustomDropdown';
import CustomInputField from '../../../components/CustomInputField';
const url = import.meta.env.VITE_NODE_ENV === 'production' ? 'api' : 'api';
import { Box, Card, CardContent, Typography, useTheme, LinearProgress, Stepper, Step, StepLabel, useMediaQuery, Checkbox, FormControlLabel, Radio, RadioGroup } from '@mui/material';

interface CustomJwtPayload {
  data: {
    id: string;
    email: string;
  };
  iat?: number;
  exp?: number;
}

const ProceedPage = () => {
  const theme = useTheme();
  const toast = useAppToast();
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [walletNotFound, setWalletNotFound] = useState(false);
  const [showRequestBtn, setShowRequestBtn] = useState(false);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [transferType, setTransferType] = useState('Bank Transfer');
  const [buyWalletNotFound, setBuyWalletNotFound] = useState(false);
  const calculationData = JSON.parse(localStorage.getItem("calculationData") || '{}');
  const sellCalculationData = JSON.parse(localStorage.getItem("sellCalculationData") || '{}');
  console.log(sellCalculationData);

  console.log('ProceedPage - Current step:', currentStep);
  console.log('ProceedPage - Is confirmed:', isConfirmed);
  console.log("ProceedPage - Checking if continue is disabled, step:", currentStep, "confirmed:", isConfirmed);

  const steps = ['Details', 'Confirm', 'Complete'];
  
  const transactionType = location.state?.type || 'buy';

  const transferOptions = [
    { label: 'Bank Transfer', value: 'Bank Transfer' },
  ];

  const cryptoFees = transactionType === 'sell'
  ? Number(sellCalculationData.cryptoFees || 0)
  : Number(calculationData.cryptoFees || 0);

const exchangeFees = transactionType === 'sell'
  ? Number(sellCalculationData.exchangeFees || 0)
  : Number(calculationData.exchangeFees || 0);

const currency = transactionType === 'sell'
  ? sellCalculationData.currency
  : calculationData.currency;

const totalFees = cryptoFees + exchangeFees;

useEffect(() => {
  const fetchWalletAddress = async () => {
    const token = localStorage.getItem('token');
    const calculationData = JSON.parse(localStorage.getItem('calculationData') || '{}');
    const localCoin = calculationData.coin;

    if (!token || !localCoin) {
      console.warn("Token or Coin missing in localStorage");
      setBuyWalletNotFound(true); // ✅ Trigger button show
      return;
    }

    const coinWithTest = `${localCoin}_TEST`;

    try {
      const response = await api.get(
        `/${url}/v1/walletaddressrequest/fetch?coin=${coinWithTest}`
      );

      const address = response.data?.data;

      if (address) {
        setWalletAddress(address);
        localStorage.setItem('cwalletAddress', address);
        setBuyWalletNotFound(false);
      } else {
        console.warn("⚠️ Wallet address not found for coin:", coinWithTest);
        setBuyWalletNotFound(true); // ✅ Trigger button show
      }
    } catch (error) {
      console.error("❌ Error fetching wallet address:", error);
      setBuyWalletNotFound(true); // ✅ Trigger button show
    }
  };

  fetchWalletAddress();
}, []);

// Fetch Wallet for Sell
useEffect(() => {
  const fetchSellWalletAddress = async () => {
    const token = localStorage.getItem('token');
    const sellData = JSON.parse(localStorage.getItem('sellCalculationData') || '{}');
    const sellCoin = sellData.coin;

    if (!token || !sellCoin) {
      console.warn("Token or Coin missing for SELL in localStorage");
      return;
    }

    const sellCoinWithTest = `${sellCoin}_TEST`;

    try {
      const response = await api.get(
        `/${url}/v1/walletaddressrequest/fetch?coin=${sellCoinWithTest}`
      );

      const walletAddr = response.data?.data;

      if (walletAddr) {
        setWalletAddress(walletAddr);
        localStorage.setItem('sellwalletAddress', walletAddr);
        setWalletNotFound(false); // ✅ found
      } else {
        console.warn("⚠️ Wallet address not found for sellCoin:", sellCoinWithTest);
        setWalletNotFound(true);  // ✅ not found
      }
    } catch (error) {
      console.error("❌ Error fetching SELL wallet address:", error);
      setWalletNotFound(true);
    }
  };

  fetchSellWalletAddress();
}, []);

// request new wallet address
const HandleWalletRequest = async () => {
  setLoading(true);

  try {
   const calculationData = JSON.parse(localStorage.getItem("calculationData") || '{}');
      const token = localStorage.getItem('token');
      const decoded = jwtDecode<JwtPayload>(token || '');
      const userId = decoded?.data?.id;
      const email = decoded?.data?.email;
      const coin = `${calculationData.coin}_TEST`;

    const response = await api.post(
      `/${url}/v1/walletaddressrequest/add`,
      {
        user: userId,
        coin,
        email,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.data.status === 201) {
      const walletAddr = response.data.data;
      console.log("✅ Wallet created:", walletAddr);

      setWalletAddress(walletAddr);
      localStorage.setItem('cwalletAddress', walletAddr);
    } else {
      console.warn("⚠️ Unexpected response:", response.data);
    }
  } catch (error: any) {
    console.error("❌ Error in HandleWalletRequest:", error);
    toast.error(error?.response?.data?.message || 'Wallet request failed');
  } finally {
    setLoading(false);
  }
};

const proceedBuyCrypto = async () => {
  setLoading(true);
  try {
    const token = localStorage.getItem("token");
    const accountId = jwtDecode<JwtPayload>(token as string);
    const data = JSON.parse(localStorage.getItem("calculationData") || '{}');
    const walletAddress = localStorage.getItem("cwalletAddress");

    const payload = {
      user: accountId?.data?.id,
      coin: `${data.coin}_TEST`,
      paymentType: transferType,
      amount: data.amount,
      noOfCoins: parseFloat(data.numberofCoins).toFixed(7),
      side: data.type,
      walletAddress,
      currencyType: data.currency,
      fee: parseFloat(data.cryptoFees) + parseFloat(data.exchangeFees),
      status: "pending"
    };
    const response = await api.post(`/${url}/v1/crypto/add`, payload);
    console.log("✅ API Response:", response);
    console.log("👉 response.status:", response.status);
    if (response.data.status === 201) {
      handleNext(); // ✅ call your function directly
    }

  } catch (error: any) {
    console.error("❌ Buy Crypto Error:", error?.response?.data || error);
    toast.error(error?.response?.data?.message || "Buy failed");
  } finally {
    setLoading(false); // ensure spinner stops in all cases
  }
};

const proceedSellCrypto = async () => {
  setLoading(true);
  try {
    const token = localStorage.getItem("token");
    const accountId = jwtDecode<JwtPayload>(token as string);
    const sellData = JSON.parse(localStorage.getItem("sellCalculationData") || "{}");
    const walletAddress = localStorage.getItem("sellwalletAddress");

    const payload = {
      user: accountId?.data?.id,
      coin: `${sellData.coin}_TEST`,
      amount: parseFloat(sellData.amount || '0'),
      noOfCoins: parseFloat(sellData.youSell || '0'),
      side: "sell",
      currencyType: sellData.currency,
      walletAddress,
      fee: parseFloat(sellData.cryptoFees || '0') + parseFloat(sellData.exchangeFees || '0'),
      status: "pending"
    };

    const amountCheck = payload.amount - payload.fee;

    if (Math.sign(amountCheck) === -1) {
      toast.error("Amount should not be negative");
      return;
    }

    const response = await api.post(`/${url}/v1/crypto/sell`, payload);

    // console.log("✅ Sell API Response:", response);
    if (response.data.status === 201) {
      handleNext();
    }

  } catch (error: any) {
    console.error("❌ Sell Crypto Error:", error?.response?.data || error);
    toast.error(error?.response?.data?.message || "Sell failed");
  } finally {
    setLoading(false);
  }
};

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

 const handleBack = () => {
  if (currentStep > 0) {
    setCurrentStep(currentStep - 1);
  } else {
    navigate('/buysellswap', {
  state: { type: transactionType }, // 👈 this fixes the bug!
});
  }
};


const handleComplete = () => {
  // Clear buy data
  localStorage.removeItem('calculationData');
  localStorage.removeItem('cwalletAddress');

  // Clear sell data
  localStorage.removeItem('sellCalculationData');
  localStorage.removeItem('sellAvailableData');
  localStorage.removeItem('sellwalletAddress');
  localStorage.removeItem('calculationDatasellAvailableData');
  localStorage.removeItem('sellCalculation');

  // ✅ Redirect
  navigate('/buysellswap');
};


  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Box className="proceed-content">
            <Typography variant="h6" className="proceed-title" sx={{ color: theme.palette.text.primary }}>
              {transactionType?.toUpperCase?.() || 'TRANSACTION'} Details
            </Typography>
            
            <Box className="proceed-grid" >
              <Box className="proceed-amount-card">
               <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  {transactionType === 'sell' ? 'Number of Coins' : 'Amount'}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold', }}>
                  {transactionType === 'sell'
                  ? `${sellCalculationData.youSell} `
                  : `${calculationData.amount} ${calculationData.currency}`}
                </Typography>
                <Typography variant="caption" >
                 Fees =  {totalFees} {currency}
                </Typography>
               <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                {transactionType === 'sell' ? 'Amount You Recieve' : 'Total Amount'} = {
                  transactionType === 'sell'
                    ? sellCalculationData.amount
                    : parseFloat(calculationData.amount || '0') +
                      Number(calculationData.cryptoFees || 0) +
                      Number(calculationData.exchangeFees || 0)
                }{' '}
                {transactionType === 'sell'
                  ? sellCalculationData.currency
                  : calculationData.currency}
              </Typography>

              </Box>

              <Box className="proceed-crypto-card" sx={{ backgroundColor: '#483594' }}>
                <Typography variant="subtitle2" className="proceed-crypto-subtitle">
                  You will get
                </Typography>
               {transactionType === 'sell' ? (
                  <Typography variant="h6" className="proceed-crypto-amount">
                    Total Amount = Amount - Fees
                  </Typography>
                ) : (
                  <Typography variant="h6" className="proceed-crypto-amount">
                    {calculationData.numberofCoins} {calculationData.coin}
                  </Typography>
                )}
              {transactionType === 'buy' ? (
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  1 {calculationData.currency} = {calculationData.rate} {calculationData.coin}
                </Typography>
              ) : (
               (() => {
                const amount = parseFloat(sellCalculationData.amount || '0');
                const cryptoFees = parseFloat(sellCalculationData.cryptoFees || '0');
                const exchangeFees = parseFloat(sellCalculationData.exchangeFees || '0');
                const totalFees = cryptoFees + exchangeFees;
                const netAmount = amount - totalFees;
                const isNegative = netAmount < 0;
                const sign = isNegative ? '-' : '+';

                return (
                  <Typography
                    variant="caption"
                    sx={{
                      color: isNegative ? 'error.main' : 'rgba(12, 50, 20, 0.8)',
                      fontWeight: 'bold',
                    }}
                  >
                    {`Total = ${amount} - ${totalFees} = ${sign}${Math.abs(netAmount).toFixed(2)} ${sellCalculationData.currency}`}
                  </Typography>
                );
              })()

              )}

              </Box>
            </Box>

            <Box className="proceed-field">
              <Typography variant="subtitle2" className="proceed-field-label" sx={{ color: theme.palette.text.primary }}>
                TRANSFER TYPE
              </Typography>
              <CustomDropdown
                label=""
                value={transferType}
                onChange={(e) => setTransferType(e.target.value as string)}
                options={transferOptions}
              />
            </Box>

              <Box className="proceed-field">
                <Typography variant="subtitle2" className="proceed-field-label">
                  WALLET ADDRESS
                </Typography>

                <CustomInputField
                  value={
                    transactionType === 'sell'
                      ? walletAddress || localStorage.getItem('sellwalletAddress') || ''
                      : walletAddress || localStorage.getItem('cwalletAddress') || ''
                  }
                  onChange={(e) => setWalletAddress(e.target.value)}
                  disabled
                  placeholder="Wallet Address"
                />

                {transactionType === 'buy' && buyWalletNotFound && (
                  <CustomButton
                      variant="contained"
                      size="small"
                      sx={{ mt: 1 }}
                      disabled={loading}
                      onClick={HandleWalletRequest}
                  >
                      {loading ? 'Requesting...' : 'Request Wallet Address'}
                  </CustomButton> 
                )}
              </Box>

            {/* Confirmation checkbox for all transaction types */}
            <Box className="proceed-field">
              <FormControlLabel
              control={
                <Checkbox
                  checked={isConfirmed}
                  onChange={(e) => {
                    const checked = e.target.checked;

                    if (currentStep === 0 && transactionType === 'sell') {
                      const sellData = JSON.parse(localStorage.getItem("sellCalculationData") || "{}");
                      const amount = parseFloat(sellData.amount || '0');
                      const cryptoFees = parseFloat(sellData.cryptoFees || '0');
                      const exchangeFees = parseFloat(sellData.exchangeFees || '0');
                      const totalFees = cryptoFees + exchangeFees;
                      const netAmount = amount - totalFees;

                      if (netAmount < 0) {
                        toast.error("❌ Amount should not be negative");
                        return; // ⛔ Stop from checking the box
                      }
                    }

                    console.log('✅ Checkbox changed to:', checked);
                    setIsConfirmed(checked);
                  }}
                  sx={{
                    color: theme.palette.text.secondary,
                    '&.Mui-checked': {
                      color: '#483594',
                    },
                  }}
                />
              }
              label={
                <Typography variant="body2" sx={{ color: theme.palette.text.primary, mt: 0.4 }}>
                  I confirm the above details are correct
                </Typography>
              }
            />

            </Box>
          </Box>
        );

      case 1:
        return (
          <Box className="proceed-confirm-container">
            <Typography variant="h6" className="proceed-confirm-title">
            Confirm {transactionType.toUpperCase()}
          </Typography>
            <Typography variant="body2" className="proceed-confirm-timer" sx={{ color: theme.palette.text.gray }}>
              <span><CountdownTimer /></span>
            </Typography>
            
            <Box className="proceed-grid">
              <Box 
                className="proceed-amount-card"
              >
                <Typography variant="subtitle2" sx={{ mb: 1, color: theme.palette.text.secondary }}>
                   {transactionType === 'sell' ? 'Number of Coins' : 'Amount'}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>
                 {transactionType === 'sell'
                  ? `${sellCalculationData.youSell} ${sellCalculationData.coin} `
                  : `${calculationData.amount} ${calculationData.currency}`}
                </Typography>
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                   Fees =  {totalFees} {currency}
                </Typography>
              </Box>

              <Box className="proceed-crypto-card" sx={{ backgroundColor: '#483594' }}>
                {transactionType === 'buy' && (
                  <>
                    <Typography variant="subtitle2" className="proceed-crypto-subtitle">
                      You will get
                    </Typography>
                    <Typography variant="h6" className="proceed-crypto-amount">
                      {calculationData.numberofCoins} {calculationData.coin}
                    </Typography>
                     <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  1 {calculationData.currency} = {calculationData.rate} {calculationData.coin}
                </Typography>
                  </>
                )}
               <Typography
                  variant="body2"
                  sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}
                >
                  {transactionType === 'sell' ? 'Amount You Recieve' : 'Total Amount'} = {
                    transactionType === 'sell'
                      ? sellCalculationData.amount
                      : parseFloat(calculationData.amount || '0') +
                        Number(calculationData.cryptoFees || 0) +
                        Number(calculationData.exchangeFees || 0)
                  }{' '}
                  {transactionType === 'sell'
                    ? sellCalculationData.currency
                    : calculationData.currency}
                </Typography>

                {/* ✅ This shows only in SELL and goes right below */}
                {transactionType === 'sell' && (() => {
                  const amount = parseFloat(sellCalculationData.amount || '0');
                  const cryptoFees = parseFloat(sellCalculationData.cryptoFees || '0');
                  const exchangeFees = parseFloat(sellCalculationData.exchangeFees || '0');
                  const totalFees = cryptoFees + exchangeFees;
                  const netAmount = amount - totalFees;
                  const isNegative = netAmount < 0;
                  const sign = isNegative ? '-' : '+';

                  return (
                    <Typography
                      variant="caption"
                      sx={{
                        color: isNegative ? 'error.main' : 'rgba(12, 50, 20, 0.8)',
                        fontWeight: 'bold',
                      }}
                    >
                      {`Total = ${amount} - ${totalFees} = ${sign}${Math.abs(netAmount).toFixed(2)} ${sellCalculationData.currency}`}
                    </Typography>
                  );
                })()}

              </Box>
              
            </Box>

            <Box className="proceed-field">
              <Typography variant="subtitle2" className="proceed-field-label" sx={{ color: theme.palette.text.primary }}>
                TRANSFER TYPE
              </Typography>
              <Typography variant="body1" sx={{ color: theme.palette.text.primary }}>
                {transferType}
              </Typography>
            </Box>

            <Box className="proceed-field">
              <Typography variant="subtitle2" className="proceed-field-label" sx={{ color: theme.palette.text.primary }}>
                WALLET ADDRESS
              </Typography>
            <Typography
            variant="body2"
            className="proceed-address-text"
            sx={{ color: theme.palette.text.primary }}
          >
            {transactionType === 'sell'
              ? walletAddress || localStorage.getItem('sellwalletAddress') || ''
              : walletAddress || localStorage.getItem('cwalletAddress') || ''}
          </Typography>

            </Box>
          </Box>
        );

      case 2:
        return (
          <Box className="proceed-complete-container">
            <Typography variant="h6" className="proceed-complete-title" sx={{ color: theme.palette.text.primary }}>
              Transaction Completed
            </Typography>
            
            <Box className="proceed-complete-icon">
              <CheckCircleIcon sx={{ fontSize: 64, color: '#483594', mb: 1 }} />
              <Typography variant="body1" className="proceed-complete-status" sx={{ color: theme.palette.text.primary }}>
                Wait for Admin Approval
              </Typography>
            </Box>

            <Box 
              className="proceed-total-card"
            >
             <Typography variant="subtitle2" className="proceed-total-label" sx={{ color: theme.palette.text.primary }}>
                {transactionType === 'sell' ? 'TOTAL AMOUNT RECEIVED' : 'TOTAL AMOUNT PAID'}
              </Typography>

              {transactionType === 'sell' ? (
                <Typography variant="h5" className="proceed-total-amount" sx={{ color: theme.palette.text.gray }}>
                  {sellCalculationData.amount} {sellCalculationData.currency}
                </Typography>
              ) : (
              <Typography variant="h5" className="proceed-total-amount" sx={{ color: theme.palette.text.gray }}>
                 {parseFloat(calculationData.amount) + calculationData.cryptoFees + calculationData.exchangeFees} {calculationData.currency}
              </Typography>)}
            </Box>

            <Box className="proceed-arrow-container">
              <Box 
                className="proceed-arrow-icon"
                sx={{ backgroundColor: '#483594' }}
              >
                ↓
              </Box>
            </Box>

            <Box 
              className="proceed-total-card"
            >
              <Typography variant="subtitle2" className="proceed-total-label" sx={{ color: theme.palette.text.primary }}>
               {transactionType === 'sell' ? 'TOTAL COINS SELL' : 'GETTING COIN'}
              </Typography>
              <Typography variant="h6" className="proceed-total-amount" sx={{ color: theme.palette.text.gray }}>
              {transactionType === 'sell'
              ? `${sellCalculationData.youSell} ${sellCalculationData.currency}`
              : `${calculationData.numberofCoins} ${calculationData.coin}`}
              </Typography>
            </Box>
          </Box>
        );

      default:
        return null;
    }
  };

  // Updated validation logic - only require checkbox confirmation
  const isContinueDisabled = () => {
    console.log('ProceedPage - Checking if continue is disabled, step:', currentStep, 'confirmed:', isConfirmed);
    
    if (currentStep === 0) {
      // Only require confirmation checkbox to be checked
      return !isConfirmed;
    }
    return false;
  };

  return (
    <Box className="proceed-container" sx={{ backgroundColor: theme.palette.background.default }}>
      <Card sx={{ backgroundColor: theme.palette.background.default }} className="proceed-card">
        <CardContent>
          <Box className="proceed-step-header">
            <Typography variant="h6" className="proceed-step-title" sx={{ color: theme.palette.text.primary }}>
              STEP {currentStep + 1} OF {steps.length}
            </Typography>
            <Stepper 
              activeStep={currentStep} 
              className="proceed-stepper"
              orientation={isMobile ? 'vertical' : 'horizontal'}
              sx={{
                '& .MuiStepLabel-root': {
                  color: theme.palette.text.primary,
                },
                '& .MuiStepIcon-root': {
                  color: theme.palette.text.secondary,
                  '&.Mui-active': {
                    color: '#483594',
                  },
                  '&.Mui-completed': {
                    color: '#483594',
                  },
                },
              }}
            >
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>

          {renderStepContent()}

          <Box className="proceed-buttons">
         
            <CustomButton
              onClick={handleBack}
              sx={{
                backgroundColor: 'transparent',
                color: theme.palette.text.primary,
                border: `1px solid ${theme.palette.text.primary}`,
                '&:hover': {
                  backgroundColor: theme.palette.mode === 'dark' ? '#333' : '#f5f5f5',
                },
                flex: isMobile ? 1 : 'none',
              }}
            >
              ← Back
            </CustomButton>
       

           {currentStep === steps.length - 1 ? (
            <CustomButton
              onClick={handleComplete}
              sx={{
                backgroundColor: '#483594',
                '&:hover': {
                  backgroundColor: '#3d2a7a'
                },
                flex: isMobile ? 1 : 'none'
              }}
            >
              BACK TO CRYPTO
            </CustomButton>
            ) : (
              <CustomButton
              onClick={() => {
                if (currentStep === 1) {
                  if (transactionType === 'sell') {
                    proceedSellCrypto(); // ✅ SELL flow
                  } else {
                    proceedBuyCrypto();  // ✅ BUY flow
                  }
                } else {
                  handleNext();           // ✅ Normal next step
                }
              }}
                disabled={isContinueDisabled()}
              sx={{
                backgroundColor: '#483594',
                '&:hover': {
                  backgroundColor: '#3d2a7a'
                },
                '&:disabled': {
                  backgroundColor: theme.palette.action.disabledBackground,
                  color: theme.palette.action.disabled
                },
                flex: isMobile ? 1 : 'none'
              }}
            >
              {currentStep === 1 ? 'Confirm →' : 'Continue →'}
            </CustomButton>

            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ProceedPage;

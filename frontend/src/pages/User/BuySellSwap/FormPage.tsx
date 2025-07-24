
import { debounce } from 'lodash';
import api from '@/helpers/apiHelper';
import { jwtDecode } from 'jwt-decode';
import { useBuy } from '@/hooks/useBuy';
import { JwtPayload } from '@/types/jwt';
import { useSell } from '@/hooks/useSell';
import { useAppToast } from '@/utils/toast';
import { useAccount } from "@/hooks/useAccount";
import CommonTooltip from '@/components/common/toolTip';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import CustomButton from '../../../components/CustomButton';
import { fetchCoins, fetchCalculation } from '@/api/buy.api';
import CustomDropdown from '../../../components/CustomDropdown';
import CustomInputField from '../../../components/CustomInputField';
const url = import.meta.env.VITE_NODE_ENV === 'production' ? 'api' : 'api';
import {
  Box, Card, CardContent, Typography, useTheme, LinearProgress, useMediaQuery,
  Checkbox, FormControlLabel, CircularProgress
} from '@mui/material';
import CustomModal from '@/components/CustomModal';
import { KeyValueDisplay } from '@/components/KeyValueDisplay';

const FormPage = () => {
  const theme = useTheme();
  const { error, success } = useAppToast();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  // ✅ 1. States
  // Initialize activeTab from location state or default to 'buy'
  const [activeTab, setActiveTab] = useState(location.state?.type || 'buy');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('');
  const [coin, setCoin] = useState('');
  const [youSend, setYouSend] = useState('');
  const [youReceive, setYouReceive] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [chargesPaidBy, setChargesPaidBy] = useState('');
  const allowedCurrencies = ['USD', 'EUR', 'AUD', 'JPY'];
  const [cryptoFees, setCryptoFees] = useState(0);
  const [estimatedRate, setEstimatedRate] = useState('');
  const [exchangeFees, setExchangeFees] = useState(0);
  // Sell States
  const [sellCryptoFees, setSellCryptoFees] = useState('');
  const [sellPlatformFees, setSellPlatformFees] = useState('');
  const [sellAmountToGet, setSellAmountToGet] = useState('');
  const [sellExchangeFees, setSellExchangeFees] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  // Swap States
  const [youSendCoin, setYouSendCoin] = useState('');
  const [fromCoin, setFromCoin] = useState('');
  const [swapCoin, setSwapCoin] = useState('');
  const [sellCoinLoading, setSellCoinLoading] = useState(false);
  const [swapCoinOptions, setSwapCoinOptions] = useState<any[]>([]);
  const [swapRawCoins, setSwapRawCoins] = useState<any[]>([]);
  const [conversionData, setConversionData] = useState<any>(null);
  const [coinsAdded, setCoinsAdded] = useState<string>('');
  const [conversionRate, setConversionRate] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [swapAvailableData, setSwapAvailableData] = useState<any>(null);

  // Log activeTab changes for debugging
  useEffect(() => {
    // console.log('FormPage - Active Tab Changed:', activeTab);
    // console.log('FormPage - Current amount:', amount);
    // console.log('FormPage - Current youSend:', youSend);
    // console.log('FormPage - Current youReceive:', youReceive);
    // console.log('FormPage - Is confirmed:', isConfirmed);
  }, [activeTab, amount, youSend, youReceive, isConfirmed]);

  // to get user's buy data on page refresh
  useEffect(() => {
    if (activeTab === 'buy') {
      const savedData = localStorage.getItem("calculationData");
      if (savedData) {
        const parsed = JSON.parse(savedData);
        // console.log("✅ Loaded from localStorage:", parsed);

        setAmount(parsed.amount);
        setCurrency(parsed.currency);
        setCoin(parsed.coin);
        setYouReceive(parsed.numberofCoins);
        setCryptoFees(parsed.cryptoFees);
        setExchangeFees(parsed.exchangeFees);
        setEstimatedRate(parsed.rate);
      }
    }
  }, [activeTab]);

  // Update activeTab when location state changes
  useEffect(() => {
    const newActiveTab = location.state?.type || 'buy';
    if (newActiveTab !== activeTab) {
      setActiveTab(newActiveTab);
    }
  }, [location.state?.type]);

  const handleTabChange = (newValue: string) => {
    console.log('FormPage - Tab Change Triggered:', newValue);

    setActiveTab(newValue);
    setAmount('');
    setYouSend('');
    setYouReceive('');
    setIsConfirmed(false);
    setChargesPaidBy('OUR');

    // Navigate with the new tab state to update SecondSection
    navigate('/buysellswap', {
      state: {
        type: newValue,
        timestamp: Date.now()
      },
      replace: true
    });

    console.log('FormPage - Navigation triggered with state:', { type: newValue, timestamp: Date.now() });
  };

  // store sell response 
  useEffect(() => {
    if (activeTab === 'sell' && coin && currency && amount) {
      if (parseFloat(amount) > availableCoins) {
        error('You cannot sell more than what you have!');
        return;
      }

      calculateSellValues(coin, currency, amount).then(res => {
        // console.log('🔥 Auto Sell Calculation Response:', res);

        if (res?.amount) {
          setSellAmountToGet(res.amount);
          setSellCryptoFees(res.cryptoFees?.toString() || '');
          setSellExchangeFees(res.exchangeFees?.toString() || '');
          setSellPlatformFees(res.fees?.toString() || '');

          // ✅ Save to localStorage
          localStorage.setItem('sellCalculationData', JSON.stringify({
            amount: res.amount,
            cryptoFees: res.cryptoFees,
            exchangeFees: res.exchangeFees,
            platformFees: res.fees,
            coin,
            currency,
            youSell: amount,
            AvailableCoins: availableCoins,
          }));
        }
      });
    }
  }, [activeTab, coin, currency, amount]);

  // 3. Load from localStorage on refresh
  useEffect(() => {
    const saved = localStorage.getItem('sellCalculationData');
    if (saved) {
      const parsed = JSON.parse(saved);
      // console.log('📦 Restoring from localStorage:', parsed);

      if (parsed.AvailableCoins) {
        setAvailableCoins(parseFloat(parsed.AvailableCoins));
      }

      setCoin(parsed.coin || '');
      setCurrency(parsed.currency || '');
      setAmount(parsed.youSell || '');
      setSellAmountToGet(parsed.amount || '');
      setSellCryptoFees(parsed.cryptoFees?.toString() || '');
      setSellPlatformFees(parsed.fees?.toString() || '');
      setSellExchangeFees(parsed.exchangeFees?.toString() || '');
    }
  }, []);

  // Buy Functionality
  const { loadCoins, coins, loading } = useBuy();

  useEffect(() => {
    if (activeTab === 'buy') {
      loadCoins();
    }
  }, [activeTab]);

  const handleProceed = async () => {
    setIsLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    setIsLoading(false);
    navigate('/buysellswap/proceed', {
      state: {
        type: activeTab,
        amount: activeTab === 'swap' ? youSend : amount,
        currency: activeTab === 'swap' ? 'USD' : currency,
        coin: activeTab === 'swap' ? '' : coin,
        youReceive: activeTab === 'swap' ? youReceive : '1.002958728248335',
      },
    });
  };

  // currency dropdown 
  const currencyOptions = [
    { label: 'USD', value: 'USD' },
    { label: 'EUR', value: 'EUR' },
    { label: 'AUD', value: 'AUD' },
    { label: 'JPY', value: 'JPY' },
  ];

  const filteredCurrencyOptions = currencyOptions.filter(opt =>
    allowedCurrencies.includes(opt.value)
  );

  const coinOptions = [
    { label: 'Bitcoin (BTC)', value: 'BTC' },
    { label: 'Ethereum (ETH)', value: 'ETH' },
    { label: 'Solana (SOL)', value: 'SOL' },
    { label: 'Binance Coin (BNB)', value: 'BNB' },
  ];

  // currency list
  const accountIdData = jwtDecode<JwtPayload>(
    localStorage.getItem("token") as string
  );
  const { list } = useAccount(accountIdData?.data?.id);

  // ✅ 2. useEffect (for side-effects)
  useEffect(() => {
    if (
      coin &&
      amount &&
      currency &&
      allowedCurrencies.includes(currency.toUpperCase())
    ) {
      calculation(coin, currency, amount);
    }
  }, [amount, currency, coin]); // ✅ add coin

  // ✅ 3. Handlers
  const handleCoinChange = (e: any) => {
    const selectedCoin = e.target.value;
    setCoin(selectedCoin);

    if (
      amount &&
      currency &&
      allowedCurrencies.includes(currency.toUpperCase())
    ) {
      calculation(selectedCoin, currency, amount);
    }
  };

  // Buy Calculation
  const calculation = async (coin: string, currency: string, amount: string) => {
    try {
      const data = await fetchCalculation(coin, currency, amount, activeTab); // 'buy' or 'sell'

      if (data.status === 201) {
        const { rate, cryptoFees, exchangeFees, numberofCoins } = data.data;

        // console.log("💰 Rate:", rate);
        // console.log("💸 Crypto Fees:", cryptoFees);
        // console.log("🔢 Number of Coins:", numberofCoins);

        // Set state
        setYouReceive(numberofCoins);
        setCryptoFees(cryptoFees);
        setExchangeFees(exchangeFees);
        setEstimatedRate(rate);

        // Save to localStorage
        localStorage.setItem("calculationData", JSON.stringify({
          type: activeTab,
          coin,
          currency,
          amount,
          rate,
          cryptoFees,
          exchangeFees,
          numberofCoins
        }));
      } else {
        console.warn("⚠️ Unexpected response:", data);
      }

    } catch (error) {
      console.error("❌ Error in calculation:", error);
    }
  };

  const handleAmountChange = (e: any) => {
    setAmount(e.target.value);
  };

  const handleCurrencyChange = (e: any) => {
    setCurrency(e.target.value);
  };

  useEffect(() => {
    const swapDetailsRaw = localStorage.getItem("SwapDetails");

    if (swapDetailsRaw) {
      try {
        const swapDetails = JSON.parse(swapDetailsRaw);

        if (swapDetails?.fromCoin) setFromCoin(swapDetails.fromCoin);
        if (swapDetails?.toCoin) setSwapCoin(swapDetails.toCoin);
        if (swapDetails?.amount) setYouSend(swapDetails.amount.toString());

        if (swapDetails?.conversionResponse?.conversion?.coinsAdded) {
          setCoinsAdded(swapDetails.conversionResponse.conversion.coinsAdded);
        }

        if (swapDetails?.conversionResponse?.conversion?.rate) {
          setConversionRate(swapDetails.conversionResponse.conversion.rate);
        }

        // console.log("📥 Form pre-filled from localStorage ✅");
      } catch (error) {
        console.error("❌ Failed to parse SwapDetails from localStorage", error);
      }
    }
  }, []);

  const handleReset = () => {
    // ✅ Clear LocalStorage keys
    localStorage.removeItem("calculationData");
    localStorage.removeItem("sellCalculationData");
    localStorage.removeItem("sellAvailableData");
    localStorage.removeItem("SwapDetails");
    localStorage.removeItem("swapAvailableData");


    // ✅ Reset swap-related states
    setFromCoin("");           // 🔁 resets "You Send" dropdown
    setSwapCoin("");           // 🔁 resets "You Receive" dropdown
    setYouSend("");            // 🔁 resets amount input
    setCoinsAdded("");         // 🔁 resets converted amount
    setConversionRate(0);      // 🔁 resets rate
    setConversionData(null);   // optional
    setSwapAvailableData(null);

    // ✅ Reset common sell/buy states (already correct)
    setAmount('');
    setCurrency('');
    setCoin('');
    setYouReceive('');
    setCryptoFees(0);
    setExchangeFees(0);
    setEstimatedRate('');
    setSellAmountToGet('');
    setSellCryptoFees('');
    setSellPlatformFees('');
    setSellExchangeFees('');
    setAvailableCoins(0);
    setSellCoinLoading(false);
  };

  // Sell Backend Implementation
  const debouncedSwapCall = useRef(
    debounce((from, to, amt) => {
      if (from && to && amt > 0) {
        handleSwapCoinChange(from, to, amt);
      }
    }, 500) // 500ms delay
  ).current;

  useEffect(() => {
    const amount = parseFloat(youSend);

    if (fromCoin && swapCoin && amount > 0) {
      debouncedSwapCall(fromCoin, swapCoin, amount);
    }
  }, [fromCoin, swapCoin, youSend]);

  const {
    availableCoins: availableCoinsFromHook,
    sellCalculationData,
    calculateSellValues,
    sellLoading,
    sellCoins,
    loadSellCoinAmount,
    loadSellCoinsList,
  } = useSell();

  const [availableCoins, setAvailableCoins] = useState<number>(0);

  useEffect(() => {
    if (availableCoinsFromHook && availableCoinsFromHook > 0) {
      setAvailableCoins(availableCoinsFromHook);
    }
  }, [availableCoinsFromHook]);

  const {
    loading: buyLoading,
    coins: buyCoins,
    loadCoins: loadBuyCoins
  } = useBuy();

  useEffect(() => {
    if (activeTab === 'sell' || activeTab === 'swap') {
      loadBuyCoins();
    }
  }, [activeTab]);

  const handleSellCoinChange = async (
    selectedCoin: string,
    type: 'sell' | 'swap'
  ) => {
    if (type === 'sell') {
      setCoin(selectedCoin);
    } else if (type === 'swap') {
      setFromCoin(selectedCoin);
    }

    const amount = await loadSellCoinAmount(selectedCoin);
    // console.log(`✅ Coins available for ${type}:`, amount);

    // ✅ Update availableCoins immediately
    setAvailableCoins(amount || 0);

    const data = {
      coin: selectedCoin,
      currency,
      amount: amount?.toString() || '0',
    };

    localStorage.setItem(
      `${type}AvailableData`, // 'sellAvailableData' or 'swapAvailableData'
      JSON.stringify(data)
    );
  };

  const debouncedSellCalc = useRef(
    debounce(async (coin: string, currency: string, value: string) => {
      setSellCoinLoading(true);
      try {
        const res = await calculateSellValues(coin, currency, value);

        // ✅ Handle successful data (optional: set state here)
        console.log("✅ Valid response:", res);
      } catch (err: any) {
        console.error("❌ API error:", err);
        error(
          err?.response?.data?.message ||
          "This currency is not supported, choose another."
        );
      } finally {
        setSellCoinLoading(false);
      }
    }, 600)
  ).current;

  useEffect(() => {
    return () => {
      debouncedSellCalc.cancel();
    };
  }, []);

  const handleSellAmountChange = (value: string) => {
    setAmount(value);

    if (parseFloat(value) > availableCoins) {
      error('You cannot sell more than what you have!');
      return;
    }

    if (coin && currency && value) {
      debouncedSellCalc(coin, currency, value);
    }
  };

  // swap Implementation
  const handleYouSendCoinChange = (val: string) => {
    setYouSendCoin(val);
    console.log("Selected coin for sending:", val);
  };

  useEffect(() => {
    const fetchSwapCoins = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("🚫 No token found in local storage");
        return;
      }

      try {
        const response = await api.get(`/${url}/v1/crypto/fetchswapcoins`);

        const coinsArray = Array.isArray(response.data?.data) ? response.data.data : [];

        setSwapRawCoins(coinsArray); // ✅ Store as-is (no map here)

        if (coinsArray.length && !swapCoin) {
          setSwapCoin(coinsArray[0].coin); // Default selection
        }
      } catch (error) {
        console.error("❌ Error fetching swap coins:", error);
      }
    };

    if (activeTab === 'swap') {
      fetchSwapCoins();
    }
  }, [activeTab]);

  // fetch Swap calculation 
  const handleSwapCoinChange = async (
    from: string,
    to: string,
    amt: number
  ) => {

    if (!from || !to || isNaN(amt) || amt <= 0) {
      console.warn("Missing input data for conversion");
      return;
    }

    try {
      const response = await api.post(`/${url}/v1/crypto/convert-coin`, {
        fromCoin: from,
        toCoin: to,
        amount: amt,
      });

      const resData = response.data;

      if (resData?.conversion) {
        const { rate, coinsAdded, coinsDeducted } = resData.conversion;

        // ✅ Set rate to state
        setConversionRate(rate);
        setCoinsAdded(coinsAdded);  // make sure this is not missing
        // ✅ Clear error message if any previous error was there
        setErrorMessage("");
        // ✅ Save to localStorage
        localStorage.setItem("coinsAdded", coinsAdded);
        localStorage.setItem("coinsDeducted", coinsDeducted);
        localStorage.setItem("selectedFromCoin", from);
        localStorage.setItem("selectedToCoin", to);

        const swapDetails = {
          fromCoin: from,
          toCoin: to,
          amount: amt,
          conversionResponse: resData,
        };

        localStorage.setItem("SwapDetails", JSON.stringify(swapDetails));
        setConversionData(resData);
      }
      else {
        console.error("❌ Conversion data missing in response");
      }
      setConversionData(resData);
    } catch (error: any) {
      console.error("❌ Error fetching conversion rate:", error);
      setCoinsAdded("0");
      if (error?.response?.status === 429) {
        setErrorMessage("⚠️ You've exceeded the Rate Limit. Please try again later or refresh the page.");
      } else {
        setErrorMessage("⚠️ Something went wrong. Please refresh and try again.");
      }
    }
  };

  const isFormValid = () => {
    if (activeTab === 'swap') {
      const isValidSwap =
        fromCoin &&
        swapCoin &&
        youSend &&
        parseFloat(youSend) > 0 &&
        coinsAdded &&
        isConfirmed;

      return isValidSwap;
    } else {
      // For Buy/Sell tabs
      const isValidAmount = amount && parseFloat(amount) > 0;
      // console.log('💰 Buy/Sell Validation:', { amount, isValidAmount });
      return isValidAmount;
    }
  };
  // Final Api Call for Swap 
  const handleSwap = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        console.error("🚫 No token found. Please login.");
        return;
      }

      // ✅ Decode JWT to get userId
      const payload = JSON.parse(atob(token.split(".")[1]));
      const userId = payload?.data?.id;

      if (!userId) {
        console.error("🚫 User ID not found in token.");
        return;
      }

      // ✅ Get values from localStorage
      const fromCoin = localStorage.getItem("selectedFromCoin");
      const toCoin = localStorage.getItem("selectedToCoin");
      const coinsDeducted = localStorage.getItem("coinsDeducted");
      const coinsAdded = localStorage.getItem("coinsAdded");

      if (!fromCoin || !toCoin || !coinsDeducted || !coinsAdded) {
        console.error("🚫 Missing required swap values.");
        return;
      }

      const payloadData = {
        userId,
        fromCoin,
        toCoin,
        coinsDeducted,
        coinsAdded,
      };

      // console.log("📤 Swap API Payload:", payloadData);

      const response = await api.post(
        `/${url}/v1/crypto/updateswap`,
        payloadData,
      );

      // console.log("✅ Swap Response:", response.data);

      if (response.status === 200) {

        // ✅ Clear only swap-related keys
        localStorage.removeItem("coinsAdded");
        localStorage.removeItem("coinsDeducted");
        localStorage.removeItem("selectedFromCoin");
        localStorage.removeItem("selectedToCoin");
        localStorage.removeItem("SwapDetails");

        navigate("/wallet");
        setTimeout(() => {
          success("Coins Swapped Successfully 🎉");
        }, 100);

      } else {
        console.warn("⚠️ Swap response status not 201:", response.status);
      }
    } catch (error) {
      console.error("❌ Error during swap:", error);
    }
  };

  const filteredSwapCoins = swapRawCoins.filter((coin) => coin.coin !== fromCoin);
  return (
    <>
      <Box className="crypto-form-container">

        {/* Tab Buttons */}
        <Box className="crypto-tab-buttons">
          <CommonTooltip title="Buy popular cryptocurrencies quickly and securely using your wallet balance or payment methods.">
            <span>
              <CustomButton
                className={`crypto-tab-button ${activeTab === 'buy' ? 'active' : ''}`}
                onClick={() => handleTabChange('buy')}
                sx={{
                  backgroundColor: activeTab === 'buy' ? '#483594' : 'transparent',
                  color: activeTab === 'buy' ? 'white' : theme.palette.text.primary,
                  border: activeTab === 'buy' ? 'none' : `1px solid ${theme.palette.divider}`,
                  '&:hover': {
                    backgroundColor: activeTab === 'buy' ? '#3d2a7a' : theme.palette.action.hover
                  }
                }}
              >
                Crypto Buy
              </CustomButton>
            </span>
          </CommonTooltip>

          <CommonTooltip title="Convert your crypto into fiat instantly and withdraw to your bank or wallet with ease.">
            <span>
              <CustomButton
                className={`crypto-tab-button ${activeTab === 'sell' ? 'active' : ''}`}
                onClick={() => handleTabChange('sell')}
                sx={{
                  backgroundColor: activeTab === 'sell' ? '#483594' : 'transparent',
                  color: activeTab === 'sell' ? 'white' : theme.palette.text.primary,
                  border: activeTab === 'sell' ? 'none' : `1px solid ${theme.palette.divider}`,
                  '&:hover': {
                    backgroundColor: activeTab === 'sell' ? '#3d2a7a' : theme.palette.action.hover
                  }
                }}
              >
                Crypto Sell
              </CustomButton>
            </span>
          </CommonTooltip>

          <CommonTooltip title="Easily exchange one cryptocurrency for another at real-time rates without needing to sell or withdraw.">
            <span>
              <CustomButton
                className={`crypto-tab-button ${activeTab === 'swap' ? 'active' : ''}`}
                onClick={() => handleTabChange('swap')}
                sx={{
                  backgroundColor: activeTab === 'swap' ? '#483594' : 'transparent',
                  color: activeTab === 'swap' ? 'white' : theme.palette.text.primary,
                  border: activeTab === 'swap' ? 'none' : `1px solid ${theme.palette.divider}`,
                  '&:hover': {
                    backgroundColor: activeTab === 'swap' ? '#3d2a7a' : theme.palette.action.hover
                  }
                }}
              >
                Crypto Swap
              </CustomButton>
            </span>
          </CommonTooltip>
        </Box>
        <div className="crypto-reset-container">
          <CustomButton className="crypto-reset-button" onClick={handleReset}>
            Reset
          </CustomButton>
        </div>

        {/* Form Content */}
        <Card
          className="crypto-form-card"
          sx={{ backgroundColor: theme.palette.background.default }}
        >
          <CardContent className="crypto-form-content">
            {activeTab === 'buy' && (
              <>
                {/* Amount Section */}
                <Box
                  className="crypto-form-section"
                >
                  <Box className="inr-warning-box">
                    <Typography variant="body2" className="inr-warning-text">
                      <strong>Note:</strong> Buying in <strong>INR</strong> is currently <strong>not supported</strong>.
                    </Typography>
                  </Box>

                  <Box className="crypto-form-row">
                    <Box className="crypto-form-field">
                      <Typography variant="subtitle2" className="crypto-form-label" sx={{ color: theme.palette.text.primary }}>
                        YOU PAY
                      </Typography>
                      <CustomInputField
                        type="number"
                        value={amount}
                        onChange={(e) => {
                          const newAmount = e.target.value;
                          console.log('Amount changed to:', newAmount);
                          setAmount(newAmount);
                        }}
                        placeholder="0"
                        className="crypto-amount-input"
                      />
                      <Typography variant="caption" className="crypto-fees-text">
                        Crypto Fees: ${cryptoFees.toFixed(2)}
                      </Typography>
                    </Box>

                    <Box className="crypto-form-field">
                      <Typography
                        variant="subtitle2"
                        className="crypto-form-label"
                        sx={{ color: theme.palette.text.primary }}
                      >
                        CURRENCY
                      </Typography>

                      <CustomDropdown
                        label=""
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value as string)}
                        disabled={!amount}
                        options={
                          list
                            ?.filter((item: any) => item.currency !== 'INR')
                            .map((item: any, index: number) => ({
                              label: (
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                  <img
                                    src={`https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.4.3/flags/1x1/${item.currency
                                      .slice(0, 2)
                                      .toLowerCase()}.svg`}
                                    alt={item.currency}
                                    style={{ width: 24, height: 24, borderRadius: "50%" }}
                                  />
                                  {item.currency}
                                </Box>
                              ),
                              value: item.currency,
                            })) || []
                        }
                      />

                      <Typography variant="caption" className="crypto-rate-text">
                        Estimated Rate: {estimatedRate}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Conversion Arrow */}
                  <Box className="crypto-conversion-arrow">
                    <Box
                      className="crypto-arrow-icon"
                      sx={{ backgroundColor: '#483594' }}
                    >
                      ↓
                    </Box>
                  </Box>

                  {/* You Get Section */}
                  <Box className="crypto-form-row">
                    <Box className="crypto-form-field">
                      <Typography variant="subtitle2" className="crypto-form-label" sx={{ color: theme.palette.text.primary }}>
                        YOU GET
                      </Typography>
                      <Box className="crypto-result-display">
                        {youReceive || '—'}
                      </Box>
                    </Box>

                    <Box className="crypto-form-field">
                      <Typography variant="subtitle2" className="crypto-form-label" sx={{ color: theme.palette.text.primary }}>
                        COIN
                      </Typography>
                      <CustomDropdown
                        label=""
                        value={coin}
                        onChange={(e) => setCoin(e.target.value as string)}
                        disabled={!currency}
                        // @ts-ignore
                        options={coins.map(c => ({
                          label: (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <img
                                src={`https://assets.coincap.io/assets/icons/${c.coin.split('_')[0].toLowerCase()}@2x.png`}
                                alt={c.coin}
                                style={{ width: 24, height: 24, marginRight: 8 }}
                              />
                              {`${c.coin}`}
                            </Box>
                          ),
                          value: c.coin
                        }))}
                        sx={{ minWidth: 120, maxWidth: 180 }} // adjust as needed
                      />
                    </Box>
                  </Box>
                </Box>
              </>
            )}
            {activeTab === 'sell' && (
              <>
                {/* Amount Section */}

                <Box className="crypto-form-section">
                  <Box className="crypto-form-row">
                    <Box className="crypto-form-field">
                      <Typography variant="subtitle2" className="crypto-form-label" sx={{ color: theme.palette.text.primary }}>
                        COIN
                      </Typography>
                      <CustomDropdown
                        label=""
                        value={coin}
                        onChange={(e) => handleSellCoinChange(e.target.value as string, 'sell')}

                        // @ts-ignore
                        options={buyCoins.map((c) => ({
                          label: (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <img
                                src={`https://assets.coincap.io/assets/icons/${c.coin.split('_')[0].toLowerCase()}@2x.png`}
                                alt={c.coin}
                                style={{ width: 24, height: 24, marginRight: 8 }}
                              />
                              {`${c.coin}`}
                            </Box>
                          ),
                          value: c.coin
                        }))}
                        sx={{ minWidth: 120, maxWidth: 180 }}
                      />
                      <Typography variant="caption" className="crypto-fees-text">
                        You have: {availableCoins || 0} {coin || ''}
                      </Typography>
                    </Box>

                    <Box className="crypto-form-field">
                      <Typography
                        variant="subtitle2"
                        className="crypto-form-label"
                        sx={{ color: theme.palette.text.primary }}
                      >
                        CURRENCY
                      </Typography>

                      <CustomDropdown
                        label=""
                        value={currency}
                        disabled={!coin}
                        onChange={(e) => setCurrency(e.target.value as string)}
                        options={
                          list
                            ?.filter((item: any) => item.currency !== 'GBP' && item.currency !== 'EUR') // 👈 Exclude here
                            .map((item: any) => ({
                              label: (
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                  <img
                                    src={`https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.4.3/flags/1x1/${item.currency
                                      .slice(0, 2)
                                      .toLowerCase()}.svg`}
                                    alt={item.currency}
                                    style={{ width: 24, height: 24, borderRadius: "50%" }}
                                  />
                                  {item.currency}
                                </Box>
                              ),
                              value: item.currency,
                            })) || []
                        }
                      />
                      {sellLoading ? (
                        <CircularProgress size={16} />
                      ) : (
                        <>
                          <Typography variant="caption" className="crypto-rate-text">
                            Exchange Rate: {sellExchangeFees ? `${sellExchangeFees} ${currency}` : '--'}
                          </Typography>
                          <Typography variant="caption" className="crypto-fees-text">
                            Crypto Fees: {sellCryptoFees ? `${sellCryptoFees} ${currency}` : '--'}
                          </Typography>
                          {/* <Typography variant="caption" className="crypto-fees-text">
                            Platform Exchange Fees: {sellPlatformFees ? `${sellPlatformFees} ${currency}` : '--'}
                          </Typography> */}
                        </>
                      )}
                    </Box>
                  </Box>

                  {/* Conversion Arrow */}
                  <Box className="crypto-conversion-arrow">
                    <Box
                      className="crypto-arrow-icon"
                      sx={{ backgroundColor: '#483594' }}
                    >
                      ↓
                    </Box>
                  </Box>

                  {/* You Get Section */}
                  <Box className="crypto-form-row">
                    <Box className="crypto-form-field">
                      <Typography variant="subtitle2" className="crypto-form-label" sx={{ color: theme.palette.text.primary }}>
                        YOU SELL
                      </Typography>
                      <CustomInputField
                        type="number"
                        value={amount}
                        disabled={!currency}
                        onChange={(e) => handleSellAmountChange(e.target.value)}
                        placeholder="0"
                        className="crypto-amount-input"
                      />
                    </Box>
                    <Box className="crypto-form-field">
                      <Typography variant="subtitle2" className="crypto-form-label" sx={{ color: theme.palette.text.primary }}>
                        YOU GET
                      </Typography>
                      <Box className="crypto-result-display">
                        {activeTab === 'sell' && sellAmountToGet ? `${sellAmountToGet}` : '--'}
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </>
            )}
            {activeTab === 'swap' && (
              <>
                <Box className="swap-note-box">
                  <Typography variant="body2" className="swap-note-text">
                    <strong>Note:</strong> Please make sure that you have already generated wallets for the coins you want to swap.
                    Swapping with <strong>USDT</strong> is currently <strong>not supported</strong>.
                  </Typography>
                </Box>

                <Box
                  className="crypto-swap-container"
                >
                  <Box className="crypto-swap-field">
                    <Typography variant="subtitle1" className="crypto-swap-label" sx={{ color: theme.palette.text.primary }}>
                      You Send
                    </Typography>
                    <Box className="crypto-swap-input-group">
                      <CustomDropdown
                        label=""
                        value={fromCoin}
                        onChange={(e) => handleSellCoinChange(e.target.value as string, 'swap')}

                        // @ts-ignore
                        options={buyCoins.map((c) => ({
                          label: (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <img
                                src={`https://assets.coincap.io/assets/icons/${c.coin.split('_')[0].toLowerCase()}@2x.png`}
                                alt={c.coin}
                                style={{ width: 24, height: 24, marginRight: 8 }}
                              />
                              {`${c.coin}`}
                            </Box>
                          ),
                          value: c.coin
                        }))}
                        sx={{ minWidth: 120, maxWidth: 180 }}
                      />
                      <CustomInputField
                        type="number"
                        value={youSend}
                        disabled={!fromCoin}
                        onChange={(e) => {
                          const newValue = e.target.value;
                          const numericValue = parseFloat(newValue);

                          const stored = localStorage.getItem('swapAvailableData');
                          const available = stored ? parseFloat(JSON.parse(stored).amount) : 0;

                          if (!isNaN(numericValue) && numericValue > available) {
                            error('You cannot send more than what you have!');
                            return;
                          }

                          console.log('YouSend changed to:', newValue);
                          setYouSend(newValue);

                          // ✅ Trigger re-calculation on every valid change
                          if (fromCoin && swapCoin && numericValue > 0) {
                            debouncedSwapCall(fromCoin, swapCoin, numericValue);
                          }
                        }}
                        placeholder="0"
                      />
                    </Box>
                    <Typography variant="caption" className="crypto-fees-text">
                      You have: {availableCoins || 0} Coins
                    </Typography>
                  </Box>

                  <Box className="crypto-swap-arrow-container">
                    <Box
                      className="crypto-swap-arrow"
                      sx={{ backgroundColor: '#483594' }}
                    >
                      ⇄
                    </Box>
                  </Box>

                  <Box className="crypto-swap-field">
                    <Typography variant="subtitle1" className="crypto-swap-label" sx={{ color: theme.palette.text.primary }}>
                      You Receive
                    </Typography>
                    <Box className="crypto-swap-input-group">
                      <CustomDropdown
                        label=""
                        disabled={!youSend}
                        value={swapCoin}
                        onChange={(e) => {
                          const selected = e.target.value as string;
                          setSwapCoin(selected);
                          handleSwapCoinChange(fromCoin, selected, parseFloat(youSend));
                        }}
                        // @ts-ignore
                        options={filteredSwapCoins.map((c) => ({
                          label: (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <img
                                src={`https://assets.coincap.io/assets/icons/${c.coin.split('_')[0].toLowerCase()}@2x.png`}
                                alt={c.coin}
                                style={{ width: 24, height: 24, marginRight: 8 }}
                              />
                              {`${c.coin}`}
                            </Box>
                          ),
                          value: c.coin
                        }))}
                        sx={{ minWidth: 120, maxWidth: 180 }}
                      />
                      <CustomInputField
                        type="number"
                        value={coinsAdded}
                        disabled
                        onChange={(e) => {
                          const newValue = e.target.value;
                          console.log('CoinsAdded changed to:', newValue);
                          setCoinsAdded(newValue); // ✅ This updates the correct state
                        }}
                        placeholder="0.00"
                        className="crypto-swap-input"
                      />

                    </Box>
                    <Typography variant="caption" className="crypto-fees-text">
                      {errorMessage ? (
                        <span style={{ color: "red" }}>{errorMessage}</span>
                      ) : (
                        `${fromCoin} → ${swapCoin} Rate: ${conversionRate !== null ? conversionRate.toFixed(8) : "—"}`
                      )}
                    </Typography>

                  </Box>
                </Box>


                {/* Confirmation checkbox for swap */}
                <Box className="crypto-form-field" >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isConfirmed}
                        onChange={(e) => {
                          console.log('Checkbox changed to:', e.target.checked);
                          setIsConfirmed(e.target.checked);
                        }}
                        disabled={Boolean(errorMessage)}
                        sx={{
                          color: theme.palette.text.secondary,
                          '&.Mui-checked': {
                            color: '#483594',
                          },
                        }}
                      />
                    }
                    label={
                      <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>
                        I confirm the above swap details are correct
                      </Typography>
                    }
                  />
                </Box>
              </>
            )}

            {/* Loading Progress */}
            {isLoading && (
              <Box className="crypto-loading-container">
                <LinearProgress
                  className="crypto-loading-progress"
                  sx={{
                    backgroundColor: theme.palette.mode === 'dark' ? '#444' : '#e0e0e0',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: '#483594'
                    }
                  }}
                />
                <Typography variant="body2" className="crypto-loading-text" sx={{ color: theme.palette.text.secondary }}>
                  Processing your request...
                </Typography>
              </Box>
            )}

            {/* Proceed Button */}
            <Box className="crypto-proceed-container">
              <CustomButton
                fullWidth
                onClick={() => {
                  if (activeTab === 'swap') {
                    setShowPreview(true)
                  } else {
                    handleProceed();
                  }
                }}
                disabled={!isFormValid() || isLoading || (activeTab === 'swap' && !isConfirmed)}
                loading={isLoading}
                className="crypto-proceed-button"
                sx={{
                  backgroundColor: '#483594',
                  padding: '16px',
                  fontSize: isMobile ? '14px' : '16px',
                  fontWeight: 'bold',
                  '&:hover': {
                    backgroundColor: '#3d2a7a',
                  },
                  '&:disabled': {
                    backgroundColor: theme.palette.action.disabledBackground,
                    color: theme.palette.action.disabled
                  }
                }}
              >
                Proceed →
              </CustomButton>
            </Box>
          </CardContent>
        </Card>
      </Box>
      <CustomModal
        open={showPreview}
        onClose={() => setShowPreview(false)}
        sx={{ backgroundColor: theme.palette.background.default }}
        title=""
      >
        <Typography className="section-title">Preview Swap Details</Typography>
        <Box sx={{ mt: 2, mb: 2 }}>
          <KeyValueDisplay
            data={{
              'From Coin': fromCoin || '-',
              'To Coin': swapCoin || '-',
              'Amount to Swap': youSend || '-',
              'Coins to Receive': coinsAdded || '-',
              'Swap Rate': conversionRate ? (+conversionRate).toFixed(8) : '--',
              'Note': errorMessage || 'All details calculated successfully'
            }}
          />
        </Box>
        <Box display="flex" justifyContent="flex-end" gap={2}>
          <CustomButton onClick={() => setShowPreview(false)}>Edit</CustomButton>
          <CustomButton
            onClick={async () => {
              setShowPreview(false);
              // You may want to setIsLoading(true) here for better UX
              await handleSwap(); // This should execute swap & navigate to /wallet as before
            }}
            disabled={Boolean(errorMessage)}
          >
            Confirm & Swap
          </CustomButton>
        </Box>
      </CustomModal>


    </>
  );
};

export default FormPage;

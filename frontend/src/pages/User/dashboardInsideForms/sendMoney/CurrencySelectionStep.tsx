import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  IconButton,
  Paper,
  Divider,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  useTheme,
  Radio,
  FormControlLabel,
  RadioGroup,
} from '@mui/material';
import {
  ArrowUpDown,
  RefreshCw,
  Building2,
  Clock,
  Receipt,
} from 'lucide-react';
import CustomButton from '@/components/CustomButton';
import Flag from 'react-world-flags';
import CommonTooltip from '@/components/common/toolTip';
import api from '@/helpers/apiHelper';
import { useAppToast } from '@/utils/toast';
import getSymbolFromCurrency from 'currency-symbol-map';
import { useFee } from '@/hooks/useFee';
import { useAccount } from '@/hooks/useAccount';
import { useCurrency } from '@/hooks/useCurrency';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

const url = import.meta.env.VITE_NODE_ENV == "production" ? 'api' : 'api';

interface Beneficiary {
  id: string;
  name: string;
  accountNumber: string;
  country: string;
  currency: string;
}

interface CurrencySelectionStepProps {
  formData: any;
  updateFormData: (data: any) => void;
  onNext: () => void;
  onPrevious: () => void;
  selectedBeneficiary?: Beneficiary | null;
}

const CurrencySelectionStep: React.FC<CurrencySelectionStepProps> = ({
  formData,
  updateFormData,
  onNext,
  onPrevious,
  selectedBeneficiary
}) => {
  const theme = useTheme();
  const toast = useAppToast();
  const { currencyList } = useCurrency();
  const navigate = useNavigate();

  // Get user ID from JWT token
  const getUserId = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const decoded: any = jwtDecode(token);
      return decoded?.data?.id;
    } catch {
      return null;
    }
  };

  const userId = getUserId();
  const { list: accountList } = useAccount(userId);

  const { feeCommision } = useFee("Debit");
  const [sendCurrencyCountry, setSendCurrencyCountry] = useState('');
  const [sendCurrency, setSendCurrency] = useState<any>('');
  const [toCurrency, setToCurrency] = useState<any>('');
  const [toCurrencyCountry, setToCurrencyCountry] = useState<any>('');
  const [Rate, setRate] = useState<any>(0);
  const [ExchangeError, setExchangeError] = useState<any>('');
  const [convertedValue, setConvertedValue] = useState<any>(0);
  const [sendSideVal, setSendSideVal] = useState('');
  const [sendCurrAccountId, setSendCurrAccountId] = useState('');
  const [recieveCurrency, setRecieveCurrency] = useState('');
  const [currentBalance, setCurrentBalance] = useState<any>(null);
  const [fromAmount, setFromAmount] = useState<any>('');
  const [feeCharge, setFeeCharge] = useState<any>(0);
  const [selectedCurrencyCode, setSelectedCurrencyCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Add after other localStorage gets, near the top of the component
  const selectedRecipientCurrency = localStorage.getItem('selectedCurrency');

  // Initialize with form data and beneficiary currency
  useEffect(() => {
    // Try to get selected wallet/account from localStorage (set by dashboard)
    const activeCurrId = localStorage.getItem('activeCurr');
    const activeCurrency = localStorage.getItem('currency');
    const activeCountry = localStorage.getItem('country');
    // If we have a selected account from dashboard, use it as default
    if (accountList.length > 0 && activeCurrId && activeCurrency) {
      const selectedAccount = accountList.find(account => account._id === activeCurrId);
      if (selectedAccount) {
        const defaultValue = `${selectedAccount.currency}-${selectedAccount._id}-${selectedAccount.country}`;
        HandleSendCurrency(defaultValue);
      } else {
        // fallback to previous logic
        const defaultAccount = accountList.find(account => Boolean(account.defaultAccount));
        if (defaultAccount) {
          const defaultValue = `${defaultAccount.currency}-${defaultAccount._id}-${defaultAccount.country}`;
          HandleSendCurrency(defaultValue);
        }
      }
    } else if (accountList.length > 0) {
      // fallback to previous logic
      const defaultAccount = accountList.find(account => Boolean(account.defaultAccount));
      if (defaultAccount) {
        const defaultValue = `${defaultAccount.currency}-${defaultAccount._id}-${defaultAccount.country}`;
        HandleSendCurrency(defaultValue);
      }
    }

    // Auto-select recipient currency based on beneficiary
    if (formData?.sendCurrencyData) {
      HandleToCurrency(formData?.sendCurrencyData);
    }
  }, [accountList, formData.sendCurrencyData, selectedBeneficiary, currencyList]);

  const HandleSendCurrency = (val: any) => {
    console.log('val', val)
    if (!val) return;

    var valChn = val.split('-');

    if (valChn.length >= 3) {
      setSendSideVal(valChn[1]);
      setSendCurrAccountId(valChn[1]);
      setSendCurrency(val);
      setSelectedCurrencyCode(valChn[0]); // Store just the currency code
      setRecieveCurrency('');
      setFeeCharge(0);
      setSendCurrencyCountry(valChn[2]);
      setFromAmount(''); // Reset amount when currency changes
      setConvertedValue(0); // Reset converted value
      ValidateSendAmountToCurrentAccountBalance(valChn[1]);
    }
  }

  const ValidateSendAmountToCurrentAccountBalance = async (itemValue: any) => {
    if (!itemValue) return;

    try {
      const result = await api.get(`/${url}/v1/account/accountbyid/${itemValue}`);
      if (result.data.status == 201) {
        const balance = result?.data?.data?.amount || 0;
        setCurrentBalance(balance);
      } else {
        // Fallback to accountList balance
        const fallbackBalance = getSelectedAccountBalance();
        setCurrentBalance(fallbackBalance);
      }
    } catch (error) {
      // Fallback to accountList balance
      const fallbackBalance = getSelectedAccountBalance();
      setCurrentBalance(fallbackBalance);
    }
  }

  const [fromCurrency, setFromCurrency] = useState(
    formData.fromCurrency || 'USD'
  );
  const [sendAmount, setSendAmount] = useState(formData.sendAmount || '1000');
  const [receiveAmount, setReceiveAmount] = useState(formData.receiveAmount || '1250.00');
  const [isEditingSend, setIsEditingSend] = useState(true);
  const [chargesPaidBy, setChargesPaidBy] = useState('OUR');

  const exchangeRate =
    fromCurrency === 'USD' && toCurrency === 'CAD' ? 1.25 : 1.25;
  const fee = 550.62;

  // Set initial currencies from beneficiary when component mounts
  useEffect(() => {
    if (sendAmount && isEditingSend) {
      const converted = (parseFloat(sendAmount) * exchangeRate).toFixed(2);
      setReceiveAmount(converted);
    } else if (receiveAmount && !isEditingSend) {
      const converted = (parseFloat(receiveAmount) / exchangeRate).toFixed(2);
      setSendAmount(converted);
    }
  }, [sendAmount, receiveAmount, isEditingSend, exchangeRate]);

  const HandleFromAmount = (value: any) => {
    setFromAmount(value);
  }

  const handleReceiveAmountChange = (value: string) => {
    setReceiveAmount(value);
    setIsEditingSend(false);
  };

  const handleSwapCurrencies = () => {
    const tempCurrency = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(tempCurrency);

    const tempAmount = sendAmount;
    setSendAmount(receiveAmount);
    setReceiveAmount(tempAmount);
    setIsEditingSend(!isEditingSend);
  };

  const handleContinue = () => {
    if (sendCurrencyCountry && sendCurrency && toCurrency && fromAmount && toCurrencyCountry && convertedValue) {
      updateFormData({
        fromCurrency,
        toCurrency,
        sendAmount,
        receiveAmount,
        receivingOption: 'bank_account',
        sendCurrencyCountry,
        sendCurrency,
        fromAmount,
        toCurrencyCountry,
        convertedValue,
        feeCharge,
        exchangeRate: Rate,
        netAmount: convertedValue
      });
      onNext();
    }
  };

  const HandleToCurrency = (val: any) => {
    if (!val) return;

    var valChn = val.split('-');
    if (valChn.length >= 3) {
      setToCurrency(val);
      setToCurrencyCountry(valChn[2]);
    }
  }

  useEffect(() => {
    // Only calculate if we have a valid balance loaded
    if (parseFloat(currentBalance) > 0 || parseFloat(currentBalance) === 0) {
      calCulateExChangeCurrencyValue();
    }
  }, [sendCurrency, toCurrency, fromAmount, currentBalance]);

  const calCulateExChangeCurrencyValue = async () => {
    // Don't proceed if balance is still loading (currentBalance is null/undefined)
    if (currentBalance === null || currentBalance === undefined) {
      return;
    }

    if (sendCurrency && toCurrency && fromAmount && parseFloat(fromAmount) > 0) {
      setIsLoading(true);

      var sendCurrencySplit = sendCurrency.split('-');
      var toCurrencySplit = toCurrency.split('-');
      const sendCurrencyCode = sendCurrencySplit[0];
      const toCurrencyCode = toCurrencySplit[0];
      var valCharge = 0;

      // Calculate fees based on commission type
      if (feeCommision?.commissionType == "percentage") {
        valCharge = parseFloat(fromAmount) * feeCommision?.value / 100;
        if (valCharge < feeCommision.minimumValue) {
          setFeeCharge(feeCommision.minimumValue);
          valCharge = feeCommision.minimumValue;
        } else {
          setFeeCharge(valCharge);
        }
      } else {
        valCharge = feeCommision?.value || 0;
        setFeeCharge(valCharge);
      }

      // Validate balance after fee calculation
      const totalRequired = parseFloat(fromAmount) + valCharge;
      const numCurrentBalance = parseFloat(currentBalance) || 0;

      if (totalRequired > numCurrentBalance) {
        toast.error("Insufficient balance. Total required (amount + fees) exceeds available balance.");
        setFromAmount('');
        setConvertedValue(0);
        setIsLoading(false);
        return;
      }

      // Use real-time exchange rate API
      const options = {
        method: 'GET',
        url: 'https://currency-converter18.p.rapidapi.com/api/v1/convert',
        params: {
          from: sendCurrencyCode,
          to: toCurrencyCode,
          amount: 1
        },
        headers: {
          'X-RapidAPI-Key': import.meta.env.VITE_RAPID_API_KEY,
          'X-RapidAPI-Host': import.meta.env.VITE_RAPID_API_HOST
        }
      };

      try {
        const response = await axios.request(options);
        if (response.data.success) {
          const realTimeRate = response.data.result.convertedAmount;
          const convertedAmount = realTimeRate * parseFloat(fromAmount);
          setConvertedValue(convertedAmount);
          setRate(parseFloat(realTimeRate).toFixed(4)); // More precise rate display
          setExchangeError(''); // Clear any previous errors
        } else {
          setExchangeError(response.data.validationMessage[0]);
          setConvertedValue(0);
          setRate(0);
        }
      } catch (error) {
        console.error('Exchange rate API error:', error);
        setExchangeError('Failed to fetch real-time exchange rate');
        setConvertedValue(0);
        setRate(0);
      } finally {
        setIsLoading(false);
      }
    } else {
      setConvertedValue(0);
      setRate(0);
    }
  }

  // Filter accounts with non-zero balance for sending
  const sendableAccounts = accountList; // Show all wallets, not just those with positive balance

  // Get currency symbol for display
  const getCurrencySymbol = (currencyCode: string) => {
    return getSymbolFromCurrency(currencyCode) || currencyCode;
  };

  // Format balance for display with proper formatting
  const formatBalance = (balance: any) => {
    const numBalance = typeof balance === 'string' ? parseFloat(balance) || 0 : Number(balance) || 0;
    if (numBalance === 0) return '0.00';

    // Format with commas for thousands
    const formatted = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numBalance);

    return formatted;
  };

  // Format amount for display
  const formatAmount = (amount: any) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) || 0 : Number(amount) || 0;
    if (numAmount === 0) return '0.00';

    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numAmount);
  };

  // Get selected account balance from accountList
  const getSelectedAccountBalance = () => {
    if (!selectedCurrencyCode) return 0;
    const selectedAccount = accountList.find(account => account.currency === selectedCurrencyCode);
    return selectedAccount ? parseFloat(selectedAccount.amount) || 0 : 0;
  };

  // Payment method dynamic display
  const paymentMethodMap: Record<string, { label: string; time: string; fee: number }> = {
    sepa: { label: 'SEPA Transfer', time: '1-2 business days', fee: 3.50 },
    swift: { label: 'SWIFT Wire', time: '1-5 business days', fee: 15.00 },
    ach: { label: 'ACH Transfer', time: '1-3 business days', fee: 2.00 },
    bank: { label: 'Bank transfer', time: '1-3 business days', fee: 5.00 },
  };
  const selectedPaymentMethod = formData.transferMethod || 'bank';
  const paymentMethodLabel = paymentMethodMap[selectedPaymentMethod]?.label || 'Bank transfer';
  const paymentMethodTime = paymentMethodMap[selectedPaymentMethod]?.time || '1-3 business days';
  const paymentMethodFee = paymentMethodMap[selectedPaymentMethod]?.fee || 5.00;

  // Show recommended transfer method info if available
  const recommendedMethod = formData.transferMethodDetails;

  // Dynamic arrival date calculation
  function getArrivalDateLabel() {
    const today = new Date();
    let daysToAdd = 2; // default
    if (selectedPaymentMethod === 'sepa') daysToAdd = 2;
    else if (selectedPaymentMethod === 'swift') daysToAdd = 5;
    else if (selectedPaymentMethod === 'ach') daysToAdd = 3;
    else daysToAdd = 3;
    const arrival = new Date(today.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
    return arrival.toLocaleDateString(undefined, { weekday: 'long' });
  }

  // Charges paid by handler
  const handleChargesPaidByChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChargesPaidBy(e.target.value);
    updateFormData({ chargesPaidBy: e.target.value });
  };

  // Payment method change handler
  const handleChangePaymentMethod = () => {
    // Go to transfer method step (step 2)
    onPrevious(); // Go back to previous step (CurrencySelectionStep is step 1, TransferMethodStep is step 2)
  };

  return (
    <Box className="currency-selection-step">
      <Typography variant="h6" className="step-title" sx={{ mb: 2 }}>
        Enter Transfer Details
      </Typography>

      {selectedBeneficiary && (
        <Box sx={{ mb: 3, p: 2, borderRadius: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Sending to: <strong>{selectedBeneficiary.name}</strong> in{' '}
            <strong>{selectedBeneficiary.country}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Account: {selectedBeneficiary.accountNumber}
          </Typography>
        </Box>
      )}

      {/* Main Transfer Card */}
      <Box sx={{ p: 2, mb: 3, borderRadius: 2 }} className="currency-details">
        {/* Guaranteed Section */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            mb: 3,
            p: 1,
            borderRadius: 1,
          }}
        >
          <Box sx={{ mr: 1, fontSize: 16 }}>🔒</Box>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            Guaranteed for 24h
          </Typography>
          <Box sx={{ ml: 'auto' }}>
          </Box>
        </Box>

        {/* You Send Section */}
        <Box sx={{ mb: 3 }}>
          {/* <Typography variant="body2" color="text.primary" sx={{ mb: 1 }}>
            You send exactly
            {selectedCurrencyCode && currentBalance > 0 && (
              <Box component="span" sx={{ ml: 1, color: 'text.secondary', fontSize: '0.875rem' }}>
                (Available: {getCurrencySymbol(selectedCurrencyCode)}{formatBalance(currentBalance)})
              </Box>
            )}
          </Typography> */}
          {ExchangeError && (
            <Typography variant="caption" color="error" sx={{ display: 'block', mb: 1 }}>
              {ExchangeError}
            </Typography>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                mr: 2,
                minWidth: '120px',
              }}
            >
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 1,
                  border: '1px solid #eee',
                  background: '#fff'
                }}
              >
                <Flag
                  code={sendCurrencyCountry}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </Box>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select
                  fullWidth
                  value={sendCurrency}
                  onChange={(e) => HandleSendCurrency(e.target.value)}
                  displayEmpty
                >
                  <MenuItem value="" disabled>
                    <em>Select account</em>
                  </MenuItem>
                  {sendableAccounts.map((account: any) => (
                    <MenuItem key={account._id} value={`${account?.currency}-${account?._id}-${account?.country}`}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', marginRight: 8 }}>
                          <Box
                            sx={{
                              width: 20,
                              height: 20,
                              borderRadius: '50%',
                              overflow: 'hidden',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              marginRight: 1,
                              border: '1px solid #eee',
                              background: '#fff'
                            }}
                          >
                            <Flag
                              code={account.country}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          </Box>
                          <span>{account.currency}</span>
                        </Box>
                        <span style={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                          {getCurrencySymbol(account.currency)}{formatBalance(account.amount)}
                        </span>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <IconButton size="small" onClick={handleSwapCurrencies}>
                {/* <ArrowUpDown size={16} /> */}
              </IconButton>
            </Box>
            <TextField
              type="number"
              value={fromAmount}
              onChange={(e) => HandleFromAmount(e.target.value)}
              variant="outlined"
              size="small"
              placeholder="0.00"
              // disabled={isLoading}
              sx={{
                ml: 'auto',
                '& .MuiOutlinedInput-root': {
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: '#2e7d32',
                  textAlign: 'right',
                },
              }}
            />
          </Box>
          {feeCharge > 0 && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
              Fee: {getCurrencySymbol(selectedCurrencyCode)}{formatAmount(feeCharge)}
            </Typography>
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Recipient Gets Section */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.primary" sx={{ mb: 1 }}>
            Recipient gets
            {Rate > 0 && (
              <Box component="span" sx={{ ml: 1, color: 'text.secondary', fontSize: '0.875rem' }}>
                (Real-time Rate: 1 {selectedCurrencyCode} = {Rate} {selectedRecipientCurrency || (toCurrency ? toCurrency.split('-')[0] : '')})
              </Box>
            )}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                mr: 2,
                minWidth: '120px',
              }}
            >
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 1,
                  border: '1px solid #eee',
                  background: '#fff'
                }}
              >
                <Flag
                  code={toCurrencyCountry}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </Box>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select
                  disabled
                  value={toCurrency}
                  onChange={(e) => HandleToCurrency(e.target.value)}
                  displayEmpty
                >
                  <MenuItem value="" disabled>
                    <em>Select currency</em>
                  </MenuItem>
                  {currencyList.map((currency) => (
                    <MenuItem key={currency.currency} value={`${currency?.currency}-${currency?._id}-${currency?.country}`}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box
                          sx={{
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            overflow: 'hidden',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: 1,
                            border: '1px solid #eee',
                            background: '#fff'
                          }}
                        >
                          <Flag
                            code={currency.country}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </Box>
                        <span>{currency.currency}</span>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <IconButton size="small" onClick={handleSwapCurrencies}>
                {/* <ArrowUpDown size={16} /> */}
              </IconButton>
            </Box>
            <TextField
              type="number"
              value={isLoading ? 'Calculating...' : formatAmount(convertedValue)}
              variant="outlined"
              size="small"
              disabled={true}
              sx={{
                ml: 'auto',
                '& .MuiOutlinedInput-root': {
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: '#2e7d32',
                  textAlign: 'right',
                },
              }}
            />
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Payment Method Section - Dynamic */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Building2 size={20} style={{ marginRight: 8 }} />
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="body2" color="text.primary">
              Paying with
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {paymentMethodLabel}
            </Typography>
          </Box>
          <Chip
            label="Change"
            size="small"
            sx={{ bgcolor: '#e8f5e8', color: '#2e7d32', cursor: 'pointer' }}
            onClick={handleChangePaymentMethod}
          />
        </Box>
        <Divider sx={{ my: 2 }} />
        {/* Arrival Time Section - Dynamic */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Clock size={20} style={{ marginRight: 8 }} />
          <Box>
            <Typography variant="body2" color="text.primary">
              Arrives
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              by {getArrivalDateLabel()}
            </Typography>
          </Box>
        </Box>
        <Divider sx={{ my: 2 }} />
        {/* Total Fees Section - Dynamic */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Receipt size={20} style={{ marginRight: 8 }} />
            <Box>
              <Typography variant="body2" color="text.primary">
                Transfer fees
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {feeCommision?.commissionType === "percentage" ? `${feeCommision?.value}%` : `Fixed ${getCurrencySymbol(selectedCurrencyCode)}${feeCommision?.value}`}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography
              variant="body1"
              sx={{ fontWeight: 500, textDecoration: 'underline' }}
            >
              {formatAmount(feeCharge)} {selectedCurrencyCode || fromCurrency}
            </Typography>
          </Box>
        </Box>

        {/* Net Amount Section */}
        {fromAmount && parseFloat(fromAmount) > 0 && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mt: 2,
              p: 2,
              bgcolor: 'success.light',
              borderRadius: 1,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="body2" color="text.primary" sx={{ fontWeight: 600 }}>
                Net amount to recipient
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography
                variant="body1"
                sx={{ fontWeight: 700, color: 'success.dark' }}
              >
                {formatAmount(convertedValue)} {selectedRecipientCurrency || (toCurrency ? toCurrency.split('-')[0] : '')}
              </Typography>
            </Box>
          </Box>
        )}

        {/* Recommended Transfer Method Info Box */}
        {recommendedMethod && (
          <Box sx={{ mt: 2, mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 2, background: '#fafafa' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Recommended Transfer Method
            </Typography>
            <Typography variant="body2">
              <strong>{recommendedMethod.title || paymentMethodLabel}</strong>
              {recommendedMethod.description && (
                <><br/>{recommendedMethod.description}</>
              )}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Fee: ${recommendedMethod.fee ?? paymentMethodFee} &nbsp;•&nbsp; Time: {recommendedMethod.time ?? paymentMethodTime}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Action Buttons */}
      <Box className="step-actions" sx={{ mt: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <CustomButton
              onClick={onPrevious}
              fullWidth
              className="continue-button"
            >
              Back
            </CustomButton>
          </Grid>
          <Grid item xs={6}>
            <CustomButton
              onClick={handleContinue}
              disabled={
                !sendCurrency || !toCurrency || !fromAmount || !convertedValue || parseFloat(fromAmount) <= 0 || isLoading
              }
              fullWidth
              className="continue-button"
            >
              Continue
            </CustomButton>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default CurrencySelectionStep;

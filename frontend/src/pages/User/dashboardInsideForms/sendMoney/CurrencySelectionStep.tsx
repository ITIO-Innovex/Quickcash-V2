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
import axios from 'axios';

const url = import.meta.env.VITE_NODE_ENV == "production" ? 'api' : 'api';

interface Beneficiary {
  id: string;
  name: string;
  iban: string;
  country: string;
  currency: string;
}

interface CurrencySelectionStepProps {
  formData: any;
  updateFormData: (data: any) => void;
  onNext: () => void;
  onPrevious: () => void;
  selectedBeneficiary?: Beneficiary | null;
  currencyList?: any[];
}

const CurrencySelectionStep: React.FC<CurrencySelectionStepProps> = ({
  formData,
  updateFormData,
  onNext,
  onPrevious,
  selectedBeneficiary,
  currencyList
}) => {
  const theme = useTheme();
  const toast = useAppToast();
  useEffect(() => {
    console.log("formData", formData);
    HandleSendCurrency(formData.sendCurrencyData || 'USD-1');
  }, []);
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
  const [currentBalance, setCurrentBalance] = useState<any>(0);
  const [fromAmount, setFromAmount] = useState<any>(0);
  const [feeCharge, setFeeCharge] = useState<any>(0);
  const [transferMethod, setTransferMethod] = useState('Bank transfer');
  const [editingTransferMethod, setEditingTransferMethod] = useState(false);
  const [fromCurrency, setFromCurrency] = useState(formData.fromCurrency || 'USD');

  const HandleSendCurrency = (val: any) => {
    var valChn = val.split('-');
    console.log("valChn", valChn);
    setSendSideVal(valChn[1]);
    setSendCurrAccountId(valChn[1]);
    setSendCurrency(val);
    setRecieveCurrency('');
    setFeeCharge(0);
    setSendCurrencyCountry(valChn[2]);
    setFromCurrency(valChn[0]);
    ValidateSendAmountToCurrentAccountBalance(valChn[1]);
  }

  const ValidateSendAmountToCurrentAccountBalance = async (itemValue: any) => {
    if (itemValue) {
      console.log("itemValue", itemValue);
      try {
        const result = await api.get(`/${url}/v1/account/accountbyid/${itemValue}`);
        console.log("result", result);
        if (result.data.status == 201) {
          setCurrentBalance(result?.data?.data?.amount);
          console.log("Current Balance", result?.data?.data?.amount);
          var checkVal = parseFloat(fromAmount) + parseFloat(feeCharge);
          if (checkVal > result?.data?.data?.amount) {
            toast.error("User doesn't have enough balance to send money");
            setFromAmount(0);
          } else if (fromAmount > result?.data?.data?.amount) {
            toast.error("User doesn't have enough balance to send money");
            setFromAmount(0);
          }
        }
      } catch (error) {
        console.log("Error in ValidateSendAmountToCurrentAccountBalance", error);
      }

    }
  }

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

  // Sync local state with formData on mount and when formData changes
  useEffect(() => {
    setFromAmount(formData.sendAmount || 0);
    setSendCurrency(`${formData.selectedCurrency}-${formData.source_account}-${formData.country}` || '');
    setToCurrency(formData.toCurrency || '');
  }, [formData]);

  const HandleFromAmount = (value: any) => {
    setFromAmount(value);
    var checkVal = parseFloat(value) + parseFloat(feeCharge);
    if (sendCurrency && checkVal > currentBalance) {
      toast.error("User doesn't have enough balance to send money");
      setFromAmount(0);
    } else if (sendCurrency && value > currentBalance) {
      toast.error("User doesn't have enough balance to send money");
      setFromAmount(0);
    }
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
        source_account: sendCurrAccountId,
        fromCurrency,
        toCurrency,
        sendAmount: fromAmount,
        receiveAmount: convertedValue,
        feeCharge,
        // ...other fields as needed
      });
      onNext();
    } else {
      toast.error('Please fill all required fields and ensure conversion is complete.');
      // For debugging, still advance to next step:
      updateFormData({
        source_account: sendCurrAccountId,
        fromCurrency,
        toCurrency,
        sendAmount: fromAmount,
        receiveAmount: convertedValue,
        feeCharge,
      });
      onNext();
    }
  };
  const HandleToCurrency = (val: any) => {
    var valChn = val.split('-');
    setToCurrency(val);
    setToCurrencyCountry(valChn[2]);
  }
  useEffect(() => {
    calCulateExChangeCurrencyValue();
  }, [sendCurrency, toCurrency, fromAmount]);

  const calCulateExChangeCurrencyValue = async () => {
    if (sendCurrency && toCurrency && fromAmount) {
      var sendCurrencySplit = sendCurrency.split('-');
      var toCurrencySplit = toCurrency.split('-');
      sendCurrencySplit = sendCurrencySplit[0];
      toCurrencySplit = toCurrencySplit[0];
      var valCharge = 0;

      if (feeCommision?.commissionType == "percentage") {
        console.log("minimumValue", feeCommision.minimumValue);
        valCharge = fromAmount * feeCommision?.value / 100;
        if (valCharge < feeCommision.minimumValue) {
          setFeeCharge(feeCommision.minimumValue);
        } else {
          setFeeCharge(valCharge);
        }
      } else {
        valCharge = feeCommision?.value;
        setFeeCharge(valCharge);
      }

      // @ts-ignore
      var checkVal = parseFloat(fromAmount) + parseFloat(valCharge);
      if (checkVal > currentBalance) {
        toast.error("User doesn't have enough balance to send money");
        setFromAmount(0);
      } else if (fromAmount > currentBalance) {
        toast.error("User doesn't have enough balance to send money");
        setFromAmount(0);
      }

      const options = {
        method: 'GET',
        url: 'https://currency-converter18.p.rapidapi.com/api/v1/convert',
        params: {
          from: sendCurrencySplit,
          to: toCurrencySplit,
          amount: 1
        },
        headers: {
          'X-RapidAPI-Key': import.meta.env.VITE_RAPID_API_KEY,
          'X-RapidAPI-Host': import.meta.env.VITE_RAPID_API_HOST
        }
      };

      try {
        const response = await axios.request(options);
        console.log("response", response);
        if (response.data.success) {
          setConvertedValue(response.data.result.convertedAmount * fromAmount);
          console.log("Converted Value", response.data.result.convertedAmount * fromAmount);
          setRate(parseFloat(response.data.result.convertedAmount).toFixed(2));
        } else {
          setExchangeError(response.data.validationMessage[0]);
          toast.error(response.data.validationMessage[0] || 'Currency conversion failed.');
        }
      } catch (error) {
        setExchangeError('Currency conversion failed.');
        toast.error('Currency conversion failed.');
      }
    }
  }
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
            Account: {selectedBeneficiary.iban}
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
          {/* <Box sx={{ ml: 'auto' }}>
            <IconButton size="small" onClick={handleSwapCurrencies}>
              <ArrowUpDown size={16} />
            </IconButton>
          </Box> */}
        </Box>

        {/* You Send Section */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.primary" sx={{ mb: 1 }}>
            You send exactly
            {sendCurrency && <>{" (Avl. Bal = "}{getSymbolFromCurrency(sendCurrency)}{parseFloat(currentBalance).toFixed(2).length > 5 ? parseFloat(currentBalance).toFixed(2)?.substring(0, 5) + '...' : parseFloat(currentBalance).toFixed(2)}{")"}</>}
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
              {sendCurrencyCountry && (
                <Flag
                  code={sendCurrencyCountry}
                  height="20"
                  style={{ marginRight: 8 }}
                />
              )}
              <FormControl size="small" sx={{ minWidth: 80 }}>
                <Select
                  value={sendCurrency}
                  onChange={(e) => HandleSendCurrency(e.target.value)}
                >
                  {currencyList.map((currency) => (
                    <MenuItem key={currency.currency} value={`${currency?.currency}-${currency?._id}-${currency?.country}`}>
                      {currency.currency}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <IconButton size="small" onClick={handleSwapCurrencies}>
                <ArrowUpDown size={16} />
              </IconButton>
            </Box>
            <TextField
              type="number"
              value={fromAmount}
              onChange={(e) => HandleFromAmount(e.target.value)}
              onFocus={(e) => {
                if (fromAmount === 0 || fromAmount === "0") {
                  HandleFromAmount('');
                }
              }}
              variant="outlined"
              size="small"
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

        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.primary" sx={{ mb: 1 }}>
            Recipient gets
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mr: 2, minWidth: '120px' }}>
              {(() => {
                const currencyCode = toCurrency?.split('-')[0] || '';
                let countryCode = toCurrency?.split('-')[2];
                if ((!countryCode || countryCode.length !== 2) && currencyList && currencyCode) {
                  const found = currencyList.find(
                    c => c.currency === currencyCode || c.base_code === currencyCode
                  );
                  countryCode = found?.country || found?.countryCode || '';
                }
                const currencyToCountryMap: Record<string, string> = {
                  INR: 'IN',
                  USD: 'US',
                  EUR: 'EU',
                  GBP: 'GB',
                };
                if ((!countryCode || countryCode.length !== 2) && currencyToCountryMap[currencyCode]) {
                  countryCode = currencyToCountryMap[currencyCode];
                }
                return (
                  <>
                    {countryCode && (
                      <Flag
                        code={countryCode}
                        height="20"
                        style={{ marginRight: 8 }}
                      />
                    )}
                    <Box sx={{ fontWeight: 600, fontSize: '1.1rem', display: 'flex', alignItems: 'center' }}>
                      <span style={{ marginRight: 4 }}>{getSymbolFromCurrency(currencyCode)}</span>
                      <span>{currencyCode}</span>
                    </Box>
                  </>
                );
              })()}
            </Box>
            <TextField
              type="number"
              value={convertedValue}
              variant="outlined"
              size="small"
              sx={{
                ml: 'auto',
                '& .MuiOutlinedInput-root': {
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: '#2e7d32',
                  textAlign: 'right',
                },
              }}
              InputProps={{
                readOnly: true,
              }}
            />
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />
        {/* Payment Method Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Building2 size={20} style={{ marginRight: 8 }} />
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="body2" color="text.primary">
              Paying with
            </Typography>
            {!editingTransferMethod ? (
              <Typography variant="body1" sx={{ fontWeight: 700 }}>
                {transferMethod}
              </Typography>
            ) : (
              <FormControl fullWidth size="small" sx={{ mt: 1 }}>
                <Select
                  value={transferMethod}
                  onChange={(e) => {
                    setTransferMethod(e.target.value);
                    setEditingTransferMethod(false);
                  }}
                >
                  <MenuItem value="Bank transfer">Bank transfer</MenuItem>
                  <MenuItem value="Wallet">Wallet</MenuItem>
                  {/* Add more methods as needed */}
                </Select>
              </FormControl>
            )}
          </Box>
          {!editingTransferMethod && (
            <Chip
              label="Change"
              size="small"
              sx={{ bgcolor: '#e8f5e8', color: '#2e7d32', cursor: 'pointer' }}
              onClick={() => setEditingTransferMethod(true)}
            />
          )}
        </Box>
        <Divider sx={{ my: 2 }} />
        {/* Arrival Time Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Clock size={20} style={{ marginRight: 8 }} />
          <Box>
            <Typography variant="body2" color="text.primary">
              Arrives
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              by Thursday
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Transaction Fee and Net Amount Alert Box */}
        <Paper elevation={0} sx={{ background: '#fff8e1', border: '1px solid #ffe082', borderRadius: 2, p: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.primary">
              Transaction fee
            </Typography>
            <Typography variant="body2" color="text.primary" sx={{ fontWeight: 500 }}>
              {feeCharge} {fromCurrency}
            </Typography>
          </Box>

          {/* Net Amount Recipient Gets Section */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.primary">
              Net amount recipient gets
            </Typography>
            <Typography variant="body2" color="text.primary" sx={{ fontWeight: 500 }}>
              {(convertedValue - feeCharge).toFixed(2)} {toCurrency.split('-')[0]}
            </Typography>
          </Box>
        </Paper>


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

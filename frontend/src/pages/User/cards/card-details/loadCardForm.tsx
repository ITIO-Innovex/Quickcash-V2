import React, { useState, useEffect } from 'react';
import {
  Box,
  MenuItem,
  InputAdornment,
  useTheme,
} from '@mui/material';
import axios from 'axios';
import { useAccount } from './useAccount';
import { useNavigate } from 'react-router-dom';
import CustomTextField from '@/components/CustomTextField';
import CustomButton from '@/components/CustomButton';
import api from '@/helpers/apiHelper';
import { useAppToast } from '@/utils/toast';
import { useFee } from '@/hooks/useFee';

const currencyRates: { [key: string]: number } = {
  USD: 1,
  EUR: 0.85,
  GBP: 0.75,
  INR: 74.5,
  JPY: 110,
};

const LoadCardForm = ({
  loadCardDetails,
  accountId,
  url,
  setLoadCardDetails,
  onRefreshCards,
  onClose,
  alertnotify,
  currencySymbols,
}) => {
  const theme = useTheme();
  const toast = useAppToast();
  const navigate = useNavigate();
  const [amount, setAmount] = useState<number>(0);
  const [depositFee, setDepositFee] = useState<number>(0.0);
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [convertedAmounts, setConvertedAmounts] = useState<{ [key: string]: number }>({});
  const [selectedCurrency, setSelectedCurrency] = useState<string>(loadCardDetails?.currency || 'USD');
  const [cardBalance, setCardBalance] = useState<number | { $numberDecimal: string }>(
    loadCardDetails?.cardBalance || 0
  );
  const DepositFeesd = useFee("Deposit");
  const [accountBalance, setAccountBalance] = useState<number | { $numberDecimal: string }>(0);
  const [convValue, setConvValue] = useState<number>(0);
  const [acctDetails, setAcctDetails] = useState<any>(null);
  const [currencyType, setCurrencyType] = useState<string>(selectedCurrency);
  useEffect(() => {
    if (loadCardDetails?.amount !== undefined) {
      const balance = parseFloat(loadCardDetails.amount);
      // console.log('Parsed balance from amount:', balance);
      setCardBalance(balance);
    }
  }, [loadCardDetails]);


  const { list } = useAccount(accountId?.data?.id);
  const availableAccounts = list || [];
  const availableCurrencies = availableAccounts.map((acc) => acc.currency);

  useEffect(() => {
    const account = availableAccounts.find((acc) => acc.currency === selectedCurrency);
    if (account) {
      setSelectedAccount(account._id);
      setAccountBalance(account.amount);
      setAcctDetails(account);
      setCurrencyType(account.currency);
    }
  }, [selectedCurrency, availableAccounts]);

  const HandleAmount = async (amt_val: any) => {
    const parsedAmount = parseFloat(amt_val) || 0;
    setAmount(parsedAmount);
    let feeVal = 0;
    let feeType = "";

    if (DepositFeesd?.feeCommision) {
      feeVal = DepositFeesd?.feeCommision?.value;
      feeType = DepositFeesd?.feeCommision?.commissionType;
    }

    let feeCharge: number;
    if (feeType === "percentage") {
      feeCharge = (parsedAmount * parseFloat(feeVal as any)) / 100;
    } else {
      feeCharge = parseFloat(feeVal as any);
    }

    const minFeecharge =
      feeCharge >= DepositFeesd?.feeCommision?.minimumValue
        ? feeCharge
        : DepositFeesd?.feeCommision?.minimumValue;

    if (acctDetails?.currency !== loadCardDetails?.currency) {
      setDepositFee(minFeecharge);
      calCulateExChangeCurrencyValue(parsedAmount, minFeecharge);
    } else {
      setDepositFee(minFeecharge);
      setConvValue(0); // No conversion needed
    }
  };

  const calCulateExChangeCurrencyValue = async (amt: any, valDeposit: any) => {
    if (!acctDetails || !loadCardDetails?.currency) return;

    const options = {
      method: "GET",
      url: "https://currency-converter18.p.rapidapi.com/api/v1/convert",
      params: {
        from: acctDetails.currency, // FROM: selected account currency
        to: loadCardDetails.currency, // TO: card currency
        amount: amt,
      },
      headers: {
        "X-RapidAPI-Key": import.meta.env.VITE_RAPID_API_KEY,
        "X-RapidAPI-Host": import.meta.env.VITE_RAPID_API_HOST,
      },
    };

    console.log("API options:", options);

    try {
      const response = await axios.request(options);
      console.log("API response:", response.data);
      if (response.data.success) {
        setConvValue(response.data.result.convertedAmount);
      }
    } catch (error) {
      console.error("API error:", error);
    }
  };

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.value;
    setSelectedCurrency(selected);

    if (amount > 0) {
      const converted: { [key: string]: number } = {};
      Object.keys(currencyRates).forEach((currency) => {
        converted[currency] = amount * (currencyRates[currency] / currencyRates[selected]);
      });
      setConvertedAmounts(converted);
    }
  };

  const handleGetLoadCard = async () => {
    try {
      if (amount > 0 && loadCardDetails?._id && selectedAccount) {
        const payload = {
          sourceAccountId: selectedAccount,
          cardId: loadCardDetails._id,
          amount: amount, // in selected account currency
          fee: depositFee, // in selected account currency
          conversionAmount: acctDetails?.currency !== loadCardDetails?.currency ? convValue : amount, // in card currency
          fromCurrency: acctDetails?.currency,
          toCurrency: loadCardDetails?.currency,
          info: 'Wallet to Card Balance Load',
        };
        const response = await api.post(
          `/${url}/v1/card/load-balance`,
          payload
        );
        if (response.data.status === 200) {
          toast.success('Amount loaded to card successfully');

          const newBalance = response.data.cardBalance;

          if (newBalance !== undefined) {
            setCardBalance(newBalance);
            setLoadCardDetails((prev) =>
              prev ? { ...prev, cardBalance: newBalance } : null
            );
            if (onRefreshCards) {
              setTimeout(() => {
                onRefreshCards();
              }, 500);
            }
          }
          if (onClose) {
            onClose();
          }
        } else {
          toast.error(response.data.message || 'Failed to load card');
        }
      } else {
        toast.error('Please enter a valid amount and select an account');
      }
    } catch (error) {
      console.error('Error loading card balance:', error);
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.data.status === 403) {
          localStorage.clear();
          navigate('/');
        } else {
          toast.error(error.response.data.message);
        }
      }
    }
  };

  const formatDecimalValue = (value: any) =>
    typeof value === 'object' && '$numberDecimal' in value
      ? parseFloat(value.$numberDecimal).toFixed(2)
      : parseFloat(value).toFixed(2);
  const toTitleCase = (str: string = '') =>
    str
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

  return (
    <Box className="load-card-modal">
      {loadCardDetails?.cardNumber && (
        <Box className="form-group" sx={{ mb: 2 }}>

          {/* Show card currency and user */}
          <Box sx={{ fontSize: '13px', color: 'gray', mt: 0.5 }}>
            <label>Card Number: {loadCardDetails.cardNumber.replace(/(.{4})/g, '$1 ').trim()}</label>
            {'| Currency:'} <b>{loadCardDetails.currency}</b>
            {loadCardDetails.name || loadCardDetails.user || loadCardDetails.email ? (
              <>
                {' | User: '}<b>{toTitleCase(loadCardDetails.name || loadCardDetails.user || loadCardDetails.email)}</b>
              </>
            ) : null}
          </Box>
        </Box>
      )}
      <Box className="form-row">
        <Box className="form-group">
          <CustomTextField
            select
            className="custom-textfield"
            value={selectedCurrency}
            onChange={handleCurrencyChange}
            fullWidth
            size="small"
          >
            {availableCurrencies.map((currency) => (
              <MenuItem key={currency} value={currency}>
                {currency} ({currencySymbols[currency] || currency})
              </MenuItem>
            ))}
          </CustomTextField>
        </Box>

        <Box className="form-group">
          {/* <label>Balance</label> */}
          <CustomTextField
            value={`${currencySymbols[selectedCurrency] || ''} ${formatDecimalValue(accountBalance)}`}
            disabled
            fullWidth
            size="small"
          />
        </Box>
      </Box>

      <Box className="form-group full-width">
        {/* <label>Amount</label> */}
        <CustomTextField
          type="number"
          value={amount}
          onChange={e => HandleAmount(e.target.value)}
          placeholder={`${currencySymbols[selectedCurrency] || ''} 0`}
          fullWidth
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start" sx={{ color: theme.palette.text.gray }}>
                {currencySymbols[selectedCurrency] || selectedCurrency}
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <Box className="info-row">
        <span>
          Deposit Fee: {currencySymbols[selectedCurrency] || ''} {depositFee.toFixed(2)}
        </span>
        <span>
          Amount: {currencySymbols[selectedCurrency] || ''} {amount.toFixed(2)}
        </span>
        <span>
          Conversion: {currencySymbols[loadCardDetails.currency] || loadCardDetails.currency} {convValue ? convValue.toFixed(2) : '0.00'}
        </span>
      </Box>

      <CustomButton fullWidth onClick={handleGetLoadCard}>
        Add Balance
      </CustomButton>
    </Box>
  );
};

export default LoadCardForm;

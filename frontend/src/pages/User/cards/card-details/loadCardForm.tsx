import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
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
  setCardDetails,
  alertnotify,
  currencySymbols,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [amount, setAmount] = useState<number>(0);
  const [depositFee, setDepositFee] = useState<number>(0.0);
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [convertedAmounts, setConvertedAmounts] = useState<{ [key: string]: number }>({});
  const [selectedCurrency, setSelectedCurrency] = useState<string>(loadCardDetails?.currency || 'USD');
  const [cardBalance, setCardBalance] = useState<number | { $numberDecimal: string }>(
    loadCardDetails?.cardBalance || 0
  );
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
    if (account) setSelectedAccount(account._id);
  }, [selectedCurrency, availableAccounts]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = parseFloat(e.target.value);
    setAmount(inputValue || 0);

    if (inputValue > 0) {
      const converted: { [key: string]: number } = {};
      Object.keys(currencyRates).forEach((currency) => {
        converted[currency] =
          inputValue * (currencyRates[currency] / currencyRates[selectedCurrency]);
      });
      setConvertedAmounts(converted);
    } else {
      setConvertedAmounts({});
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
      if (amount > 0 && loadCardDetails?._id) {
        const response = await api.patch(
          `/${url}/v1/card/update-amount/${loadCardDetails._id}`,
          { amount, currency: selectedCurrency },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
        if (response.data.status) {
          alertnotify('Amount updated successfully', 'success');

          const newBalance = response.data.data?.cardBalance;

          if (newBalance !== undefined) {
            const parsedBalance =
              typeof newBalance === 'object' && '$numberDecimal' in newBalance
                ? parseFloat(newBalance.$numberDecimal)
                : parseFloat(newBalance);

            setCardBalance(parsedBalance);

            setLoadCardDetails((prev) =>
              prev ? { ...prev, cardBalance: parsedBalance } : null
            );

            setCardDetails((prevCards) =>
              prevCards.map((card) =>
                card._id === loadCardDetails._id
                  ? { ...card, cardBalance: parsedBalance }
                  : card
              )
            );
          }
        }

      } else {
        alertnotify('Please enter a valid amount', 'error');
      }
    } catch (error) {
      console.error('Error updating card amount:', error);
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.data.status === 403) {
          localStorage.clear();
          navigate('/');
        } else {
          alertnotify(error.response.data.message, 'error');
        }
      }
    }
  };

  const formatDecimalValue = (value: any) =>
    typeof value === 'object' && '$numberDecimal' in value
      ? parseFloat(value.$numberDecimal).toFixed(2)
      : parseFloat(value).toFixed(2);

  return (
    <Box className="load-card-modal">
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
            value={`${currencySymbols[selectedCurrency] || ''} ${formatDecimalValue(cardBalance)}`}
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
          onChange={handleAmountChange}
          placeholder={`${currencySymbols[selectedCurrency] || ''} 0`}
          fullWidth
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start" sx={{color:theme.palette.text.gray}}>
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
          Conversion: {currencySymbols[selectedCurrency] || ''}{' '}
          {convertedAmounts[selectedCurrency]?.toFixed(2) || '0.00'}
        </span>
      </Box>

      <CustomButton fullWidth onClick={handleGetLoadCard}>
        GET LOAD CARD
      </CustomButton>
    </Box>
  );
};

export default LoadCardForm;

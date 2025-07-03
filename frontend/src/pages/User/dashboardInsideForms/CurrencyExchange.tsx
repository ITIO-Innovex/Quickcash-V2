import { useEffect, useState } from "react";
import { ArrowDown } from "lucide-react";
import AccountSelectModal from "./AccountSelectorForm";
import CustomTextField from "@/components/CustomTextField";
import CountryDropdown from "@/components/CountryDropdown";
import CurrencyExchangeModal from './CurrencyExchangeModal';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import api from '@/helpers/apiHelper';
import {Box, Typography, InputAdornment, Button, Paper, Grid, useTheme,} from "@mui/material";
import axios from 'axios';
import { useAuth } from '@/contexts/authContext';
const url = import.meta.env.VITE_NODE_ENV == "production" ? "api" : "api";

interface CurrencyExchangeFormProps {
  onClose: () => void;
}

const countryOptions = [
  {
    code: 'US',
    name: 'United States',
    currency: 'USD',
    flagCode: 'us',
  },
  {
    code: 'IN',
    name: 'India',
    currency: 'INR',
    flagCode: 'in',
  },
  // add more...
];

const accounts = [
  {
    flag: "/flags/india.png",
    label: "INR Account",
    balance: "₹84575.92",
    code: "IN1000000015",
    currency: "INR",
  },
  {
    flag: "/flags/europe.png",
    label: "EUR Account",
    balance: "€468.00",
    code: "EU1000001596",
    currency: "EUR",
  },
  {
    flag: "/flags/pakistan.png",
    label: "PKR Account",
    balance: "₨56429.71",
    code: "PK1000001722",
    currency: "PKR",
  },
];

const calculateFee = (amount: string) => {
  const amt = parseFloat(amount);
  if (isNaN(amt) || amt <= 0) return 1;
  return Math.max(1, +(amt * 0.01).toFixed(2));
};

const CurrencyExchangeForm = ({ onClose }: CurrencyExchangeFormProps) => {
  const theme = useTheme();
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [exchangeModalOpen, setExchangeModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(accounts[0]);
  const [currencyList, setCurrencyList] = useState([]);
  const [currency, setCurrency] = useState(countryOptions[0].currency);
  const [amount, setAmount] = useState('');
  const [exchangeRate, setExchangeRate] = useState(1); // default 1:1
  const [exchangedAmount, setExchangedAmount] = useState('');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fee, setFee] = useState(1);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const getCurrencyList = async () => {
    try {
      const result = await api.get(`/${url}/v1/currency/list`);
      if (result && result.data) {
        setCurrencyList(result.data.data);
      }
    } catch (error) {
      console.error('Error fetching currency list:', error);
    }
  };

  // Fetch exchange rate from live API
  const fetchExchangeRate = async (fromCurrency: string, toCurrency: string) => {
    if (fromCurrency === toCurrency) {
      setExchangeRate(1);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const options = {
        method: 'GET',
        url: 'https://currency-converter18.p.rapidapi.com/api/v1/convert',
        params: {
          from: fromCurrency,
          to: toCurrency,
          amount: 1,
        },
        headers: {
          'X-RapidAPI-Key': import.meta.env.VITE_RAPID_API_KEY,
          'X-RapidAPI-Host': import.meta.env.VITE_RAPID_API_HOST,
        },
      };
      const response = await axios.request(options);
      if (response.data.success) {
        setExchangeRate(parseFloat(response.data.result.convertedAmount));
        setError(null);
      } else {
        setExchangeRate(1);
        setError(response.data.validationMessage?.[0] || 'Exchange rate error');
      }
    } catch (err: any) {
      setExchangeRate(1);
      setError('Failed to fetch exchange rate');
    }
    setLoading(false);
  };

  useEffect(() => {
    getCurrencyList();
  }, []);

  useEffect(() => {
    if (selectedAccount.currency && currency) {
      fetchExchangeRate(selectedAccount.currency, currency);
    }
  }, [selectedAccount, currency]);

  useEffect(() => {
    if (amount && exchangeRate) {
      setExchangedAmount((parseFloat(amount) * exchangeRate).toFixed(2));
    } else {
      setExchangedAmount('');
    }
  }, [amount, exchangeRate]);

  useEffect(() => {
    setFee(calculateFee(amount));
  }, [amount]);

  // Handle account selection and trigger rate fetch
  const handleAccountSelect = (acc: typeof accounts[0]) => {
    setSelectedAccount(acc);
    // Optionally, set currency to match account or keep as is
    // setCurrency(acc.currency);
    setModalOpen(false);
    fetchExchangeRate(acc.currency, currency);
  };

  // Find the target account for exchange (not the selected/source account)
  const targetAccount = accounts.find(
    acc => acc.currency === currency && acc.code !== selectedAccount.code
  ) || { _id: '', currency, amount: exchangedAmount };

  return (
    <>
      <Paper sx={{ p: 3,backgroundColor:theme.palette.background.default }}>

        <Box display="flex" alignItems="center" gap={1}>
          <img className="img-round" src="../flags/usa.png" alt="USA Flag" width={24} height={24}/>
          <Box>

            <Typography fontWeight="bold">Exchange {selectedAccount?.currency || ''}</Typography>
            <Typography variant="caption" color="text.primary">
              Select Currency
            </Typography>
          </Box>
        </Box>

        <Box className='currency-box'
        >
          <Typography variant="caption" fontWeight={600} display="block">
            AMOUNT
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
           <CustomTextField
             type="number"
             value={amount}
             onChange={e => setAmount(e.target.value)}
             InputProps={{
               startAdornment: (
                 <InputAdornment position="start" sx={{ color: theme.palette.text.primary }}>
                   $
                 </InputAdornment>
               ),
               sx: {
                 '& input': {
                   color: theme.palette.text.primary,
                 },
               }
             }}
             sx={{
               '& .MuiInputBase-root': {
                 color: theme.palette.text.primary,
               },
             }}
           />

           <CountryDropdown label="Select Currency" countries={currencyList} value={currency} onChange={(e) => setCurrency(e.target.value as string)} showFlag={true} showCurrency={true} size="small" fullWidth/>
          </Box>

          {/* Loading and error feedback */}
          {loading && (
            <Typography variant="caption" color="info.main">Fetching exchange rate...</Typography>
          )}
          {error && (
            <Typography variant="caption" color="error.main">{error}</Typography>
          )}

          <Box mt={1} display="flex" justifyContent="space-between">
            <Typography variant="caption">
              {exchangeRate && selectedAccount.currency && currency && selectedAccount.currency !== currency
                ? `1 ${selectedAccount.currency} = ${exchangeRate} ${currency}`
                : ''}
            </Typography>
            <Typography variant="caption"></Typography>
          </Box>
        </Box>

        <Box display="flex" justifyContent="center">
          <ArrowDown className="arrow-sign" />
        </Box>

        <Box className='currency-box' mb={2}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={6}>
            <Typography variant="h4">
              {exchangedAmount ? `${currency} ${exchangedAmount}` : '--'}
            </Typography>
            </Grid>
            <Grid item xs={6}>
              <Box className='account-selector-box' onClick={() => setModalOpen(true)} sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
              >
                <img className="img-round" src={selectedAccount.flag} alt={selectedAccount.label} width={20} height={20} />
                <Typography sx={{ ml: 1 }}>{selectedAccount.label}</Typography>
                <ArrowDropDownIcon sx={{ ml: 3 }} />
              </Box>
            </Grid>
          </Grid>

          <Box mt={1} display="flex" justifyContent="space-between">
            <Typography variant="caption">Will get Exactly</Typography>
            <Typography variant="caption">
                {selectedAccount.balance}
              </Typography>
          </Box>
        </Box>

        <Button className="modal-button" fullWidth onClick={() => setExchangeModalOpen(true)}>
          Review Order
        </Button>
      </Paper>

      <AccountSelectModal open={modalOpen} onClose={() => setModalOpen(false)} accounts={accounts} onSelect={handleAccountSelect}
      />
     
    <CurrencyExchangeModal
      open={exchangeModalOpen}
      onClose={() => setExchangeModalOpen(false)}
      fromAmount={amount}
      fromCurrency={selectedAccount.currency}
      toCurrency={currency}
      exchangeRate={exchangeRate}
      exchangedAmount={exchangedAmount}
      fee={fee}
      account={selectedAccount}
      onSubmit={(transaction) => {
        setTransactions(prev => [transaction, ...prev]);
        setSuccessMsg('Transaction submitted successfully!');
        setTimeout(() => setSuccessMsg(null), 3000);
      }}
      accountId={{ data: { id: user?.id, name: user?.name } }}
      toExchangeBox={targetAccount}
      setToExchangeBox={() => {}}
      getAllAccountsList={() => {}}
      setReviewOpen={() => {}}
      setExchangeOpen={() => {}}
      alertnotify={() => {}}
      getDashboardData={() => {}}
      url="api"
    />
    </>
  );
};

export default CurrencyExchangeForm;

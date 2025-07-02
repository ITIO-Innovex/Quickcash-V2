import { useEffect, useState } from "react";
import { ArrowDown } from "lucide-react";
import AccountSelectModal from "./AccountSelectorForm";
import CustomTextField from "@/components/CustomTextField";
import CountryDropdown from "@/components/CountryDropdown";
import CurrencyExchangeModal from './CurrencyExchangeModal';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import api from '@/helpers/apiHelper';
import {Box, Typography, InputAdornment, Button, Paper, Grid, useTheme,} from "@mui/material";
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

const CurrencyExchangeForm = ({ onClose }: CurrencyExchangeFormProps) => {
  const theme = useTheme();
  const [modalOpen, setModalOpen] = useState(false);
  const [exchangeModalOpen, setExchangeModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(accounts[0]);
  const [currencyList, setCurrencyList] = useState([]);
  const [currency, setCurrency] = useState(countryOptions[0].currency);
  const [amount, setAmount] = useState('');
  const [exchangeRate, setExchangeRate] = useState(1); // default 1:1
  const [exchangedAmount, setExchangedAmount] = useState('');
  const [transactions, setTransactions] = useState<any[]>([]);

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

  // Fetch exchange rate (replace with real API if available)
  const fetchExchangeRate = async (fromCurrency: string, toCurrency: string) => {
    if (fromCurrency === toCurrency) {
      setExchangeRate(1);
      return;
    }
    try {
      // Uncomment and use real API if available
      // const result = await api.get(`/${url}/v1/currency/exchange-rate?from=${fromCurrency}&to=${toCurrency}`);
      // if (result && result.data) {
      //   setExchangeRate(result.data.rate);
      // }
      // For demo, use static rates
      const staticRates: Record<string, number> = {
        'USDINR': 83.2,
        'INRUSD': 0.012,
        'USDEUR': 0.92,
        'EURUSD': 1.09,
        'INREUR': 0.011,
        'EURINR': 89.5,
        // Add more as needed
      };
      const key = fromCurrency + toCurrency;
      setExchangeRate(staticRates[key] || 1);
    } catch (error) {
      setExchangeRate(1);
    }
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

  return (
    <>
      <Paper sx={{ p: 3,backgroundColor:theme.palette.background.default }}>

        <Box display="flex" alignItems="center" gap={1}>
          <img className="img-round" src="../flags/usa.png" alt="USA Flag" width={24} height={24}/>
          <Box>

            <Typography fontWeight="bold">Exchange USD</Typography>
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

          <Box mt={1} display="flex" justifyContent="space-between">
            <Typography variant="caption">Fee: $7</Typography>
            <Typography variant="caption">Balance: $6188.83</Typography>
          </Box>
        </Box>

        <Box display="flex" justifyContent="center">
          <ArrowDown className="arrow-sign" />
        </Box>

        <Box className='currency-box' mb={2}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={6}>
              <Typography variant="h4" fontWeight="bold">
                {selectedAccount.balance}
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
              {exchangedAmount ? `${currency} ${exchangedAmount}` : '--'}
            </Typography>
          </Box>
        </Box>

        <Button className="modal-button" fullWidth onClick={() => setExchangeModalOpen(true)}>
          Review Order
        </Button>
      </Paper>

      <AccountSelectModal open={modalOpen} onClose={() => setModalOpen(false)} accounts={accounts} onSelect={(acc) => {
          setSelectedAccount(acc);
          setModalOpen(false);
        }}
      />
     
    <CurrencyExchangeModal
      open={exchangeModalOpen}
      onClose={() => setExchangeModalOpen(false)}
      fromAmount={amount}
      fromCurrency={selectedAccount.currency}
      toCurrency={currency}
      exchangeRate={exchangeRate}
      exchangedAmount={exchangedAmount}
      fee={7}
      account={selectedAccount}
      onSubmit={(transaction) => {
        setTransactions(prev => [transaction, ...prev]);
        console.log('Transaction submitted successfully:', transaction);
      }}
    />
    </>
  );
};

export default CurrencyExchangeForm;

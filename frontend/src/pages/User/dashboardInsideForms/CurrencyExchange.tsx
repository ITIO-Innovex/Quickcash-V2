import { useEffect, useState } from "react";
import { ArrowDown } from "lucide-react";
import AccountSelectModal from "./AccountSelectorForm";
import CustomTextField from "@/components/CustomTextField";
import CountryDropdown from "@/components/CountryDropdown";
import CurrencyExchangeModal from './CurrencyExchangeModal';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import api from '@/helpers/apiHelper';
import {Box, Typography, InputAdornment, Button, Paper, Grid, useTheme, Avatar,} from "@mui/material";
import axios from 'axios';
import { useAuth } from '@/contexts/authContext';
import ReactCountryFlag from "react-country-flag";
import getSymbolFromCurrency from "currency-symbol-map";
import { useFee } from "@/hooks/useFee";
import LanguageSharpIcon from "@mui/icons-material/LanguageSharp";
import { blue } from "@mui/material/colors";
const url = import.meta.env.VITE_NODE_ENV == "production" ? "api" : "api";
const emails = ["username@gmail.com", "user02@gmail.com"];
interface CurrencyExchangeFormProps {
  activeAccount: any;
  accountBalance: any;
  acctDetails: any;
  accountList: any;
  onClose: (value: string) => void;
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

const CurrencyExchangeForm = ({ onClose,acctDetails,activeAccount,accountBalance,accountList, }: CurrencyExchangeFormProps) => {
console.log("account list =>", JSON.stringify(accountList, null, 2)); 

  const theme = useTheme();
  const ExchangeFees = useFee("Exchange");
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
  const [loaderCr, setLoaderCr] = useState<any>(false);
  const [feeChargeAmount, setFeeChargeAmount] = useState<any>(0);
  const [fromValue, setFromValue] = useState<any>(0);
  const [reviewFlag, setReviewFlag] = useState<boolean>(false);
  const [errorExchangeMsg, setErrorExchangeMessage] = useState<any>("");
  const [activeRate, setActiveRate] = useState<any>(0);
  const [convertedValue, setConvertedValue] = useState<any>(0);
  const [toExchangeBox, setToExchangeBox] = useState<any>("");
  const [toExchangeAccount, setToExchangeAccount] = useState<any>("");
  const [selectedExchangeValue, setSelectedExchangeValue] = useState<string>(emails[1]);
  const [calCulateOpen, setCalCulateOpen] = useState<any>(false);

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

  const HandleFromAmountExchange = async (amtt: any) => {
    setLoaderCr(true);
    var feeCharge2: number = 0;
    if (ExchangeFees?.feeCommision?.commissionType == "percentage") {
      if (
        parseFloat(amtt) > parseFloat(ExchangeFees?.feeCommision?.minimumValue)
      ) {
        feeCharge2 =
          (parseFloat(amtt) * parseFloat(ExchangeFees?.feeCommision?.value)) /
          100; // @ts-ignore
        if (
          parseFloat(feeCharge2.toString()) >=
          parseFloat(ExchangeFees?.feeCommision?.minimumValue)
        ) {
          setFeeChargeAmount(feeCharge2);
        } else {
          setFeeChargeAmount(ExchangeFees?.feeCommision?.minimumValue);
        }
      } else {
        feeCharge2 = parseFloat(ExchangeFees?.feeCommision?.minimumValue);
        setFeeChargeAmount(feeCharge2);
      }
    } else {
      feeCharge2 = parseFloat(ExchangeFees?.feeCommision?.value); // @ts-ignore
      setFeeChargeAmount(feeCharge2);
    }

    /** @ts-ignore **/
    const totalAm = parseFloat(feeCharge2) + parseFloat(amtt);
    /** @ts-ignore **/
    if (parseFloat(acctDetails?.amount) >= parseFloat(totalAm)) {
      setFromValue(amtt);
      setReviewFlag(true);
      CalculateExchangeValues(amtt);
      localStorage.setItem("currentCurrency", toExchangeBox?.currency);
      setErrorExchangeMessage("");
    } else {
      setReviewFlag(false);
      setLoaderCr(false);
      setErrorExchangeMessage(
        "Total amount should be less than or equal to current balance amount"
      );
      //alertnotify("Total amount sholud be less than or equal to current balance amount", "error");
    }
  };

  const CalculateExchangeValues = async (amty: any) => {
    const from = acctDetails?.currency;
    const to = toExchangeBox?.currency;
    // const totalFeesandAmount = parseFloat(amty) + parseFloat(depositFee)
    //if(localStorage.getItem('currentCurrency') != toExchangeBox?.currency) {
    await axios
      .post(
        `/${url}/v1/currency/getExchange`,
        { from, to },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )
      .then((result) => {
        if (result.data.status == 201) {
          setLoaderCr(false);
          setActiveRate(result?.data?.data);
          setConvertedValue(amty * result?.data?.data);
        }
      })
      .catch((error) => {
        setLoaderCr(false);
        console.log(error);
      });
    // } else {
    //   setConvertedValue(amty*activeRate);
    // }
  };

  return (
    <>
      <Paper sx={{ p: 3,backgroundColor:theme.palette.background.default }}>

        <Box display="flex" alignItems="center" gap={1}>
          <ReactCountryFlag
            countryCode={
              acctDetails
                ? acctDetails?.country
                : acctDetails?.country
            }
            svg
            style={{
              width: "2em",
              height: "2em",
              borderRadius: "50%",
              marginTop: "10px",
            }}
            cdnUrl="https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.4.3/flags/1x1/"
            cdnSuffix="svg"
            title={
              acctDetails
                ? acctDetails?.country
                : acctDetails?.country
            }
          />
          <Box>

            <Typography fontWeight="bold">Exchange {acctDetails?.currency || ''}</Typography>
            <Typography variant="caption" color="text.primary">
              Select Currency
            </Typography>
          </Box>
        </Box>

        <Box className='currency-box'>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="caption" fontWeight={600} display="block">
                AMOUNT
              </Typography>
              <CustomTextField
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                InputProps={{
                  startAdornment: (  
                    <InputAdornment position="start" sx={{ color: theme.palette.text.primary }}>
                      {acctDetails
                          ? getSymbolFromCurrency(acctDetails?.currency)
                          : getSymbolFromCurrency(acctDetails?.currency)
                      }
                    </InputAdornment>
                  ),
                  sx: {
                    '& input': {
                      color: theme.palette.text.primary,
                    },
                  }
                }}
                onBlur={(e) =>
                          HandleFromAmountExchange(e.target.value)
                        }
                disabled={
                            toExchangeAccount?.currency ? false : true
                        }
                sx={{
                  '& .MuiInputBase-root': {
                    color: theme.palette.text.primary,
                  },
                }}
              />
            </Grid>
            <Grid item xs={6}>
               <Typography variant="caption" fontWeight={600} display="block">
                Selected Account
              </Typography>
              <CustomTextField
                type="text"
                value={acctDetails?.name.substring(0, 10) +"..."}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <ReactCountryFlag
                        countryCode={acctDetails?.country || "US"}
                        svg
                        style={{
                          width: '1.5em',
                          height: '1.5em',
                          borderRadius: '2px',
                          marginRight: '6px',
                        }}
                        title={acctDetails?.country}
                      />
                      
                    </InputAdornment>
                  ),
                  sx: {
                    '& input': {
                      color: theme.palette.text.primary,
                    },
                  }
                }}
                onBlur={(e) => HandleFromAmountExchange(e.target.value)}
                disabled={!toExchangeAccount?.currency}
                sx={{
                  '& .MuiInputBase-root': {
                    color: theme.palette.text.primary,
                  },
                }}
              />

            </Grid>
          </Grid>
          <Grid 
            sx={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                flexWrap: "wrap",
                marginTop: "12px",
              }}>
            <Grid>
              <Typography variant="caption">
                Fee:{" "}
                {acctDetails
                  ? getSymbolFromCurrency(
                      acctDetails?.currency
                    )
                  : ""}
                {feeChargeAmount}
              </Typography>
            </Grid>
            <Grid>
              <Typography variant="caption">
                Balance:{" "}
                {acctDetails
                  ? getSymbolFromCurrency(
                      acctDetails?.currency
                    )
                  : ""}
                {acctDetails
                  ? parseFloat(
                      acctDetails?.amount
                    ).toFixed(2)
                  : ""}
              </Typography>
            </Grid>
          </Grid>
          {/* Loading and error feedback */}
          {/* {loading && (
            <Typography variant="caption" color="info.main">Fetching exchange rate...</Typography>
          )}
          {error && (
            <Typography variant="caption" color="error.main">{error}</Typography>
          )} */}

          {/* <Box mt={1} display="flex" justifyContent="space-between">
            <Typography variant="caption">
              {exchangeRate && selectedAccount.currency && currency && selectedAccount.currency !== currency
                ? `1 ${selectedAccount.currency} = ${exchangeRate} ${currency}`
                : ''}
            </Typography>
            <Typography variant="caption"></Typography>
          </Box> */}
        </Box>

        <Box display="flex" justifyContent="center">
          <ArrowDown className="arrow-sign" />
        </Box>

        <Box className='currency-box' mb={2}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={6}>
            <Typography variant="h4">
              {getSymbolFromCurrency(toExchangeBox?.currency)}
              {parseFloat(convertedValue).toFixed(2)}
            </Typography>
            </Grid>
            <Grid item xs={6}>
              <Box className='account-selector-box' onClick={() => setModalOpen(true)} sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
              >
                {!toExchangeAccount ? (
                  <>
                  <Avatar
                    sx={{
                        bgcolor: blue[100],   // light blue background
                        color: blue[600],     // darker blue text
                    }}
                  >
                    
                    <LanguageSharpIcon />
                  </Avatar>
                  <Typography variant="caption"  display="block">
                      Select an account
                  </Typography>
                    
                  </>
                ): (
                  <>
                    <ReactCountryFlag
                      countryCode={toExchangeAccount?.country}
                      svg
                      style={{
                        width: "2em",
                        height: "2em",
                        borderRadius: "50%",
                      }}
                      cdnUrl="https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.4.3/flags/1x1/"
                      cdnSuffix="svg"
                      title={toExchangeAccount?.country}
                    />
                    <Typography variant="caption"  display="block">
                      {(toExchangeAccount?.name).substring(0, 9) +"..." }
                    </Typography>
                  </>
                    
                )}
                {/* <img className="img-round" src={selectedAccount.flag} alt={selectedAccount.label} width={20} height={20} />
                <Typography sx={{ ml: 1 }}>{selectedAccount.label}</Typography> */}
                <ArrowDropDownIcon sx={{ ml: 3 }} />
              </Box>
            </Grid>
          </Grid>

          <Box mt={1} display="flex" justifyContent="space-between">
            <Typography variant="caption">Will get Exactly</Typography>
              <Typography variant="caption">
                  {getSymbolFromCurrency(toExchangeBox?.currency)}
                  {toExchangeBox
                    ? parseFloat(toExchangeBox?.amount).toFixed(
                        3
                      ) || "0"
                    : 0
                  }
              </Typography>
          </Box>
        </Box>
         {convertedValue == 0 ? (
        <Button className="modal-button" fullWidth >
          Review Order
        </Button>
        ) : (
        <Button className="modal-button" fullWidth onClick={() => setExchangeModalOpen(true)}>
          Review Order
        </Button>
           )}
      </Paper>

      <AccountSelectModal open={modalOpen} onClose={() => setModalOpen(false)}  
        selectedValue={selectedExchangeValue}
        activeToAccount={setToExchangeAccount}
        accountsList={accountList}
        ActiveAccountDetails={acctDetails}
        activeAccountBal={accountBalance}
        fromValue={fromValue}
        convertedValue={convertedValue}
        setFromValue={setFromValue}
        setConvertedValue={setConvertedValue}
        setToExchangeBox={setToExchangeBox}
        setActiveRate={setActiveRate}
        setCalCulateOpen={setCalCulateOpen}
        calCulateOpen={calCulateOpen}
        feeChargeAmount={feeChargeAmount}
        reviewFlag={reviewFlag}
      // onSelect={handleAccountSelect}
      />
     
    <CurrencyExchangeModal
      open={exchangeModalOpen}
      onClose={() => setExchangeModalOpen(false)}
      fromAmount={amount}
      fromCurrency={acctDetails?.currency}
      toCurrency={toExchangeBox?.currency}
      exchangeRate={activeRate}
      exchangedAmount={convertedValue}
      fee={feeChargeAmount}
      account={acctDetails}
      toAccount = {toExchangeAccount}
      onSubmit={(transaction) => {
        setTransactions(prev => [transaction, ...prev]);
        setSuccessMsg('Transaction submitted successfully!');
        setTimeout(() => setSuccessMsg(null), 3000);
      }}
      accountId={{ data: { id: user?.id, name: user?.name } }}
      toExchangeBox={toExchangeBox}
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

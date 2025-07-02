import { useEffect, useState } from 'react';
import {TextField, MenuItem, Typography, Box, Button, useTheme, Dialog, DialogTitle, DialogContent, CircularProgress} from '@mui/material';
import CountryDropdown from '@/components/CountryDropdown';
import CustomSelect from '@/components/CustomDropdown';
import CustomTextField from '@/components/CustomTextField';
import CustomInput from '@/components/CustomInputField';
import { loadStripe } from "@stripe/stripe-js";
import api from '@/helpers/apiHelper';
import { useFee } from '@/hooks/useFee';
import axios from 'axios';
import getSymbolFromCurrency from 'currency-symbol-map';
import { jwtDecode } from 'jwt-decode';
import { JwtPayload } from '@/types/jwt';
import AddMoneyRazorPay from '../Payment/AddMoneyRazorPay';
import { AddMoneyStripe } from '../Payment/Stripe/AddMoneyStripe';
import { Elements } from '@stripe/react-stripe-js';
const url = import.meta.env.VITE_NODE_ENV == "production" ? "api" : "api";

interface AddMoneyFormProps {
  accountChange: (value: string) => void;
  activeAccount: any;
  accountBalance: any;
  acctDetails: any;
  accountList: any;
  onClose: (value: string) => void;
}

const TransferOptions = [
  {
    label: 'Stripe',
    moreInfo: 'Supports USD, EUR, GBP, and more',
    value: 'stripe',
    img: 'stripe.png'
  },
  {
    label: 'UPI',
    moreInfo: 'Supports only INR transactions',
    value: 'upi',
    img: 'upi.png'
  },
];


const AddMoneyForm = ({ onClose, acctDetails,activeAccount }: AddMoneyFormProps) => {
  const stripePromise = loadStripe(
    `${import.meta.env.VITE_STRIPE_PRIVATE_KEY}`
  );
  const theme = useTheme();
  const [amount, setAmount] = useState<any>(0);
  const [currencyType, setCurrencyType] = useState('USD');
  const [currencyList, setCurrencyList] = useState([]);
  const [transferType, setTransferType] = useState('stripe');
  const [depositFee, setDepositFee] = useState<any>(0);
  const [convValue, setConvValue] =   useState<any>(0);
  const [displayRazorpay, setDisplayRazorpay] = useState(false);
  const [displayStripe, setdisplayStripe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orderDetails, setOrderDetails] = useState({
    orderId: null,
    currency: null,
    amount: null,
  });
  const finalAmount = amount ? parseFloat(amount) + depositFee : 0;
  const conversionAmount = finalAmount * 77.8;
  const DepositFeesd = useFee("Debit");
  useEffect(() => {
      const accountId = jwtDecode<JwtPayload>(
        localStorage.getItem("token") as string
      );
    getCurrencyList();
  }, []);

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
const HandleAmount = async (amt_val: any) => {
    setAmount(amt_val);
    var feeVal = 0;
    var feeType = "";

    if (DepositFeesd?.feeCommision) {
      feeVal = DepositFeesd?.feeCommision?.value;
      feeType = DepositFeesd?.feeCommision?.commissionType;
    }

    if (feeType == "percentage") {
      // @ts-ignore
      var feeCharge: number = (parseFloat(amt_val) * parseFloat(feeVal)) / 100;
    } else {
      // @ts-ignore
      var feeCharge: number = parseFloat(feeVal);
    }

    var minFeecharge =
      feeCharge >= DepositFeesd?.feeCommision?.minimumValue
        ? feeCharge
        : DepositFeesd?.feeCommision?.minimumValue;

    if (acctDetails?.currency != currencyType) {
      setAmount(amt_val);
      setDepositFee(minFeecharge);
      calCulateExChangeCurrencyValue(parseFloat(amt_val), minFeecharge);
    } else {
      setDepositFee(minFeecharge);
    }
  };
  const calCulateExChangeCurrencyValue = async (amt: any, valDeposit: any) => {
    console.log(valDeposit);
    const options = {
      method: "GET",
      url: "https://currency-converter18.p.rapidapi.com/api/v1/convert",
      params: {
        from: currencyType,
        to: acctDetails.currency,
        amount: 1,
      },
      headers: {
        "X-RapidAPI-Key": import.meta.env.VITE_RAPID_API_KEY,
        "X-RapidAPI-Host": import.meta.env.VITE_RAPID_API_HOST,
      },
    };

    try {
      const response = await axios.request(options);
      if (response.data.success) {
        setConvValue(response.data.result.convertedAmount * amt);
      }
    } catch (error) {
      console.error(error);
    }
  };
    const HandleCurrencyType = (val: any) => {
    setAmount(0);
    setDepositFee(0);
    setConvValue(0);
    setCurrencyType(val);
  };
    const optionsStripe = {
    mode: "payment",
    amount: (parseFloat(amount) + parseFloat(depositFee)) * 100,
    currency: currencyType.toString().toLowerCase(),
    appearance: {},
  };
  const AddMoney = async () => {
    if (transferType && currencyType && amount) {
      setDisplayRazorpay(false);
      setLoading(true);
      if (transferType == "upi") {
        setLoading(false);
        razorPay(amount, currencyType, onClose, setLoading);
      } else if (transferType == "bank-transfer") {
        setLoading(false);
        // AddMoneyBankTransfer();
      } else if (transferType == "stripe") {
        setLoading(false);
        setdisplayStripe(true);
      }
    }
  };
  const accountId = jwtDecode<JwtPayload>(
    localStorage.getItem("token") as string
  );
  const razorPay = async (
    amount: any,
    currency: any,
    onClose: any,
    setLoading: any
  ) => {
    try {
      const result = await api.post(`/${url}/v1/razorpay/createOrder`,{
        amount: (parseFloat(amount) + parseFloat(depositFee)) * 100,
        currency: currency,
      });
      if (result?.data?.order_id) {
          setOrderDetails({
            orderId: result?.data?.order_id,
            currency: result?.data?.currency,
            amount: result?.data?.amount,
          });
          setDisplayRazorpay(true);
          onClose(false);
          setLoading(false);
        }
    }
    catch (error) {
      console.error("Error in Razorpay payment:", error);
    }
  };
  const handleClose = () => {
    onClose(currencyType);
    setDepositFee(0);
    setAmount(0);
    setTransferType("");
    setCurrencyType("");
  };
  

  return (
    <Box display="flex" flexDirection="column" gap={2} mt={2} sx={{color:theme.palette.text.primary}}>
      <Box>
        <CountryDropdown
            label="Select Currency Type"
            countries={currencyList}
            value={currencyType}
            onChange={(e) => HandleCurrencyType(e.target.value as string)}
            size="small"
            showFlag={true}    
            showCurrency={true} 
            fullWidth
          />

      </Box>

      <Box>
        <CustomSelect
          label="Select Transfer Type"
          value={transferType}
          onChange={(e) => setTransferType(e.target.value as string)}
          options={TransferOptions}
          size="small"
          showFlag={true}  
          fullWidth
        />

      </Box>

      <Box>
         <CustomInput label="Amount" value={amount} onChange={(e) => HandleAmount(e.target.value)} fullWidth />
      </Box>

      <Box>
        <Typography variant="body2" color="text.primary">
          Deposit Fee: <strong>{getSymbolFromCurrency(currencyType)} {parseFloat(depositFee).toFixed(2)}</strong> &nbsp;
          Total: <strong>{getSymbolFromCurrency(currencyType)} {parseFloat(amount) + parseFloat(depositFee)}</strong> &nbsp;
          {acctDetails?.currency != currencyType && (
            <>
               Conversion: <strong>{getSymbolFromCurrency(acctDetails?.currency)} {parseFloat(convValue).toFixed(2)}</strong>
             </>
          )}
        </Typography>
      </Box>

      <Button className='modal-button'
        variant="contained"      
        onClick={() => AddMoney()}
      >
        Add Money
      </Button>
      {/*  */}
      {displayRazorpay && (
        <AddMoneyRazorPay
            amount={amount}
            currency={currencyType}
            orderId={orderDetails?.orderId}
            details={accountId?.data.name}
            account={activeAccount}
            acctDetails={acctDetails}
            convertedAmount={convValue}
            fee={depositFee}
            keyId={"rzp_test_TR6pZnguGgK8hQ"}
            keySecret={"vOOrz3WBt8g7053lAZWGHPnz"}
          />
      )}
          {displayStripe && (
            <Dialog
              fullWidth
              maxWidth={"sm"}
              open={true}
              onClose={handleClose}
              >
              <DialogTitle>Stripe</DialogTitle>
              <DialogContent>
                    {/* @ts-ignore */}
                <Elements stripe={stripePromise} options={optionsStripe}>
                  <AddMoneyStripe
                    notes="Stripe Payment for Add Money"
                    amount={parseFloat(amount) + parseFloat(depositFee)}
                    currency={currencyType}
                    userData={accountId?.data?.id}
                    account={activeAccount}
                    accountData={acctDetails}
                    convertedAmount={convValue}
                    fee={depositFee}
                  />
                </Elements>
              </DialogContent>
            </Dialog>
              )}
              {loading && (
                <CircularProgress
                  size={24}
                  sx={{
                    color: "black",
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    marginTop: "-12px",
                    marginLeft: "-12px",
                  }}
                />
              )}
      {/*  */}

    </Box>
  );
};

export default AddMoneyForm;

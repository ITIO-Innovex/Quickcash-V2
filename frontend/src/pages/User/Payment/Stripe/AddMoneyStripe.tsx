import axios from 'axios';
import React, {useState} from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import getSymbolFromCurrency from 'currency-symbol-map';
import { Backdrop, Box, CircularProgress } from '@mui/material';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import CustomButton from '@/components/CustomButton';

const AddMoneyStripe = ({...props}) => {

  const stripe = useStripe();
  const navigate = useNavigate();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState<any>(null);
  const [stripeLoading,setStripeLoading] = React.useState<boolean>(false);
  const url = import.meta.env.VITE_NODE_ENV == "production" ? 'api' : 'api';

  const handleSubmit = async (event:any) => {
    console.log("Submit button clicked",elements);
    event.preventDefault();

    setStripeLoading(true);  
     if (elements == null) {
      console.log("Elements not loaded");
      setStripeLoading(false);  
      return;
    }
  
    const {error: submitError} = await elements.submit();
    
    if (submitError) {
      setErrorMessage(submitError?.message);
      setStripeLoading(false);
      return;
    }
  
    await axios.post(`/${url}/v1/stripe/create-intent`,{
      amount: props?.amount,
      account: props?.account,
      user: props?.userData,
      convertedAmount: props?.convertedAmount,
      fee: props?.fee,
      currency: props?.currency.toString().toLowerCase(),
      from_currency: props?.accountData?.currency,
      to_currency: props?.currency
    })
   .then(async result => {
    if(result.data.status == 201) {
      axios.post(`/${url}/v1/stripe/confirmPayment`, {
        status: 'Pending',
        userData: props?.userData, 
        notes: props?.notes
      })
      .then(async result2 => {
        setStripeLoading(true);  
        if(result2.data.status == 201) {
          await stripe?.confirmPayment({
            elements,
            clientSecret: result.data.data.client_secret,
            confirmParams: {
             return_url: `${import.meta.env.VITE_APP_URL}/response-fetch`
            }
         })
         setStripeLoading(false);
        }
      })
      .catch(error => {
        console.log(error);
      })
     }
    })
    .catch(error => {
      setStripeLoading(false);
      console.log("stripe error", error.response.data.raw.message);
      alertnotify(error.response.data.raw.message, "error");
    })
  };

  const alertnotify = (text:any,type:any) => {
    if(type == "error") {
      toast.error(text, {
        position: "top-center",
        autoClose: 6000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      })
    } else {
      toast.success(text, {
        position: "top-center",
        autoClose: 1900,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      })
    }
  }

  const handleClose = () => {
    setStripeLoading(false);
  }

  return (
    <>
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={stripeLoading}
        onClick={handleClose}
      >
       <CircularProgress color="inherit"/>
        Processing please wait...
     </Backdrop>
     <Box sx={{background: `lavender`, padding: '10px', fontWeight: '900', fontFamily: 'mono', fontSize: '25px'}}>
      Amount : {getSymbolFromCurrency(props?.currency)}{props?.amount}
     </Box>
     <form>
      <PaymentElement />
      <br />
      <CustomButton onClick={(e) => handleSubmit(e)} disabled={!stripe || !elements}>
       Pay
      </CustomButton> &nbsp;
      <CustomButton onClick={() => navigate('/')}>Cancel</CustomButton>
      {errorMessage && <div>{errorMessage}</div>}
      </form>
    </>
  );
};
  
export { AddMoneyStripe };
  
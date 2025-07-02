import axios from 'axios';
import React, {useState} from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { Backdrop, Box, CircularProgress } from '@mui/material';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import CustomButton from '@/components/CustomButton';

const CheckoutForm = ({...props}) => {
  
  const stripe = useStripe();
  const navigate = useNavigate();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState<any>(null);
  const [stripeLoading,setStripeLoading] = React.useState<boolean>(false);
  const url = import.meta.env.VITE_NODE_ENV == "production" ? 'api' : 'api';

  const handleSubmit = async (event:any) => {
    event.preventDefault();
    setStripeLoading(true);  
     if (elements == null) {
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
      amount: props?.finalAmount,
      currency: props?.currency.toString().toLowerCase()   
    })
   .then(async result => {
    if(result.data.status == 201) {
      axios.post(`/${url}/v1/stripe/confirmPayment`, {
        status: 'Pending',
        orderDetails: result?.data?.data,
        userData: props?.details, 
        notes: props?.notes,
        pendingAmount: props?.pendingAmount,
        payAmount: props?.finalAmount,
        paymentType: props?.paymentType
      })
      .then(async result2 => {
        setStripeLoading(true);  
        if(result2.data.status == 201) {
          await stripe?.confirmPayment({
            elements,
            clientSecret: result.data.data.client_secret,
            confirmParams: {
             return_url: `https://quickcash.oyefin.com/invoice-section`
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
        autoClose: 1900,
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
     <Box sx={{background: 'lavender', padding: '10px', fontWeight: '900', fontFamily: 'mono', fontSize: '25px'}}>
      Amount : {props?.details?.currency_text}{props?.finalAmount}
     </Box>
     <form onSubmit={handleSubmit}>
      <PaymentElement />
      <br />
      <CustomButton type="submit" disabled={!stripe || !elements}>
       Pay
      </CustomButton> &nbsp;
      <CustomButton onClick={() => navigate('/invoice-section')}>Cancel</CustomButton>
      {errorMessage && <div>{errorMessage}</div>}
      </form>
    </>
  );
};
  
export { CheckoutForm };
  
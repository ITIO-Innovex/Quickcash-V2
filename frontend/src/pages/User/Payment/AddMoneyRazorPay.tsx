import Axios from 'axios';
import crypto from 'crypto-js';
import { useAppToast } from '@/utils/toast'; 
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import getSymbolFromCurrency from 'currency-symbol-map';
import { jwtDecode } from 'jwt-decode';

// Function to load script and append in DOM tree.
const loadScript = (src:any) => new Promise((resolve) => {
  const script = document.createElement('script');
  script.src = src;
  script.onload = () => {
    console.log('razorpay loaded successfully');
    resolve(true);
  };
  script.onerror = () => {
    console.log('error in loading razorpay');
    resolve(false);
  };
  document.body.appendChild(script);
});
interface razorPayDetails {
  details: [any][any];
  account: any;
  orderId:React.ReactNode;
  keyId:any;
  keySecret:any;
  currency:any;
  amount:Number
  fee: any;
  acctDetails: [any][any];
  convertedAmount:Number
}  

interface JwtPayload {
  sub: string;
  role: string;
  iat: number;
  exp: number;
  data: {
    defaultcurr: string;
    email: string;
    id: string;
    name: string;
    type: string;
  };
}

const AddMoneyRazorPay = ({...props}:razorPayDetails) => {
const toast = useAppToast(); 
  const paymentId = useRef(null);
  const paymentMethod = useRef(null);

  const displayRazorpay = async (options:any) => {
    const res = await loadScript(
      'https://checkout.razorpay.com/v1/checkout.js',
    );

    if (!res) {
      console.log('Razorpay SDK failed to load. Are you online?');
      return;
    }

    const rzp1 = new window.Razorpay(options);

    rzp1.on('payment.submit', (response:any) => {
      paymentMethod.current = response.method;
    });

    rzp1.on('payment.failed', (response:any) => {
      paymentId.current = response.error.metadata.payment_id;
    });

    rzp1.open();
  };

  const navigate = useNavigate();
  const url = import.meta.env.VITE_NODE_ENV == "production" ? 'api' : 'api';
  const handlePayment = async (status:any, orderDetails: {}) => {
    const accountId = jwtDecode<JwtPayload>(localStorage.getItem('token') as string);
    await Axios.post(`/${url}/v1/razorpay/capture/money`,
    {
      user:accountId?.data?.id,
      status,
      orderDetails:orderDetails,
      userData:props?.details, 
      account: props?.account,
      acctDetails: props?.acctDetails,
      amount:props?.amount,
      amountText: `${getSymbolFromCurrency(props?.currency)}${props?.amount}`,
      fee: props?.fee,
      convertedAmount: props?.convertedAmount,
      conversionAmountText: `${getSymbolFromCurrency(props?.acctDetails?.currency)}${props?.convertedAmount}`,
      rec_currency: props?.currency
    }).then(result => {
       if(status == "succeeded") {
        toast.success(result.data.message);
        setTimeout(() => {
          window.location.href = "/dashboard";
        },500);
       }
       if(status == "Cancelled") {
        window.location.href = "/dashboard";
       }
    })
    .catch(error => {
      console.log(error);
    })
  };

  interface abc {
    paymentReason: any;
    field:any; 
    step:any;
    code:any;
  }

  const options = {
    key: props?.keyId, // key id from props
    amount: props?.amount, // Amount in lowest denomination from props
    currency:props?.currency, // Currency from props.
    name: props?.details?.userDetails?.name, // Title for your organization to display in checkout modal
    // image, // custom logo  url
    order_id: props?.orderId, // order id from props
    // This handler menthod is always executed in case of succeeded payment
    config: {
      display: {
        blocks: {
          banks: {
            name: 'Pay via UPI',
            instruments: [
            {
              method: 'upi'
            }
          ],
        },
      },
      sequence: ['block.banks'],
      preferences: {
      show_default_blocks: false,
    },
    },
    },
    handler: (response:any) => {
      paymentId.current = response.razorpay_payment_id;
      // Most important step to capture and authorize the payment. This can be done of Backend server.
      const succeeded = crypto.HmacSHA256(`${props?.orderId}|${response.razorpay_payment_id}`, props?.keySecret).toString() === response.razorpay_signature;

      if (succeeded) {
        handlePayment('succeeded', {
          orderId:props?.orderId,
          paymentId,
          signature: response.razorpay_signature,
        });
      } else {
        handlePayment('failed', {
          odrerId:props?.orderId,
          paymentId: response.razorpay_payment_id,
        });
      }
    },
    modal: {
      confirm_close: true,
      ondismiss: async (reason:any) => {
        console.log("reason", reason);
        //const {reason: paymentReason, field, step, code} = reason && reason.error ? reason.error : {};
        // Reason 1 - when payment is cancelled. It can happend when we click cross icon or cancel any payment explicitly. 
        if (reason === undefined) {
          console.log('cancelled');
          handlePayment('Cancelled',{});
        } 
        // Reason 2 - When modal is auto closed because of time out
        else if (reason === 'timeout') {
          console.log('timedout');
          handlePayment('timedout',{});
        } 
        // Reason 3 - When payment gets failed.
        else {
          console.log('failed');
          handlePayment('failed', {});
        }
      },
    },
    // This property allows to enble/disable retries.
    // This is enabled true by default. 
    retry: {
      enabled: false,
    },
    timeout: 900, // Time limit in Seconds
    theme: {
      color: '', // Custom color for your checkout modal.
    },
  };

  useEffect(() => {
    displayRazorpay(options);
  }, []);

  return null;
};

export default AddMoneyRazorPay;

declare global {
  interface Window {
    Razorpay?: any;
  }
}
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useAppToast } from '@/utils/toast'; 
import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import getSymbolFromCurrency from 'currency-symbol-map';
import { JwtPayload } from '@/types/jwt';

export default function ResponseStripe() {
  const navigate = useNavigate();
  const toast = useAppToast(); 
  const url = import.meta.env.VITE_NODE_ENV === 'production' ? 'api' : 'api';
  const search = useLocation().search;
  const accountId = jwtDecode<JwtPayload>(localStorage.getItem('token') as string);

  const isProcessed = useRef(false); // Prevents duplicate processing

  useEffect(() => {
    const id = new URLSearchParams(search).get("payment_intent");
    const OrderStatus = new URLSearchParams(search).get("redirect_status");

    if (id && OrderStatus && !isProcessed.current) {
      isProcessed.current = true; // Set to true to prevent re-entry
      getData(id, OrderStatus);
    }
  }, []);

  const getData = async (val: any, stats: any) => {
    try {
      const fetchRes = await axios.post(`/${url}/v1/stripe/fetch`, {
        transaction_id: new URLSearchParams(search).get("payment_intent"),
      });

      if (fetchRes.data.status === 201) {
        const meta = fetchRes.data.data.metadata;

        const completeRes = await axios.post(`/${url}/v1/stripe/complete-addmoney`, {
          user: accountId?.data?.id,
          status: stats,
          orderDetails: val,
          userData: accountId?.data?.name,
          account: meta?.account,
          amount: parseFloat(meta?.amount),
          fee: parseFloat(meta?.fee),
          amountText: meta?.amount ? `${getSymbolFromCurrency(meta?.from_currency)}${meta?.amount}` : '',
          from_currency: meta?.from_currency,
          to_currency: meta?.to_currency,
          convertedAmount: parseFloat(meta?.convertedAmount),
          conversionAmountText: meta?.convertedAmount ? `${getSymbolFromCurrency(meta?.to_currency)}${meta?.convertedAmount}` : ''
        });

        if (completeRes.data.status === 201) {
          toast.success("Payment has been done Successfully");
          setTimeout(() => navigate('/dashboard'), 100);
        }
      }
    } catch (error) {
      console.error("Error in processing Stripe payment:", error);
    }
  };

  return (
    <div className='yo'>
      <div className="card">
        Stripe Payment is processing, please wait ...
      </div>
    </div>
  );
}

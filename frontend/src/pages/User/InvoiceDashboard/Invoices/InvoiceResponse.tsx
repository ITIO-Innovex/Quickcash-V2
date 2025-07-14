import axios from 'axios';
import React, { useEffect } from 'react';
import { Typography } from '@mui/material';
import { Link, useParams } from 'react-router-dom';
import getSymbolFromCurrency from 'currency-symbol-map';

export default function ResponseInvoice() {

  const params = useParams();
  const [details,setDetails] = React.useState<any>('');
  const url = import.meta.env.VITE_NODE_ENV == "production" ? 'api' : 'api';
  
  useEffect(() => {
    getStatus();
  },[params?.id]);

  const getStatus = async () => {
    await axios.get(`/${url}/v1/itiopay/inv/status/${params?.id}`)
    .then(result => {
      if(result.data.status == 201) {
        if(result.data.data) {
          setDetails(result.data.others);
          saveData(result.data.others);
        }
      }
    })
    .catch(error => {
      console.log(error);
    })
  }

  const saveData = async (val:any) => {
    console.log(val);
    await axios.post(`/${url}/v1/itiopay/inv/savedata`, {
      "reference": val?.reference,
      "order_status": val?.order_status,
      "transID": val?.transID,
      "response": val?.response,
      "tdate": val?.tdate,
      "bill_amt": val?.bill_amt,
      "bill_currency": val?.bill_currency,
      "descriptor": val?.descriptor,
      "status": val?.status
    })
    .then(result => { console.log(result) })
    .catch(error => {
      console.log(error);
    })
  }

  function Copyright(props:any) {
    return (
      <Typography variant="body2" color="text.secondary" align="center" {...props}>
        {'Copyright © '}
        <Link color="inherit" to="/myapp/web" style={{textDecoration: 'none'}}>
          Quick Cash
        </Link>{' '}
        {new Date().getFullYear()}
        {'.'}
      </Typography>
    );
  }

  return (
    <>
      <div className='yo'>
       <div className="card">
        <div style={{borderRadius: "200px", height: "200px" , width: "200px" , background: "#F8FAF5" , margin:"0 auto"}}>
          {details?.order_status == 9 && <i className="checkmark1">✓</i>}
          {details?.order_status == 0 && <i className="checkmark1">✓</i>}
          {details?.order_status == 2 && <i className="checkmark1">X</i>}
          {details?.order_status == 22 && <i className="checkmark1">X</i>}
          {details?.order_status == 23 && <i className="checkmark1">X</i>}
          {details?.order_status == 24 && <i className="checkmark1">X</i>}
        </div>
        <h1>{details?.status}</h1> 
        <p>We received your payment,<br/> we'll be in touch shortly!</p>
        <br />
        <p>Reference : {details?.reference}</p>
        <p>Amount paid: {getSymbolFromCurrency(details?.bill_currency)}{details?.bill_amt}</p>
      </div>
      </div>
      <Copyright sx={{ mt: 2, mb: 4 }} />
    </>
  )
}

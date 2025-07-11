import axios from 'axios';
import CryptoJS from 'crypto-js';
import { toast } from 'react-toastify';
import Card from 'react-credit-cards-2';
import React, { useEffect } from 'react';
import getSymbolFromCurrency from 'currency-symbol-map';
import 'react-credit-cards-2/dist/es/styles-compiled.css';
import { Grid, TextField, Typography } from '@mui/material';
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Backdrop, Box,CardContent, CircularProgress, Stack } from '@mui/material';
import CustomButton from '@/components/CustomButton';
import api from '@/helpers/apiHelper';

function Copyright(props:any) {
  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      {'Copyright © '}
      <Link color="inherit" to="/" style={{textDecoration: 'none'}}>
        Quick Cash
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

export default function InvoiceEcommercePayment() {
    const location = useLocation();

    // Encrypt
    var ciphertext = location?.search?.replace("?code=","");
    const url = import.meta.env.VITE_NODE_ENV == "production" ? 'api' : 'api';
    // Decrypt
    var bytes  = CryptoJS.AES.decrypt(ciphertext, 'ganesh');
    var originalText = bytes.toString(CryptoJS.enc.Utf8);
    const navigate = useNavigate();
    const [status,setStatus] = React.useState<any>('');
    const [amount,setAmount] = React.useState<number>(0);
    const [currency,setCurrency] = React.useState<any>('');
    const [dueDate,setDueDate] = React.useState<any>('');
    const [userid,setuserid] = React.useState<any>('');
    const [othersInfo,setothersInfo] = React.useState<any>('');
    const [errorMsg,setErrorMsg] = React.useState<any>('');
    const [ErrorsData,setErrorsData] = React.useState<any>('');

    useEffect(() => {
      getAmount();
    },[originalText])
  
    const [state, setState] = React.useState({
      number: '',
      expiry: '',
      cvc: '',
      name: '',
      focus: '',
      zipcode: ''
    }); 
    
    const getAmount = async () => {
      await api.get(`/${url}/v1/ecommerce/invoice-frontend/${originalText}`)
      .then(result => {
        if(result.data.status == 201) {
          setothersInfo(result?.data?.data?.othersInfo);
          setuserid(result?.data?.data?.userid);
          setAmount(parseFloat(result?.data?.data?.dueAmount));
          setDueDate(result.data.data.due_date);
          setCurrency(result.data.data.currency);
          setStatus(result.data.data.status);
        }
      })
      .catch(error => {
        setErrorMsg(error.response.data.message);
        setErrorsData(error?.response?.data?.data);
      })
    }

    const [openResponse, setOpenResponse] = React.useState(false);
    const handleCloseResponse = () => {
      setOpenResponse(false);
    };

    const checkStatus = async (val:any) => {
      setOpenResponse(true);
      await api.get(`/${url}/v1/itiopay/inv/status/${val}`)
      .then(result => {
        if(result.data.status == 201) {
          if(result.data.data == 0) {
            // Pending
          } else if(result.data.data == 1) {
            // Approved
            navigate(`/inv-response/${val}`);
          } else if(result.data.data == 2) {
            // Declined
            navigate(`/inv-response/${val}`);
          } else if(result.data.data == 9) {
            // Test
            navigate(`/inv-response/${val}`);
          } else if(result.data.data == 22) {
            // Expired
            navigate(`/inv-response/${val}`);
          } else if(result.data.data == 23) {
            // Cancelled
            navigate(`/inv-response/${val}`);
          } else if(result.data.data == 24) {
            // Failed
            navigate(`/inv-response/${val}`);
          }
        }
      })
      .catch(error => {
        toast.error(error.response.data.data);
        console.log(error);
      })
    }
  
    const HandleSubmitDetails = async () => {
      if(state.name == "" || state.number == "" || state.expiry == "" || state.cvc == "" || state.zipcode == "") {
        alert("Please fill all of the fields");
      } else {
        setOpenResponse(true);
        await api.post(`/${url}/v1/itiopay/inv/pay`, {
          userid:userid,
          othersInfo:othersInfo,
          reference: originalText,
          amount: amount,
          currency: currency,
          cardsDetails: state
        })
        .then(result => {
          if(result.data.status == 201) {
            localStorage.setItem('transID', result.data.transID);
            window.open(`${result.data.data}`, '_blank');
            var timesRun = 0;
            var interval = setInterval(function(){
            timesRun += 1;
            if(timesRun === 20){
              clearInterval(interval);
            }
            checkStatus(result.data.transID);
            }, 2000); 
          }
        })
        .catch(error => {
          toast.error(error.response.data.data);
          console.log(error);
        })
      }
    }

  const handleInputChange = (evt:any) => {
    const { name, value } = evt.target;
    if(name == "expiry") {
      const bvalue = formatExpirationDate(value);
      setState((prev) => ({ ...prev, [name]: bvalue }));
    } else {
      setState((prev) => ({ ...prev, [name]: value }));
    }
  }
  
  function clearNumber(value = "") {
    return value.replace(/\D+/g, "");
  }
  
  function formatExpirationDate(value:any) {
    const clearValue = clearNumber(value);
  
    if (clearValue.length >= 3) {
      return `${clearValue.slice(0, 2)}/${clearValue.slice(2, 4)}`;
    }
    
    return clearValue;
  }
  
  const handleInputFocus = (evt:any) => {
    setState((prev) => ({ ...prev, focus: evt.target.name }));
  }   

  return (
    <div style={{marginTop: '79px'}}>
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={openResponse}
        onClick={handleCloseResponse}
      >
        <CircularProgress color="inherit" /> Processing...
      </Backdrop>
      {
        (status == "unpaid" || status == "partial") &&
         <Grid container spacing={2}>
          <Grid item xs={1}></Grid>
          <Grid item xs={12} sm={5}>
            <Grid sx={{ borderRadius: '12px', height: '100%'}}>
             <CardContent>
             <Typography variant='h3' color="text.secondary" sx={{ fontFamily: 'mono'}} gutterBottom>
               Payment Summary
             </Typography>
            <Grid sx={{display:'flex', flexDirection: 'column', justifyContent: 'space-between'}}>
              <Grid sx={{marginTop: '12px'}}>
                <Typography variant='h5' sx={{ fontFamily: 'mono'}}>Amount: {getSymbolFromCurrency(currency)}{amount}</Typography>
                <Typography variant='h5' sx={{ fontFamily: 'mono'}}>Due Date: {dueDate}</Typography>
              </Grid>
            </Grid>
           </CardContent>
          </Grid>
         </Grid>
         <Grid item xs={12} sm={5}>
          <CardContent
            component={Stack}
            spacing={3}
            sx={{ height: "auto", boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.3)',justifyContent: "center", padding: '29px', borderRadius: '12px' }}
          >
          <Card
            number={state.number}
            expiry={state.expiry}
            cvc={state.cvc}
            name={state.name}
          />
           <TextField
             label="Name"
             name="name"
             type="text"
             size="medium"
             InputLabelProps={{
              shrink: true,
              style: {
                color: `black`
              }
             }}
             value={state.name}
             onChange={handleInputChange}
             onFocus={handleInputFocus}
             placeholder='Name'
           />
            
            <TextField
              label="Card Number"
              name="number"
              type="tel"
              size="medium"
              InputLabelProps={{
              shrink: true,
               style: {
               color: `black`
              }
              }}
              inputProps={{ maxLength: 16 }}
              value={state.number}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
            />
                
            <Box sx={{ display: "flex", gap: 3 }}>
              <TextField
                fullWidth
                label="CVV"
                name="cvc"
                type="tel"
                size="medium"
                InputLabelProps={{
                shrink: true,
                style: {
                 color: `black`,
                }
                }}
                value={state.cvc}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                inputProps={{ maxLength: 3 }}
              />
                
              <TextField
                fullWidth
                label="Expiry Date"
                name="expiry"
                type="tel"
                size="medium"
                InputLabelProps={{
                shrink: true,
                style: {
                 color: `black`
                }
                }}
                value={state.expiry}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                inputProps={{ maxLength: 5 , min: `${new Date().toISOString().split('T')[0]}` }}
              />
    
              <TextField
                fullWidth
                label="Postal Code"
                name="zipcode"
                type="tel"
                size="medium"
                InputLabelProps={{
                shrink: true,
                style: {
                 color: `black`
                }
                }}
                value={state.zipcode}
                onChange={handleInputChange}
                inputProps={{ maxLength: 6 }}
              />
                
            </Box>
    
              <CustomButton size="large" sx={{ fontWeight: "bold" }} onClick={() => HandleSubmitDetails()}>Proceed to pay</CustomButton>
    
              </CardContent>
         </Grid>
         </Grid>
        }
        {
          status == "pending" || status == "Test" || status == "approved" || status == "paid" ?
          <Grid sx={{display:'flex',flexDirection: 'row', justifyContent: 'center', padding: '16px', fontSize: '30px'}}>
            <div className="card"> 
              <div className="header"> 
               <div className="content">
                <span className="title">Payment Already done</span> 
                <p className="message">Thank you for payment.</p> 
                </div> 
                <div className="actions">
                  <button type="button" className="history">Neo Connect</button> 
                </div> 
              </div> 
            </div>
          </Grid>
          :
          null
        }
        {
          errorMsg ? 
          <>
            <Grid sx={{display:'flex',flexDirection: 'row', justifyContent: 'center', padding: '16px', fontSize: '30px'}}>
              <div className="card"> 
                <div className="header"> 
                <div className="content">
                  <span className="title">Link has been expired</span> 
                  <p className="message">
                  {
                    ErrorsData ?
                    `Due date was on ${ErrorsData?.due_date}`
                    :
                    null
                  }  
                  </p> 
                  </div> 
                  <div className="actions">
                    <button type="button" className="history">Neo Connect</button> 
                  </div> 
                </div> 
              </div>
            </Grid>
          </>
          : null
        }
      <Copyright sx={{ mt: 8, mb: 4 }} />
    </div>
  )
}

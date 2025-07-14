import axios from 'axios';
import Card from 'react-credit-cards-2';
import React, { useEffect } from 'react';
import getSymbolFromCurrency from 'currency-symbol-map';
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import 'react-credit-cards-2/dist/es/styles-compiled.css';
import { Grid, TextField, Typography } from '@mui/material';
import { Backdrop, Box,CardContent, CircularProgress, Stack } from '@mui/material';

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

export default function QuotesView() {

  const params = useParams();
  const navigate = useNavigate();
  const [status,setStatus] = React.useState<any>('');
  const [errorMsg,setErrorMsg] = React.useState<any>('');

  const url = import.meta.env.VITE_NODE_ENV == "production" ? 'api' : 'api';
 
  const [openResponse, setOpenResponse] = React.useState(false);
  
  const handleCloseResponse = () => {
    setOpenResponse(false);
  };

  useEffect(() => {
    checkStatus(params?.id,params?.type);
  },[params?.id]);

  const [dueDate,setDueDate] = React.useState<any>('');

  const [statusUpdate,setStatusUpdate] = React.useState<any>('');

  const checkStatus = async (quoteNumber:any,statusType:any) => {
    setOpenResponse(true);
    await axios.get(`/${url}/v1/quote/check-status/${quoteNumber}`)
    .then(result => {
      if(result.data.status == 201) {
        setDueDate(result?.data?.dueDate);
        setStatusUpdate(result?.data?.type);
        setStatus(result?.data?.data);
        if(result?.data?.data == "live") {
          saveDataQuote(quoteNumber,statusType);
        } else {
          setErrorMsg(true);
          setOpenResponse(false);
        }
      }
    })
    .catch(error => {
      console.log(error);
    });
  }

  const saveDataQuote = async (quoteNumber:any,statusType:any) => {
    await axios.patch(`/${url}/v1/quote/status/${quoteNumber}`,{
      "status": statusType
    })
    .then(result => {
      if(result.data.status == 201) {
        setOpenResponse(false);
      }
    })
    .catch(error => {
      console.log(error);
    });
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
        (status == "live" && (params?.type == "accept" || params?.type == "reject")) &&
         <Grid container spacing={2}>
          <Grid item xs={1}></Grid>
           <Grid item xs={12} sm={12}>
           <Grid sx={{display:'flex',flexDirection: 'row', justifyContent: 'center', padding: '16px', fontSize: '30px'}}>
              <div className="card"> 
                <div className="header"> 
                <div className="content">
                  <span className="title">Your response has been saved</span> 
                  </div> 
                  <div className="actions">
                    <a href='/' className="history" style={{ textDecoration: 'none' }}>Quick Cash</a> 
                  </div> 
                </div> 
              </div>
            </Grid>
         </Grid>
         </Grid>
        }
        {
          statusUpdate == "converted" || statusUpdate == "accept" || statusUpdate == "reject" ?
          <Grid sx={{display:'flex',flexDirection: 'row', justifyContent: 'center', padding: '16px', fontSize: '30px'}}>
            <div className="card"> 
              <div className="header"> 
               <div className="content">
                <p className="message">Link has been expired</p> 
                </div> 
                <div className="actions">
                  <a href='/' className="history" style={{ textDecoration: 'none' }}>Quick Cash</a> 
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
                    dueDate ?
                    `Due date was on ${dueDate}`
                    :
                    null
                  }  
                  </p> 
                  </div> 
                  <div className="actions">
                    <a href='/' className="history" style={{ textDecoration: 'none' }}>Quick Cash</a> 
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

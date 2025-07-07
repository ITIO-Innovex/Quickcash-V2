import axios from 'axios';
import { useAppToast } from '@/utils/toast'; 
import React, { useEffect } from 'react';
import { styled } from '@mui/material/styles';
import { Box, Grid, TextField } from '@mui/material';
import Switch, { SwitchProps } from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import CustomButton from '@/components/CustomButton';

const IOSSwitch = styled((props: SwitchProps) => (
  <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
  ))(({ theme }) => ({
    width: 42,
    height: 26,
    padding: 0,
    '& .MuiSwitch-switchBase': {
      padding: 0,
      margin: 2,
      transitionDuration: '300ms',
    '&.Mui-checked': {
      transform: 'translateX(16px)',
      color: '#fff',
       '& + .MuiSwitch-track': {
        backgroundColor: theme.palette.mode === 'dark' ? '#2ECA45' : '#65C466',
        opacity: 1,
        border: 0,
      },
      '&.Mui-disabled + .MuiSwitch-track': {
        opacity: 0.5,
      },
    },
    '&.Mui-focusVisible .MuiSwitch-thumb': {
      color: '#33cf4d',
      border: '6px solid #fff',
    },
    '&.Mui-disabled .MuiSwitch-thumb': {
      color:
        theme.palette.mode === 'light'
          ? theme.palette.grey[100]
          : theme.palette.grey[600],
    },
     '&.Mui-disabled + .MuiSwitch-track': {
      opacity: theme.palette.mode === 'light' ? 0.7 : 0.3,
     },
    },
    '& .MuiSwitch-thumb': {
      boxSizing: 'border-box',
      width: 22,
      height: 22,
    },
    '& .MuiSwitch-track': {
      borderRadius: 26 / 2,
      backgroundColor: theme.palette.mode === 'light' ? '#E9E9EA' : '#39393D',
      opacity: 1,
      transition: theme.transitions.create(['background-color'], {
        duration: 500,
      }),
    },
  }));

export default function AdminPayment() {

  const [itio_key,setItioKey] = React.useState<any>('');
  const [razor_key,setRazorKey] = React.useState<any>('');  
  const [stripe_key,setStripeKey] = React.useState<any>('');  
  const [razor_secret,setRazorSecret] = React.useState<any>('');
  const [itio_store_id,setItioStoreId] = React.useState<any>(''); 
  const [paypal_secret,setPaypalSecret] = React.useState<any>(''); 
  const [stripe_secret,setStripeSecret] = React.useState<any>(''); 
  const [itio_status,setItioStatus] = React.useState<boolean>(false); 
  const [razor_status,setRazorStatus] = React.useState<boolean>(false);
  const [paypal_client_id,setPaypalClientId] = React.useState<any>(''); 
  const [paypal_status,setPaypalStatus] = React.useState<boolean>(false);
  const [stripe_status,setStripeStatus] = React.useState<boolean>(false);
  const url = import.meta.env.VITE_NODE_ENV == "production" ? 'api' : 'api';
  useEffect(() => {
    getDetails();
  },[]);   
  const toast = useAppToast(); 
  const getDetails = async () => {
    axios.get('/${url}/v1/admin/paymentSetting/list',{
     headers: {
      'Authorization': `Bearer ${localStorage.getItem('admintoken')}`
     }
    })
    .then(result => {
      if(result.data.status == 201) {
        setItioKey(result.data.data[0].itio_key);
        setRazorKey(result.data.data[0].razor_key);
        setStripeKey(result.data.data[0].stripe_key);
        setRazorSecret(result.data.data[0].razor_secret);
        setItioStoreId(result.data.data[0].itio_store_id);
        setPaypalSecret(result.data.data[0].paypal_secret);
        setStripeSecret(result.data.data[0].stripe_secret);
        setItioStatus(result.data.data[0].itio_status);
        setRazorStatus(result.data.data[0].razor_status);
        setPaypalClientId(result.data.data[0].paypal_client_id);
        setPaypalStatus(result.data.data[0].paypal_status);
        setStripeStatus(result.data.data[0].stripe_status);
      }
    })
    .catch(error => {
      console.log(error);
    })
  }

  const HandleUpdateDetails = async () => {
    await axios.post(`/${url}/v1/admin/paymentSetting/add`, {
      itio_key, 
      razor_key,
      stripe_key,
      razor_secret,
      itio_store_id,
      paypal_secret,
      stripe_secret,
      itio_status,
      razor_status,
      paypal_client_id,
      paypal_status,
      stripe_status
    },
    {
      headers: {
       'Authorization': `Bearer ${localStorage.getItem('admintoken')}`
      }
    })
    .then(result => {
      if(result.data.status == 201) {
        toast.success(result.data.message);
      }
    })
    .catch(error => {
      console.log(error);
      toast.error(error.response.data.message);
    })
  }

  return (
    <>
      <Box sx={{ display: 'flex',fontFamily: 'mono',flexDirection: 'column',borderRadius: '.5rem',p: '10px',marginLeft: {md: '7%'},background: 'white',width: {lg: '89%'} }}> 
       <Grid container spacing={5}>
        <Grid item xs={12} sm={4}>
          <label style={{fontWeight: '700'}}>Stripe Key:</label>
          <TextField
            required
            id="stripe__key"
            name="stripe__key"
            fullWidth
            value={stripe_key}
            onChange={(e) => setStripeKey(e.target.value)}
            sx={{border:'1px solid silver', borderRadius: '9px'}}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <label style={{fontWeight: '700'}}>Stripe Secret:</label>
          <TextField
            required
            id="stripe__secret"
            name="stripe__secret"
            fullWidth
            value={stripe_secret}
            onChange={(e) => setStripeSecret(e.target.value)}
            sx={{border:'1px solid silver', borderRadius: '9px'}}
          />
        </Grid>
        <Grid item xs={12} sm={4} sx={{marginTop: '30px'}}>
          <FormControlLabel
            control={<IOSSwitch checked={stripe_status} color="primary" sx={{ m: 1 }}  />}
            label="Stripe"
            onChange={() => setStripeStatus(!stripe_status)}
            labelPlacement="end"
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <label style={{fontWeight: '700'}}>Paypal Client ID:</label>
          <TextField
            required
            id="paypal__id"
            name="paypal__id"
            fullWidth
            value={paypal_client_id}
            onChange={(e) => setPaypalClientId(e.target.value)}
            sx={{border:'1px solid silver', borderRadius: '9px'}}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <label style={{fontWeight: '700'}}>Paypal Secret:</label>
          <TextField
            required
            id="paypal__secret"
            name="paypal__secret"
            fullWidth
            value={paypal_secret}
            onChange={(e) => setPaypalSecret(e.target.value)}
            sx={{border:'1px solid silver', borderRadius: '9px'}}
          />
        </Grid>
        <Grid item xs={12} sm={4} sx={{marginTop: '30px'}}>
          <FormControlLabel
           value="Paypal"
           control={<IOSSwitch checked={paypal_status} color="primary" sx={{ m: 1 }} />}
           label="Paypal"
           onChange={() => setPaypalStatus(!paypal_status)}
           labelPlacement="end"
         />
        </Grid>

        <Grid item xs={12} sm={4}>
          <label style={{fontWeight: '700'}}>Razorpay Key:</label>
          <TextField
            required
            id="razor__key"
            name="razor__key"
            fullWidth
            value={razor_key}
            onChange={(e) => setRazorKey(e.target.value)}
            sx={{border:'1px solid silver', borderRadius: '9px'}}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <label style={{fontWeight: '700'}}>Razorpay Secret:</label>
          <TextField
            required
            id="razor__secret"
            name="razor__secret"
            fullWidth
            value={razor_secret}
            onChange={(e) => setRazorSecret(e.target.value)}
            sx={{border:'1px solid silver', borderRadius: '9px'}}
          />
        </Grid>
        <Grid item xs={12} sm={4} sx={{marginTop: '30px'}}>
          <FormControlLabel
           value="Razorpay"
           control={<IOSSwitch checked={razor_status} color="primary" sx={{ m: 1 }} />}
           label="Razorpay"
           onChange={() => setRazorStatus(!razor_status)}
           labelPlacement="end"
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <label style={{fontWeight: '700'}}>ITIO Pay Store Id:</label>
          <TextField
            required
            id="itio_store_id"
            name="itio_store_id"
            fullWidth
            value={itio_store_id}
            onChange={(e) => setItioStoreId(e.target.value)}
            sx={{border:'1px solid silver', borderRadius: '9px'}}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <label style={{fontWeight: '700'}}>ITIO Pay API Key:</label>
          <TextField
            required
            id="itio_key"
            name="itio_key"
            onChange={(e) => setItioKey(e.target.value)}
            fullWidth
            value={itio_key}
            sx={{border:'1px solid silver', borderRadius: '9px'}}
          />
        </Grid>
        <Grid item xs={12} sm={4} sx={{marginTop: '30px'}}>
          <FormControlLabel
           value="start"
           control={<IOSSwitch checked={itio_status} color="primary" sx={{ m: 1 }} />}
           label="ITIO Pay"
           onChange={() => setItioStatus(!itio_status)}
           labelPlacement="end"
          />
        </Grid>
        <Grid item xs={12} sm={12} sx={{display: 'flex', flexDirection: 'row', justifyContent: 'left', gap: '3px'}}>
          <Grid><CustomButton onClick={() => HandleUpdateDetails()}>Save</CustomButton></Grid>
          <Grid><CustomButton>Cancel</CustomButton></Grid>
        </Grid>
       </Grid>        
      </Box>
    </>
  )
}

import React, { useEffect, useState } from 'react';
import { Grid, Select, MenuItem, FormControl, OutlinedInput, InputAdornment, TextField, SelectChangeEvent, Button, Typography } from '@mui/material';
import CustomButton from '../CustomButton';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { JwtPayload } from '../../types/jwt';
import { useAppToast } from '@/utils/toast';


// Simple local alertnotify function
const alertnotify = (text: string, type: string) => {
  window.alert(`${type.toUpperCase()}: ${text}`);
};

interface AddManualPaymentProps {
  onSave: (data: {
    invoiceNo: string;
    dueAmount: string | number;
    paidAmount: string | number;
    paymentDate: string;
    amount: string;
    paymentMode: string;
    notes: string;
  }) => void;
  onCancel: () => void;
  unpaidInvoice?: any[];
}

const AddManualPayment: React.FC<AddManualPaymentProps> = ({ onSave, onCancel, unpaidInvoice = [] }) => {
  // --- Manual Payment States ---
  const [invoiceD, setInvoiceD] = useState<any>(null);
  const [selectedInvoice, setSelectedInvoice] = useState('');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [amountError, setAmountError] = useState('');
  const theme = false;
  const url = import.meta.env.VITE_NODE_ENV == "production" ? 'api' : 'api';
  const [msgLoading, setmsgLoading] = useState(false);
  const toast = useAppToast();

  // --- Fetch Invoice Details ---
  const HandleInvoiceDetails = async (val: string) => {
    setError(null);
    try {
      const result = await axios.get(`/${url}/v1/invoice/getinv/info/${val}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (result?.data?.status == 201) {
        setInvoiceD(result?.data?.data);
      } else {
        setInvoiceD(null);
        setError("No data found for this invoice.");
      }
    } catch (error) {
      setInvoiceD(null);
    }
  };

  // --- Save Manual Payment ---
  const HandleSave = async () => {
    setmsgLoading(true);
    const accountId = jwtDecode<JwtPayload>(localStorage.getItem('token') as string);
    try {
      const result = await axios.post(`/${url}/v1/manualPayment/add`, {
        "user": accountId?.data?.id,
        "invoice": invoiceD?._id,
        "client": invoiceD?.userid,
        "invoice_number": invoiceD?.invoice_number,
        "dueAmount": invoiceD?.dueAmount,
        "amountCurrencyText": invoiceD?.currency_text,
        "paidAmount": invoiceD?.paidAmount,
        "amount": amount,
        "notes": notes,
        "payment_date": new Date().toISOString().substring(0, 10),
        "mode": "Cash"
      },
        {
          headers:
          {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
      if (result.data.status == 201) {
        setmsgLoading(false);
        toast.success(result?.data?.message);
        onCancel(); // Close modal on success
      }
    } catch (error: any) {
      setmsgLoading(false);
      toast.error(error?.response?.data?.message);
      console.log("error", error);
    }
  }

  // --- Discard ---
  const HandleDiscard = () => {
    onCancel();
  };

  // --- Fetch on Mount ---
  useEffect(() => {
    if (unpaidInvoice && unpaidInvoice.length > 0) {
      setSelectedInvoice(unpaidInvoice[0].invoice_number);
      HandleInvoiceDetails(unpaidInvoice[0].invoice_number);
    }
  }, [unpaidInvoice]);

  // --- Invoice Selection Section ---
  return (
    <>
      <Grid container spacing={3} sx={{ padding: '2%', color: theme ? 'white' : 'black' }}>
        {/* Invoice Selection Section */}
        <Grid item xs={12} md={6}>
          <label htmlFor="Invoice" style={{ marginBottom: 8, display: 'block', fontWeight: 500 }}>Invoice</label>
          <Select
            onChange={(e) => { setSelectedInvoice(e.target.value); HandleInvoiceDetails(e.target.value); }}
            sx={{
              color: `${theme ? 'white' : 'black'}`,
              border: `${theme ? '1px solid silver' : 'black'}`,
            }}
            value={selectedInvoice}
            displayEmpty
            fullWidth
          >
            <MenuItem value="" disabled>
              <em>Select an invoice</em>
            </MenuItem>
            {unpaidInvoice?.map((item: any, index: number) => (
              <MenuItem value={item?.invoice_number} key={index} sx={{ color: `${theme ? 'white' : 'black'}` }}>
                {item?.invoice_number}
              </MenuItem>
            ))}
          </Select>
        </Grid>
        {/* Due Amount */}
        <Grid item xs={12} md={6}>
          <label htmlFor="Due Amount" style={{ marginBottom: 8, display: 'block', fontWeight: 500 }}>Due Amount</label>
          <FormControl fullWidth>
            <OutlinedInput
              id="due-amount"
              startAdornment={<InputAdornment position="start">{invoiceD?.currency_text || ''}</InputAdornment>}
              value={invoiceD?.dueAmount || 0}
              readOnly
              sx={{ border: theme ? '1px solid silver' : 'black' }}
              fullWidth
            />
          </FormControl>
        </Grid>
        {/* Paid Amount */}
        <Grid item xs={12} md={6}>
          <label htmlFor="Paid Amount" style={{ marginBottom: 8, display: 'block', fontWeight: 500 }}>Paid Amount</label>
          <FormControl fullWidth>
            <OutlinedInput
              id="paid-amount"
              startAdornment={<InputAdornment position="start">{invoiceD?.currency_text || ''}</InputAdornment>}
              value={invoiceD?.paidAmount || 0}
              readOnly
              sx={{ border: theme ? '1px solid silver' : 'black', color: theme ? 'white' : 'black' }}
              fullWidth
            />
          </FormControl>
        </Grid>
        {/* Payment Date */}
        <Grid item xs={12} md={6}>
          <label htmlFor="Payment Date" style={{ marginBottom: 8, display: 'block', fontWeight: 500 }}>Payment Date</label>
          <TextField
            value={new Date().toISOString().substring(0, 10)}
            fullWidth
            InputProps={{ readOnly: true }}
            sx={{ color: theme ? 'white' : 'black', border: theme ? '1px solid silver' : 'black' }}
          />
        </Grid>
        {/* Amount */}
        <Grid item xs={12} md={6}>
          <label htmlFor="Amount" style={{ marginBottom: 8, display: 'block', fontWeight: 500 }}>Amount <span style={{ color: 'red' }}>*</span></label>
          <TextField
            placeholder="Amount"
            value={amount}
            onChange={(e) => {
              const value = e.target.value;
              setAmount(value);
              const due = Number(invoiceD?.dueAmount || 0);
              if (Number(value) > due) {
                setAmountError('Amount must be less than or equal to Due Amount');
              } else if (Number(value) <= 0) {
                setAmountError('Amount must be greater than 0');
              } else {
                setAmountError('');
              }
            }}
            fullWidth
            sx={{ border: theme ? '1px solid silver' : 'black' }}
            error={!!amountError}
          />
          {amountError && (
            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
              {amountError}
            </Typography>
          )}
        </Grid>
        {/* Payment Mode */}
        <Grid item xs={12} md={6}>
          <label htmlFor="Payment Mode" style={{ marginBottom: 8, display: 'block', fontWeight: 500 }}>Payment Mode</label>
          <TextField
            value="Cash"
            fullWidth
            InputProps={{ readOnly: true }}
            sx={{ color: 'black', border: theme ? '1px solid silver' : 'black' }}
          />
        </Grid>
        {/* Notes */}
        <Grid item xs={12}>
          <label htmlFor="Notes" style={{ marginBottom: 8, display: 'block', fontWeight: 500 }}>Notes</label>
          <TextField
            placeholder="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            multiline
            rows={7}
            fullWidth
            sx={{ border: theme ? '1px solid silver' : 'black' }}
          />
        </Grid>
        {error && (
          <Grid item xs={12}>
            <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>
          </Grid>
        )}
        <Grid item xs={12}>
          <Grid sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
            <Grid>
              <CustomButton onClick={HandleSave} disabled={!!amountError || !amount}>
                Pay
              </CustomButton>
            </Grid>
            <Grid><CustomButton onClick={HandleDiscard}>Cancel</CustomButton></Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

export default AddManualPayment;

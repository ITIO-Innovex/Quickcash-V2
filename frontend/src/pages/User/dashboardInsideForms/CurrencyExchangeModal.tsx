import React from 'react';
import ReactCountryFlag from 'react-country-flag';
import CustomModal from '@/components/CustomModal';
import { Box, Button, Typography, useTheme } from '@mui/material';
import api from '@/helpers/apiHelper';
// import jwtDecode from "jwt-decode";
import axios from "axios";
import getSymbolFromCurrency from "currency-symbol-map";
import { useNavigate } from "react-router-dom";

interface CurrencyExchangeModalProps {
  open: boolean;
  onClose: () => void;
  fromAmount: string;
  fromCurrency: string;
  toCurrency: string;
  exchangeRate: number;
  exchangedAmount: string;
  fee: number;
  account: any;
  onSubmit: (transaction: any) => void;
  accountId: any;
  toExchangeBox: any;
  setToExchangeBox: (val: any) => void;
  getAllAccountsList: (id: string) => void;
  setReviewOpen: (val: boolean) => void;
  setExchangeOpen: (val: boolean) => void;
  alertnotify: (msg: string, type: string) => void;
  getDashboardData: (id: string) => void;
  url: string;
}

const CurrencyExchangeModal: React.FC<CurrencyExchangeModalProps> = ({ open, onClose, fromAmount, fromCurrency, toCurrency, exchangeRate, exchangedAmount, fee, account, onSubmit, accountId, toExchangeBox, setToExchangeBox, getAllAccountsList, setReviewOpen, setExchangeOpen, alertnotify, getDashboardData, url }) => {
    const theme = useTheme();
    const totalCharge = fromAmount && fee ? (parseFloat(fromAmount) + fee).toFixed(2) : '';
    const [submitting, setSubmitting] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const navigate = useNavigate();

    const HandleTransactions = async () => {
      setSubmitting(true);
      setError(null);
      // Check for sufficient balance before making the API call
      if (parseFloat(account.balance) < parseFloat(fromAmount) + fee) {
        alertnotify("Insufficient balance for this transaction.", "error");
        setSubmitting(false);
        return;
      }
      try {
        await axios.post(
          `/${url}/v1/transaction/add`,
          {
            user: accountId?.data.id,
            source_account: account?._id,
            transfer_account: toExchangeBox?._id,
            trans_type: "Exchange",
            receipient: "",
            fee: fee,
            recfee: fee,
            info: `Convert ${account?.currency} to ${toExchangeBox?.currency}`,
            country: `${account?.country}`,
            fromAmount: parseFloat(fromAmount),
            amount: parseFloat(exchangedAmount),
            amountText: `${getSymbolFromCurrency(toExchangeBox?.currency)}${parseFloat(exchangedAmount).toFixed(2)}`,
            fromamountText: `${getSymbolFromCurrency(account?.currency)}${parseFloat(fromAmount).toFixed(2)}`,
            remainingAmount: parseFloat(toExchangeBox?.amount),
            from_currency: `${account?.currency}`,
            to_currency: `${toExchangeBox?.currency}`,
            status: "Success",
            addedBy: accountId?.data?.name,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        )
        .then((result) => {
          if (result.data.status == "201") {
            setToExchangeBox(null);
            getAllAccountsList(accountId?.data?.id);
            setReviewOpen(false);
            setExchangeOpen(false);
            setTimeout(() => {
              alertnotify("Exchange has been done successfully", "success");
            }, 300);
            getDashboardData(accountId?.data?.id);
            navigate(`/home?currency=${account?.currency}`);
          }
        })
        .catch((error) => {
          console.log("error", error);
          if (error?.response?.status === 402) {
            // Show the backend response message if present, otherwise show success
            const msg = error?.response?.data?.message || "Exchange has been done successfully";
            alertnotify(msg, msg === "Exchange has been done successfully" ? "success" : "error");
            if (msg === "Exchange has been done successfully") {
              setToExchangeBox(null);
              getAllAccountsList(accountId?.data?.id);
              setReviewOpen(false);
              setExchangeOpen(false);
              setTimeout(() => {
                getDashboardData(accountId?.data?.id);
                navigate(`/home?currency=${account?.currency}`);
              }, 300);
            }
          } else {
            const msg = error?.response?.data?.message || "Something went wrong";
            alertnotify(msg, "error");
          }
        });
        onClose();
      } catch (e) {
        setError('Failed to process transaction.');
      }
      setSubmitting(false);
    };

  return (
    <CustomModal open={open} onClose={onClose} 
      title={
        <Box display="flex" alignItems="center" gap={1}>
          <img src={account.flag} alt={account.label} width={28} height={28} style={{ borderRadius: '50%' }} />
          <Typography fontWeight="bold" fontSize={20}>
            {account.label} : {account.balance}
          </Typography>
        </Box>
      }
      maxWidth="md" sx={{backgroundColor:theme.palette.background.default}}>
      <Box className="currency-exchange-modal-content">
         <Box className="currency-exchange-top">
        <Box className="currency-exchange-amounts">
          <Typography className="from-amount">- {fromCurrency} {fromAmount || '0.00'}</Typography>
          <Typography className="to-amount">{toCurrency} {exchangedAmount || '0.00'}</Typography>
        </Box>
        <Box className="currency-exchange-flags">
          <img src={account.flag} alt={account.label} className="currency-exchange-flag" />
          <img src={`../flags/${toCurrency.toLowerCase()}.png`} alt={toCurrency} className="currency-exchange-flag" />
        </Box>
      </Box>
      {/* To Card Info */}
      <Box className="currency-exchange-to-card">
        <Typography className="to-currency">
          to <span className="to-currency-name">
            <img src={`../flags/${toCurrency.toLowerCase()}.png`} alt={toCurrency} width={20} style={{ borderRadius: '50%', marginRight: 4 }} />
            {toCurrency}
          </span>
        </Typography>
        <Typography className="to-card-number">{account.code}</Typography>
      </Box>

        <Box className="currency-exchange-summary">
          <Box className="currency-exchange-summary-row">
            <span className="label">Exchange</span>
            <span className="value">{fromCurrency} {fromAmount || '0.00'}</span>
          </Box>
          <Box className="currency-exchange-summary-row">
            <span className="label">Rate</span>
            <span className="value">1 {fromCurrency} = {exchangeRate} {toCurrency}</span>
          </Box>
          <Box className="currency-exchange-summary-row">
            <span className="label">Fee</span>
            <span className="value">{getSymbolFromCurrency(fromCurrency)} {fee}</span>
          </Box>
          <Box className="currency-exchange-summary-row">
            <span className="label">Total Charge</span>
            <span className="value">{fromCurrency} {totalCharge}</span>
          </Box>
          <Box className="currency-exchange-summary-row">
            <span className="label">Will get Exactly</span>
            <span className="value">{toCurrency} {exchangedAmount || '0.00'}</span>
          </Box>
        </Box>
        <Box className="currency-exchange-section">
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Source Account</Typography>
          <Box className="account-row">
            <img src={account.flag} alt={account.label} className="currency-exchange-flag" />
            <Box>
              <Typography fontWeight={600}>{account.currency}</Typography>
              <Typography variant="body2">{account.code}</Typography>
            </Box>
            <Box sx={{ marginLeft: 'auto' }}>
              <Typography fontWeight={600}>{account.balance}</Typography>
            </Box>
          </Box>
        </Box>
        <Button className="modal-button" fullWidth onClick={HandleTransactions} disabled={submitting}>
          {submitting ? 'Processing...' : 'Submit Order'}
        </Button>
        {error && <Typography color="error.main">{error}</Typography>}
      </Box>
    </CustomModal>
  );
};

export default CurrencyExchangeModal;

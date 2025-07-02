import React from 'react';
import ReactCountryFlag from 'react-country-flag';
import CustomModal from '@/components/CustomModal';
import { Box, Button, Typography, useTheme } from '@mui/material';
import api from '@/helpers/apiHelper';

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
}

const CurrencyExchangeModal: React.FC<CurrencyExchangeModalProps> = ({ open, onClose, fromAmount, fromCurrency, toCurrency, exchangeRate, exchangedAmount, fee, account, onSubmit }) => {
    const theme = useTheme();
    const totalCharge = fromAmount && fee ? (parseFloat(fromAmount) + fee).toFixed(2) : '';
  return (
    <CustomModal open={open} onClose={onClose} title="Final Exchange Summary" maxWidth="md" sx={{backgroundColor:theme.palette.background.default}}>
      <Box className="currency-exchange-modal-content">
         <Box className="currency-exchange-top">
        <Box className="currency-exchange-amounts">
          <Typography className="from-amount">- {fromCurrency} {fromAmount || '0.00'}</Typography>
          <Typography className="to-amount">{toCurrency} {exchangedAmount || '0.00'}</Typography>
        </Box>
        <Box className="currency-exchange-flags">
          <img src={account.flag} alt={fromCurrency} className="currency-exchange-flag" />
          <img src={`../flags/${toCurrency.toLowerCase()}.png`} alt={toCurrency} className="currency-exchange-flag" />
        </Box>
      </Box>
      {/* To Card Info */}
      <Box className="currency-exchange-to-card">
        <Typography className="to-currency">
          to <span className="to-currency-name">{toCurrency}</span>
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
            <span className="value">{fromCurrency} {fee}</span>
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
        <Button className="modal-button" fullWidth onClick={async () => {
          const totalCharge = fromAmount && fee ? (parseFloat(fromAmount) + fee).toFixed(2) : '';
          const transaction = {
            fromAmount,
            fromCurrency,
            toCurrency,
            exchangeRate,
            exchangedAmount,
            fee,
            totalCharge,
            date: new Date().toISOString(),
            account,
            trans_type: 'exchange',
          };
          try {
            const url = import.meta.env.VITE_NODE_ENV === "production" ? "api" : "api";
            const token = localStorage.getItem('token');
            let user_id = '';
            if (token) {
              user_id = JSON.parse(atob(token.split('.')[1])).data.id;
            }
            const activeCurr = localStorage.getItem('activeCurr');
            const data = {
              user_id,
              account: activeCurr,
              currency: toCurrency,
              amount: fromAmount,
            };
            const response = await api.post(`/${url}/v1/transaction/account`, data);
            console.log('API response:', response.data);
          } catch (error) {
            console.error('API error:', error);
          }
          onSubmit(transaction);
          onClose();
        }}>Submit Order</Button>
      </Box>
    </CustomModal>
  );
};

export default CurrencyExchangeModal;

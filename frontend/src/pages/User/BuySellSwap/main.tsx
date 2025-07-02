import FirstSection from './FirstSection';
import SecondSection from './SecondSection';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/common/pageHeader';
import GenericTable from '../../../components/common/genericTable';
import { Box, Typography, useTheme } from '@mui/material';

const BuySellSwapContent = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  

  const handleBuySellSwap = () => {
    navigate('/buy-sell-swap');
  };

  const transactionData = [
    {
      date: '2025-01-30',
      coin: 'BTC',
      paymentType: 'Bank Transfer',
      noOfCoins: '0.000353',
      side: 'BUY',
      amount: '$100.00',
      status: 'SUCCESS',
    },
    {
      date: '2025-01-29',
      coin: 'ETH',
      paymentType: 'Credit Card',
      noOfCoins: '0.025',
      side: 'SELL',
      amount: '$85.50',
      status: 'PENDING',
    },
    {
      date: '2025-01-28',
      coin: 'SOL',
      paymentType: 'Bank Transfer',
      noOfCoins: '0.5',
      side: 'BUY',
      amount: '$120.00',
      status: 'SUCCESS',
    },
  ];

  const columns = [
    { field: 'date', headerName: 'DATE' },
    {
      field: 'coin',
      headerName: 'COIN',
      render: (row: any) => (
        <Box className="coin-display">
          <img
            src={`https://assets.coincap.io/assets/icons/${row.coin.toLowerCase()}@2x.png`}
            alt={row.coin}
            className="coin-icon"
          />
          {row.coin}
        </Box>
      ),
    },
    { field: 'paymentType', headerName: 'PAYMENT TYPE' },
    { field: 'noOfCoins', headerName: 'NO OF COINS' },
    {
      field: 'side',
      headerName: 'SIDE',
      render: (row: any) => (
        <Typography className={row.side === 'BUY' ? 'buy-side' : 'sell-side'}>
          {row.side}
        </Typography>
      ),
    },
    { field: 'amount', headerName: 'AMOUNT' },
    {
      field: 'status',
      headerName: 'STATUS',
      render: (row: any) => {
        const statusClass =
          row.status === 'SUCCESS'
            ? 'success'
            : row.status === 'PENDING'
              ? 'pending'
              : 'failed';
        return (
          <span className={`status-chip ${statusClass}`}>{row.status}</span>
        );
      },
    },
  ];

  return (
    <Box
      className="dashboard-container" sx={{ backgroundColor: theme.palette.background.default }}>
      <PageHeader title="Crypto Buy-Sell-Swap"/>

      <SecondSection/>
      <FirstSection/>
      
      {/* Transaction History Table */}
        <Typography
          variant="h6"
          className="buysellswap-section-title"
          sx={{ color: theme.palette.text.primary }}
        >
          Recent Transactions
        </Typography>

        <GenericTable columns={columns} data={transactionData} />
      </Box>

  );
};

export default BuySellSwapContent;

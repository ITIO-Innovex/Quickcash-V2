import FirstSection from './FirstSection';
import SecondSection from './SecondSection';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/common/pageHeader';
import GenericTable from '../../../components/common/genericTable';
import { Box, Typography, useTheme } from '@mui/material';
import React, { useEffect, useState } from 'react';
import api from '@/helpers/apiHelper';
import { jwtDecode } from 'jwt-decode';
import { JwtPayload } from '@/types/jwt';
import getSymbolFromCurrency from 'currency-symbol-map';

const BuySellSwapContent = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [transactionData, setTransactionData] = useState([]);

  const columns = [
    { field: 'createdAt', headerName: 'DATE' },
    {
      field: 'coin',
      headerName: 'COIN',
      render: (row: any) => (
        <Box className="coin-display">
          <img
           src={`https://assets.coincap.io/assets/icons/${row.coin.split('_')[0].toLowerCase()}@2x.png`}
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
    {
      field: 'amount',
      headerName: 'AMOUNT',
      render: (row: any) => (
        <>
          {getSymbolFromCurrency(row.currencyType)} {row.amount}
        </>
      ),
    },
    {
      field: 'status',
      headerName: 'STATUS',
      render: (row: any) => {
      const statusClass = row.status?.toLowerCase();
        return (
          <span className={`status-chip ${statusClass}`}>{row.status}</span>
        );
      },
    },
  ];

  const fetchTransactions = async (userId: string) => {
    try {
      const res = await api.get(`/api/v1/crypto/list/${userId}`);
      if (res.data.status === 201) {
        //  console.log("✅ Data Found:", res.data.data);
        const transformedData = res.data.data.map((item: any) => ({
          ...item,
          id: item._id,
          createdAt: new Date(item.createdAt).toLocaleDateString(),
          side: item.side?.toUpperCase(),
          status: item.status?.toUpperCase(),
        }));
        setTransactionData(transformedData);
      }
    } catch (err) {
      console.error("❌ Error fetching transaction data", err);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = jwtDecode<JwtPayload>(token);
      const userId = decoded.data.id;
      fetchTransactions(userId);
    }
  }, []);

  return (
    <Box className="dashboard-container" sx={{ backgroundColor: theme.palette.background.default }}>
      <PageHeader title="Crypto Buy-Sell-Swap" />
      <SecondSection />
      <FirstSection />

      <Typography variant="h6" className="buysellswap-section-title" sx={{ color: theme.palette.text.primary }}>
        Recent Transactions
      </Typography>

      <GenericTable columns={columns} data={transactionData} />
    </Box>
  );
};

export default BuySellSwapContent;

import GenericTable from '@/components/common/genericTable';
import api from '@/helpers/apiHelper';
import { JwtPayload } from '@/types/jwt';
import { Box, Typography } from '@mui/material';
import getSymbolFromCurrency from 'currency-symbol-map';
import { jwtDecode } from 'jwt-decode';
import React, { useEffect } from 'react';


const transactionColumns = [
  { field: "createdAt", headerName: "Date" },
  { field: "coin", headerName: "Coin" },
  { field: "noOfCoins", headerName: "Quantity" },
  { field: "side", headerName: "Type" },
  {
    field: "amount",
    headerName: "Amount",
    render: (row: any) => (
      <span>
        {getSymbolFromCurrency(row.currencyType)} {row.amount}
      </span>
    ),
  },
  {
    field: "status",
    headerName: "Status",
    render: (row: any) => (
      <span className={`status-chip ${row.status.toLowerCase()}`}>
        {row.status}
      </span>
    ),
  },
];


const FourthSection = () => {
    useEffect(() => {
    getTransactionsList();
  },[]); 
  const [cryptoListTransaction,setCryptoListTransaction] = React.useState<any>([]);
  const url = import.meta.env.VITE_NODE_ENV == "production" ? 'api' : 'api'; 
  const getTransactionsList = async() => {
    const accountId = jwtDecode<JwtPayload>(localStorage.getItem('token') as string);
    try {
      const result = await api.get(`/${url}/v1/crypto/list/${accountId.data.id}`);
      if (result.data.status === 201) {
        setCryptoListTransaction(result.data.data);
      } else {
        console.error("Failed to fetch crypto transactions:", result.data.message);
      }
    } catch (error) {
      console.error("Error fetching crypto transactions:", error);
    }
    
  }

  return (
    <Box className="fourth-section-wrapper">
      <Box className="fourth-box">
        <Typography className="box-title">Crypto Transactions</Typography>
        <GenericTable columns={transactionColumns} data={cryptoListTransaction} />
      </Box>
    </Box>
  );
};

export default FourthSection;

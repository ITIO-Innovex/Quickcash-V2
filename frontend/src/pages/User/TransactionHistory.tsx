import { useEffect, useState } from 'react';
import GenericTable from '@/components/common/genericTable';
import { Box, Card, CardContent, Typography, Chip, useTheme } from '@mui/material';
import { JwtPayload } from '@/types/jwt';
import { jwtDecode } from 'jwt-decode';
import api from '@/helpers/apiHelper';
import getSymbolFromCurrency from 'currency-symbol-map';
import { useLocation } from 'react-router-dom';

//Set the API URL based on the environment
const url = import.meta.env.VITE_NODE_ENV === "production" ? "api" : "api";

const TransactionHistory = () => {
  const location = useLocation();
  const theme = useTheme();
  const [transactionHistory, setTransactionHistory] = useState<any[]>([]);
  useEffect(() => {
    const waitForActiveCurr = () => {
      const activeCurr = localStorage.getItem("activeCurr");
      if (!activeCurr) {
        setTimeout(waitForActiveCurr, 100); // Check again after 100ms
      } else {
        getTransactionsList();
      }
    };
    waitForActiveCurr();
  }, [location]);
  const getTransactionsList = async() => {
    try {
      const accountId = jwtDecode<JwtPayload>(localStorage.getItem('token') as string);
      var valSearch = location?.search?.replace("?currency=","").replace("?","");
      let apiUrl = `/${url}/v1/transaction/list/${accountId?.data?.id}`;
      let method = "get";
      let data: any = {};
      if(valSearch === "all") {
        //No need to change the URL, it will fetch all transactions
      }else if(valSearch.substring(0, 6) === "crypto") {
        apiUrl = `/${url}/v1/crypto/listbyId/${valSearch?.replace("crypto=","")}`;
      } else{
        apiUrl = `/${url}/v1/transaction/account`;
        method = "post";
        const activeCurr = localStorage.getItem("activeCurr");
        console.log("activeCurr", activeCurr);
        data = {
          "user_id": accountId?.data?.id,
          "account": activeCurr,
          "currency": valSearch ? valSearch : accountId?.data?.defaultcurr,
        };

      }
      let result;
      if(method === "get") {
        result = await api.get(apiUrl);
      } else {
        result = await api.post(apiUrl, data);
      }
      if (result.data.status === 201) {
        const transactions = result.data.data.map((transaction: any) => {
          const isDebit = transaction?.extraType === "debit";
          return ({
            date: new Date(transaction.createdAt).toLocaleDateString(),
            trx: transaction.trx,
            type: transaction.trans_type,
            amount: `${isDebit ? '-' : '+'}${
              isDebit
                ? getSymbolFromCurrency(transaction?.from_currency)
                : transaction?.trans_type == "Exchange"
                ? getSymbolFromCurrency(transaction?.from_currency)
                : getSymbolFromCurrency(transaction?.to_currency)
            }${parseFloat(transaction?.amount || 0).toFixed(2)}`,
            balance: `${
              isDebit
                ? getSymbolFromCurrency(transaction?.from_currency)
                : transaction?.trans_type === "Exchange"
                ? getSymbolFromCurrency(transaction?.to_currency)
                : getSymbolFromCurrency(transaction?.from_currency)
            }${parseFloat(transaction?.postBalance ?? 0).toFixed(2)}`
            ,
            status: (
              <Chip
                label={transaction.status.toUpperCase()}
                sx={{
                  backgroundColor: transaction.status === 'pending' ? '#fffbe0' : '#e0f2fe',
                  color: transaction.status === 'pending' ? '#b45309' : '#0284c7',
                  fontWeight: 'semibold',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                }}
              />
            ),
          });
        });
        setTransactionHistory(transactions);
      }
    }catch (error) {
      console.error("Error fetching transaction history:", error);
    }
  }
  const columns = [
    { field: 'date', headerName: 'DATE OF TRANSACTION', minWidth: 150 },
    { field: 'trx', headerName: 'TRX', minWidth: 100 },
    { field: 'type', headerName: 'TYPE', minWidth: 200 },
    { field: 'amount', headerName: 'AMOUNT', minWidth: 100 },
    { field: 'balance', headerName: 'BALANCE', minWidth: 100 },
    { field: 'status', headerName: 'STATUS', minWidth: 100 },
  ];


  return (
    <Box>
      <Card>
        <CardContent sx={{ p: 0, '&:last-child': { pb: 0 }, backgroundColor:theme.palette.background.default }}>
          <Typography
            sx={{
              mb: 2,
              px: 3,
              pt: 2,
            }}
          >
            Transaction History
          </Typography>
          <Box sx={{ px: 3, pb: 2 }}>
            <GenericTable
              columns={columns}
              data={transactionHistory}
            />
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default TransactionHistory;

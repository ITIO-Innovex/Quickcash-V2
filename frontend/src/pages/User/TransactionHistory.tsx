import { useEffect, useState } from 'react';
import GenericTable from '@/components/common/genericTable';
import { Box, Card, CardContent, Typography, Chip, useTheme } from '@mui/material';
import { JwtPayload } from '@/types/jwt';
import { jwtDecode } from 'jwt-decode';
import api from '@/helpers/apiHelper';
import getSymbolFromCurrency from 'currency-symbol-map';
import { useLocation } from 'react-router-dom';
import VisibilityIcon from '@mui/icons-material/Visibility';
import TransactionDetailModalContainer from '@/components/common/TransactionDetailModalContainer';
import moment from 'moment';

//Set the API URL based on the environment
const url = import.meta.env.VITE_NODE_ENV === "production" ? "api" : "api";

const TransactionHistory = () => {
  const location = useLocation();
  const theme = useTheme();
  const [transactionHistory, setTransactionHistory] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [accountName, setAccountName] = useState<string>('');
  useEffect(() => {
    const name = localStorage.getItem("activeCurrName");
    setAccountName(name || '');
    const waitForActiveCurr = () => {
      const activeCurr = localStorage.getItem("activeCurr");
      if (!activeCurr) {
        setTimeout(waitForActiveCurr, 100); // Check again after 100ms
      } else {
        getTransactionsList();
        getAccountDetails();
      }
    };
    waitForActiveCurr();
  }, [location]);
  const getAccountDetails = async () => {
    try {
      const accountId = jwtDecode<JwtPayload>(localStorage.getItem('token') as string);
      var valSearch = location?.search?.replace("?currency=", "").replace("?", "");
      if (valSearch !== "all" && !valSearch.startsWith("crypto")) {
        const activeCurr = localStorage.getItem("activeCurr");
        const response = await api.get(`/${url}/v1/account/get-account-by-id?userId=${accountId?.data?.id}&accountId=${activeCurr}`);
        if (response.data.status === 201 && response.data.data) {
          setAccountName(response.data.data.name);
        }
      }
    } catch (error) {
      console.error("❌ Error fetching account details:", error);
    }
  };
  const getTransactionsList = async () => {
    try {
      const accountId = jwtDecode<JwtPayload>(localStorage.getItem('token') as string);
      var valSearch = location?.search?.replace("?currency=", "").replace("?", "");
      let apiUrl = `/${url}/v1/transaction/list/${accountId?.data?.id}`;
      let method = "get";
      let data: any = {};
      if (valSearch === "all") {
        //No need to change the URL, it will fetch all transactions
      } else if (valSearch.substring(0, 6) === "crypto") {
        apiUrl = `/${url}/v1/crypto/listbyId/${valSearch?.replace("crypto=", "")}`;
      } else {
        apiUrl = `/${url}/v1/transaction/account`;
        method = "post";
        const activeCurr = localStorage.getItem("activeCurr");
        // console.log("activeCurr", activeCurr);
        data = {
          "user_id": accountId?.data?.id,
          "account": activeCurr,
          "currency": valSearch ? valSearch : accountId?.data?.defaultcurr,
        };

      }
      let result;
      if (method === "get") {
        result = await api.get(apiUrl);
      } else {
        result = await api.post(apiUrl, data);
      }
      if (result.data.status === 201) {

        // Handle case where data might not be an array
        const dataArray = Array.isArray(result.data.data) ? result.data.data : [result.data.data];

        const transactions = dataArray.map((transaction: any) => {

          // Check if this is a crypto transaction
          if (isCryptoView) {
            const mappedCryptoTransaction = {
              date: new Date(transaction.createdAt).toLocaleDateString(),
              coin: transaction.coin?.replace(/_TEST$/, ''),

              side: transaction.side,
              amount: `${getSymbolFromCurrency(transaction.currencyType)}${parseFloat(transaction.amount || 0).toFixed(2)}`,
              noOfCoins: transaction.noOfCoins,
              walletAddress: transaction.walletAddress,
              paymentType: transaction.paymentType,
              status: (() => {
                const rawStatus = transaction.status?.toLowerCase?.() || '';
                return ['success', 'succeeded', 'completed'].includes(rawStatus)
                  ? 'SUCCESS'
                  : rawStatus.toUpperCase();
              })(),
            };
            return mappedCryptoTransaction;
          } else {
            const isDebit = transaction?.extraType === "debit" || transaction?.trans_type === "Send Money";

            const mappedTransaction = {
              _id: transaction._id,
              date: new Date(transaction.createdAt).toLocaleDateString(),
              trx: transaction.trx,
              type: transaction.trans_type,
              amount: `${isDebit ? '-' : '+'}${isDebit
                ? getSymbolFromCurrency(transaction?.from_currency)   // Is debit currency will be from_currency
                : transaction?.trans_type == "Exchange"               // Is exchange and not debit, currency will be from_currency
                  ? getSymbolFromCurrency(transaction?.from_currency)
                : transaction?.trans_type == "Add Money"            // Is not exchange not debit Is add money, currency will be to_currency
                  ? getSymbolFromCurrency(transaction?.to_currency)
                  : getSymbolFromCurrency(transaction?.from_currency)
                }${parseFloat(transaction?.amount || 0).toFixed(2)}`,
              balance: `${isDebit
                ? getSymbolFromCurrency(transaction?.from_currency)
                : transaction?.trans_type === "Exchange"
                  ? getSymbolFromCurrency(transaction?.to_currency)
                  : getSymbolFromCurrency(transaction?.from_currency)
                }${parseFloat(transaction?.postBalance ?? 0).toFixed(2)}`
              ,
              status: (() => {
                const rawStatus = transaction.status?.toLowerCase?.() || '';
                return ['success', 'succeeded', 'completed'].includes(rawStatus)
                  ? 'SUCCESS'
                  : rawStatus.toUpperCase();
              })(),
            };
            return mappedTransaction;
          }
        });
        setTransactionHistory(transactions);
      }
    } catch (error) {
      console.error("❌ Error fetching transaction history:", error);
      console.error("❌ Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
    }
  }
  const handleOpen = (row: any) => {
    setSelectedId(row._id);
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    setSelectedId(null);
  };
  // Check if current view is crypto
  const isCryptoView = location?.search?.includes("crypto");

  const columns = isCryptoView ? [
    // Crypto specific columns
    { field: 'date', headerName: 'Date', minWidth: 150 },
    { field: 'coin', headerName: 'Coin', minWidth: 120 },
    { field: 'side', headerName: 'Side', minWidth: 80 },
    { field: 'amount', headerName: 'Amount', minWidth: 100 },
    { field: 'noOfCoins', headerName: 'No. Of Coins', minWidth: 120 },
    // { field: 'walletAddress', headerName: 'WALLET ADDRESS', minWidth: 200 },
    { field: 'paymentType', headerName: 'Payment Type', minWidth: 120 },
    {
      field: 'status',
      headerName: 'Status',
      render: (row: any) => {
        const rawStatus = row.status?.toLowerCase();
        const isSuccess = ['succeeded', 'success', 'complete', 'successful', 'completed'].includes(rawStatus);
        const displayText = isSuccess ? 'Success' : row.status;
        const statusClass = isSuccess ? 'success' : rawStatus;
        return (
          <span className={`status-chip ${statusClass}`}>
            {displayText}
          </span>
        );
      }
    }
  ] : [
    // Regular transaction columns
    { field: 'date', headerName: 'Date', minWidth: 150 },
    { field: 'trx', headerName: 'Transaction ID', minWidth: 100 },
    { field: 'type', headerName: 'Type', minWidth: 200 },
    { field: 'amount', headerName: 'Amount', minWidth: 100 },
    { field: 'balance', headerName: 'Balance', minWidth: 100 },
    {
      field: 'status',
      headerName: 'Status',
      render: (row: any) => {
        const rawStatus = row.status?.toLowerCase();
        const isSuccess = ['succeeded', 'success', 'complete', 'successful'].includes(rawStatus);
        const displayText = isSuccess ? 'Success' : row.status;
        const statusClass = isSuccess ? 'success' : rawStatus;
        return (
          <span className={`status-chip ${statusClass}`}>
            {displayText}
          </span>
        );
      }
    },
    {
      field: 'action',
      headerName: 'Action',
      render: (row: any) => (
        <VisibilityIcon
          sx={{ cursor: 'pointer' }}
          onClick={() => handleOpen(row)}
        />
      )
    }
  ];
  return (
    <Box>
      <Card>
        <CardContent sx={{ p: 0, '&:last-child': { pb: 0 }, backgroundColor: theme.palette.background.default }}>
          <Typography
            sx={{
              mb: 2,
              px: 3,
              pt: 2,
            }}
          >
            Transaction History  <b>{accountName && `of ${accountName}`}</b>
          </Typography>
          <Box sx={{ px: 3, pb: 2 }}>
            <GenericTable
              columns={columns}
              data={transactionHistory}
            />
          </Box>
        </CardContent>
      </Card>
      <TransactionDetailModalContainer
        open={open}
        onClose={handleClose}
        transactionId={selectedId}
        isCryptoView={isCryptoView}
      />

    </Box>
  );
};

export default TransactionHistory;

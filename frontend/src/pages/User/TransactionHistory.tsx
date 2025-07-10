import { useEffect, useState } from 'react';
import GenericTable from '@/components/common/genericTable';
import { Box, Card, CardContent, Typography, Chip, useTheme } from '@mui/material';
import { JwtPayload } from '@/types/jwt';
import { jwtDecode } from 'jwt-decode';
import api from '@/helpers/apiHelper';
import getSymbolFromCurrency from 'currency-symbol-map';
import { useLocation } from 'react-router-dom';
import VisibilityIcon from '@mui/icons-material/Visibility';
import TransactionDetailModal from '@/components/common/transactionDetailModal';
import moment from 'moment';

//Set the API URL based on the environment
const url = import.meta.env.VITE_NODE_ENV === "production" ? "api" : "api";

const TransactionHistory = () => {
  const location = useLocation();
  const theme = useTheme();
  const [transactionHistory, setTransactionHistory] = useState<any[]>([]);
  const [selectedRow, setSelectedRow] = useState<any | null>(null);
  const [open, setOpen] = useState(false);
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
            const isDebit = transaction?.extraType === "debit";
            
            const mappedTransaction = {
              _id: transaction._id,
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
    getTransactionById(row._id);
  };
  const getTransactionById = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const url = import.meta.env.VITE_NODE_ENV === "production" ? 'api' : 'api';
      const response = await api.get(`/${url}/v1/transaction/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.data.status === 201) {
        setSelectedRow(response.data.data[0] || response.data.data);
        setOpen(true);
      }
    } catch (error) {
      console.error("Error fetching transaction details:", error);
    }
  };
    const handleClose = () => {
    // console.log("Closing modal");
    setOpen(false);
    setSelectedRow(null);
  };
  // Check if current view is crypto
  const isCryptoView = location?.search?.includes("crypto");
  
  const columns = isCryptoView ? [
    // Crypto specific columns
    { field: 'date', headerName: 'DATE OF TRANSACTION', minWidth: 150 },
    { field: 'coin', headerName: 'COIN', minWidth: 120 },
    { field: 'side', headerName: 'SIDE', minWidth: 80 },
    { field: 'amount', headerName: 'AMOUNT', minWidth: 100 },
    { field: 'noOfCoins', headerName: 'NO. OF COINS', minWidth: 120 },
    // { field: 'walletAddress', headerName: 'WALLET ADDRESS', minWidth: 200 },
    { field: 'paymentType', headerName: 'PAYMENT TYPE', minWidth: 120 },
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
    { field: 'date', headerName: 'DATE OF TRANSACTION', minWidth: 150 },
    { field: 'trx', headerName: 'TRX', minWidth: 100 },
    { field: 'type', headerName: 'TYPE', minWidth: 200 },
    { field: 'amount', headerName: 'AMOUNT', minWidth: 100 },
    { field: 'balance', headerName: 'BALANCE', minWidth: 100 },
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
 const sentAmount =
    selectedRow?.receipient && selectedRow?.conversionAmount
      ? `${getSymbolFromCurrency(selectedRow?.from_currency)}${selectedRow?.amount}`
      : !selectedRow?.receipient && selectedRow?.conversionAmount
        ? (() => {
          if (selectedRow?.tr_type === "Stripe") {
            return `${getSymbolFromCurrency(selectedRow?.to_currency)}${selectedRow?.amount}`;
          } else if (selectedRow?.tr_type === "UPI") {
            return `${getSymbolFromCurrency(selectedRow?.from_currency)}${selectedRow?.amount}`;
          } else if (selectedRow?.trans_type === "Exchange") {
            return `${getSymbolFromCurrency(selectedRow?.from_currency)}${selectedRow?.amount}`;
          } else {
            return `${getSymbolFromCurrency(selectedRow?.from_currency)}${selectedRow?.amount}`;
          }
        })()
        : "--";

  // Define Received Amount
  const receivedAmount =
    selectedRow?.receipient && selectedRow?.conversionAmount
      ? `${getSymbolFromCurrency(selectedRow?.to_currency)}${selectedRow?.conversionAmount}`
      : !selectedRow?.receipient && selectedRow?.conversionAmount
        ? (() => {
          if (selectedRow?.tr_type === "Stripe") {
            return `${getSymbolFromCurrency(selectedRow?.from_currency)}${selectedRow?.conversionAmount}`;
          } else if (selectedRow?.tr_type === "UPI") {
            return `${getSymbolFromCurrency(selectedRow?.to_currency)}${selectedRow?.conversionAmount}`;
          } else if (selectedRow?.trans_type === "Exchange") {
            return `${getSymbolFromCurrency(selectedRow?.to_currency)}${selectedRow?.conversionAmount}`;
          } else {
            return `${getSymbolFromCurrency(selectedRow?.from_currency)}${selectedRow?.conversionAmount}`;
          }
        })()
        : "--";

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
        <TransactionDetailModal
              open={open}
              onClose={handleClose}
              title="Transaction Details"
              transactionData={{
                // ✅ Transaction Info
                transactionInfo: selectedRow && (isCryptoView ? {
                  // Crypto transaction info
                  "Transaction ID": selectedRow?._id,
                  "Requested Date": selectedRow?.createdAt
                    ? moment(selectedRow?.createdAt).local().format("YYYY-MM-DD hh:mm:ss A")
                    : "-",
                  "Coin": selectedRow?.coin,
                  "Side": selectedRow?.side,
                  "Amount": `${getSymbolFromCurrency(selectedRow?.currencyType)}${parseFloat(selectedRow?.amount || 0).toFixed(2)}`,
                  "Number of Coins": selectedRow?.noOfCoins,
                  "Fee": `${getSymbolFromCurrency(selectedRow?.currencyType)}${parseFloat(selectedRow?.fee || 0).toFixed(2)}`,
                  "Total Amount": `${getSymbolFromCurrency(selectedRow?.currencyType)}${(parseFloat(selectedRow?.amount || 0) + parseFloat(selectedRow?.fee || 0)).toFixed(2)}`,
                  "Wallet Address": selectedRow?.walletAddress,
                  "Payment Type": selectedRow?.paymentType,
                  "Transaction Status": selectedRow?.status,
                  "Settlement Date":
                    selectedRow?.status && ["completed", "success", "succeeded"].includes(selectedRow?.status?.toLowerCase())
                      ? moment(selectedRow?.updatedAt || selectedRow?.createdAt).local().format("YYYY-MM-DD hh:mm:ss A")
                      : "--",
                } : {
                  // Regular transaction info
                  "Trx": selectedRow?.trx,
                  "Requested Date": selectedRow?.createdAt
                    ? moment(selectedRow?.createdAt).local().format("YYYY-MM-DD hh:mm:ss A")
                    : "-",
                  "Fee":
                    selectedRow?.extraType === "debit"
                      ? `${getSymbolFromCurrency(selectedRow?.from_currency)}${parseFloat(selectedRow?.fee).toFixed(2)}`
                      : selectedRow?.tr_type === "Stripe"
                        ? `${getSymbolFromCurrency(selectedRow?.to_currency)}${parseFloat(selectedRow?.fee).toFixed(2)}`
                        : selectedRow?.trans_type === "Exchange"
                          ? `${getSymbolFromCurrency(selectedRow?.from_currency)}${parseFloat(selectedRow?.fee).toFixed(2)}`
                          : `${getSymbolFromCurrency(selectedRow?.from_currency)}${parseFloat(selectedRow?.fee).toFixed(2)}`,
                  "Bill Amount":
                    selectedRow?.extraType === "debit"
                      ? `${getSymbolFromCurrency(selectedRow?.from_currency)}${(parseFloat(selectedRow?.amount) + parseFloat(selectedRow?.fee)).toFixed(2)}`
                      : selectedRow?.tr_type === "Stripe"
                        ? `${getSymbolFromCurrency(selectedRow?.to_currency)}${(parseFloat(selectedRow?.amount) + parseFloat(selectedRow?.fee)).toFixed(2)}`
                        : selectedRow?.trans_type === "Exchange"
                          ? `${getSymbolFromCurrency(selectedRow?.from_currency)}${(parseFloat(selectedRow?.amount) + parseFloat(selectedRow?.fee)).toFixed(2)}`
                          : `${getSymbolFromCurrency(selectedRow?.from_currency)}${(parseFloat(selectedRow?.amount) + parseFloat(selectedRow?.fee)).toFixed(2)}`,
                  "Transaction Type": selectedRow?.receipient
                    ? "Transfer Money"
                    : `${selectedRow?.extraType} - ${selectedRow?.trans_type}`,
                  "Conversion Info": selectedRow?.receipient && selectedRow?.conversionAmount
                    ? `(Convert ${getSymbolFromCurrency(selectedRow?.from_currency)}${selectedRow?.amount} to ${getSymbolFromCurrency(selectedRow?.to_currency)}${selectedRow?.conversionAmount})`
                    : !selectedRow?.receipient && selectedRow?.conversionAmount
                      ? (() => {
                        if (selectedRow?.tr_type === "Stripe") {
                          return `(Convert ${getSymbolFromCurrency(selectedRow?.to_currency)}${selectedRow?.amount} to ${getSymbolFromCurrency(selectedRow?.from_currency)}${selectedRow?.conversionAmount})`;
                        } else if (selectedRow?.tr_type === "UPI") {
                          return `(Convert ${getSymbolFromCurrency(selectedRow?.from_currency)}${selectedRow?.amount} to ${getSymbolFromCurrency(selectedRow?.to_currency)}${selectedRow?.conversionAmount})`;
                        } else if (selectedRow?.trans_type === "Exchange") {
                          return `(Convert ${getSymbolFromCurrency(selectedRow?.from_currency)}${selectedRow?.amount} to ${getSymbolFromCurrency(selectedRow?.to_currency)}${selectedRow?.conversionAmount})`;
                        } else {
                          return `(Convert ${getSymbolFromCurrency(selectedRow?.from_currency)}${selectedRow?.amount} to ${getSymbolFromCurrency(selectedRow?.from_currency)}${selectedRow?.conversionAmount})`;
                        }
                      })()
                      : "--",
                  "Transaction Status":
                    ["succeeded", "success", "Success", "Complete", "Completed"].includes(selectedRow?.status)
                      ? "Success"
                      : selectedRow?.status,
      
                  "Settlement Date":
                    selectedRow?.status &&
                      ["Complete", "Success", "succeeded"].includes(selectedRow?.status)
                      ? moment(selectedRow?.updatedAt).local().format("YYYY-MM-DD hh:mm:ss A")
                      : "--",
                  "Trans Amt":
                    (selectedRow?.receipient
                      ? getSymbolFromCurrency(selectedRow?.from_currency)
                      : selectedRow?.extraType === "debit"
                        ? getSymbolFromCurrency(selectedRow?.from_currency)
                        : selectedRow?.tr_type === "Stripe"
                          ? getSymbolFromCurrency(selectedRow?.to_currency)
                          : selectedRow?.trans_type === "Exchange"
                            ? getSymbolFromCurrency(selectedRow?.from_currency)
                            : getSymbolFromCurrency(selectedRow?.from_currency)) + (selectedRow?.amount || ""),
                }),
                customerInfo: isCryptoView ? {
                  // Crypto customer info
                  "User Name": selectedRow?.userDetails?.[0]?.name,
                  "User Email": selectedRow?.userDetails?.[0]?.email,
                  "User Mobile": selectedRow?.userDetails?.[0]?.mobile,
                  "User Address": selectedRow?.userDetails?.[0]?.address,
                  "User City": selectedRow?.userDetails?.[0]?.city,
                  "User Country": selectedRow?.userDetails?.[0]?.country,
                  "Default Currency": selectedRow?.userDetails?.[0]?.defaultCurrency,
                  "User Status": selectedRow?.userDetails?.[0]?.status ? "Active" : "Inactive",
                } : {
                  // Regular customer info
                  "Sender Name":
                    selectedRow?.tr_type === "UPI"
                      ? selectedRow?.upi_email
                      : selectedRow?.tr_type === "bank-transfer"
                        ? selectedRow?.receipient
                          ? selectedRow?.senderAccountDetails?.[0]?.name
                          : selectedRow?.senderAccountDetails?.[0]?.name
                        : selectedRow?.extraType === "credit"
                          ? selectedRow?.transferAccountDetails?.[0]?.name
                          : selectedRow?.senderAccountDetails?.[0]?.name,
      
                  "Sender Account":
                    selectedRow?.tr_type === "UPI"
                      ? selectedRow?.upi_id
                      : selectedRow?.tr_type === "bank-transfer"
                        ? selectedRow?.receipient
                          ? selectedRow?.senderAccountDetails?.[0]?.iban
                          : selectedRow?.senderAccountDetails?.[0]?.iban
                        : selectedRow?.extraType === "credit"
                          ? selectedRow?.transferAccountDetails?.[0]?.iban
                          : selectedRow?.senderAccountDetails?.[0]?.iban,
      
                  "Sender Address":
                    selectedRow?.tr_type === "UPI"
                      ? selectedRow?.upi_contact
                      : selectedRow?.tr_type === "bank-transfer"
                        ? selectedRow?.receipient
                          ? selectedRow?.senderAccountDetails?.[0]?.address
                          : selectedRow?.senderAccountDetails?.[0]?.address
                        : selectedRow?.extraType === "credit"
                          ? selectedRow?.transferAccountDetails?.[0]?.address
                          : selectedRow?.senderAccountDetails?.[0]?.address,
      
                  "Receiver Name":
                    selectedRow?.extraType === "credit"
                      ? selectedRow?.senderAccountDetails?.[0]?.name
                      : selectedRow?.receipient
                        ? selectedRow?.recAccountDetails?.[0]?.name
                        : selectedRow?.transferAccountDetails?.[0]?.name,
      
                  "Receiver Account":
                    selectedRow?.extraType === "credit"
                      ? selectedRow?.senderAccountDetails?.[0]?.iban
                      : selectedRow?.receipient
                        ? selectedRow?.recAccountDetails?.[0]?.iban
                        : selectedRow?.transferAccountDetails?.[0]?.iban,
      
                  "Receiver Address":
                    selectedRow?.extraType === "credit"
                      ? selectedRow?.senderAccountDetails?.[0]?.address
                      : selectedRow?.receipient
                        ? selectedRow?.recAccountDetails?.[0]?.address
                        : selectedRow?.transferAccountDetails?.[0]?.address,
      
                  "Sent Amount": sentAmount,
                  "Received Amount": receivedAmount
                }
              }}
              dialogContentSx={{
                backgroundColor: theme.palette.background.default,
                color: theme.palette.text.primary,
              }}
              cardSx={{
                boxShadow: "none",
                border: "1px solid #ddd",
                backgroundColor: theme.palette.background.default,
              }}
              buttonSx={{ color: "white", borderColor: "white" }}
            />
      
    </Box>
  );
};

export default TransactionHistory;

import { useEffect, useState } from 'react';
import TransactionDetailModal from './transactionDetailModal';
import api from '@/helpers/apiHelper';
import { jwtDecode } from 'jwt-decode';
import getSymbolFromCurrency from 'currency-symbol-map';
import moment from 'moment';
import { useTheme } from '@mui/material';

const url = import.meta.env.VITE_NODE_ENV === "production" ? "api" : "api";

export default function TransactionDetailModalContainer({
  open,
  onClose,
  transactionId,
  isCryptoView = false,
}) {
  const theme = useTheme();
  const [selectedRow, setSelectedRow] = useState<any | null>(null);

  useEffect(() => {
    if (open && transactionId) {
      getTransactionById(transactionId);
    } else if (!open) {
      setSelectedRow(null);
    }
    // eslint-disable-next-line
  }, [open, transactionId]);

  const getTransactionById = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get(`/${url}/v1/transaction/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.data.status === 201) {
        setSelectedRow(response.data.data[0] || response.data.data);
      }
    } catch (error) {
      setSelectedRow(null);
      console.error("Error fetching transaction details:", error);
    }
  };

  // Calculate sentAmount
  const sentAmount = selectedRow?.receipient && selectedRow?.conversionAmount
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

  // Calculate receivedAmount
  const receivedAmount = selectedRow?.receipient && selectedRow?.conversionAmount
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

  // Calculate conversionInfo
  let conversionInfo = "";
  if (selectedRow?.receipient && selectedRow?.conversionAmount) {
    conversionInfo = `(Convert ${getSymbolFromCurrency(selectedRow?.from_currency)}${selectedRow?.amount} to ${getSymbolFromCurrency(selectedRow?.to_currency)}${selectedRow?.conversionAmount})`;
  } else if (!selectedRow?.receipient && selectedRow?.conversionAmount) {
    if (selectedRow?.tr_type === "Stripe") {
      conversionInfo = `(Convert ${getSymbolFromCurrency(selectedRow?.to_currency)}${selectedRow?.amount} to ${getSymbolFromCurrency(selectedRow?.from_currency)}${selectedRow?.conversionAmount})`;
    } else if (selectedRow?.tr_type === "UPI") {
      conversionInfo = `(Convert ${getSymbolFromCurrency(selectedRow?.from_currency)}${selectedRow?.amount} to ${getSymbolFromCurrency(selectedRow?.to_currency)}${selectedRow?.conversionAmount})`;
    } else if (selectedRow?.trans_type === "Exchange") {
      conversionInfo = `(Convert ${getSymbolFromCurrency(selectedRow?.from_currency)}${selectedRow?.amount} to ${getSymbolFromCurrency(selectedRow?.to_currency)}${selectedRow?.conversionAmount})`;
    } else {
      conversionInfo = `(Convert ${getSymbolFromCurrency(selectedRow?.from_currency)}${selectedRow?.amount} to ${getSymbolFromCurrency(selectedRow?.from_currency)}${selectedRow?.conversionAmount})`;
    }
  }

  // Build transactionInfo
  const transactionInfo = selectedRow && (isCryptoView ? {
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
    "Transaction Id": selectedRow?.trx,
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
      : `${selectedRow?.extraType?.charAt(0).toUpperCase() + selectedRow?.extraType?.slice(1)} - ${selectedRow?.trans_type}`,
    ...(conversionInfo ? { "Conversion Info": conversionInfo } : {}),
    "Transaction Status":
      ["succeeded", "success", "Success", "Complete", "Completed"].includes(selectedRow?.status)
        ? "Success"
        : selectedRow?.status?.charAt(0).toUpperCase() + selectedRow?.status?.slice(1).toLowerCase(),
    "Settlement Date":
      selectedRow?.status &&
        ["Complete", "Success", "succeeded"].includes(selectedRow?.status)
        ? moment(selectedRow?.updatedAt).local().format("YYYY-MM-DD hh:mm:ss A")
        : "--",
    "Transaction Amount":
      (selectedRow?.receipient
        ? getSymbolFromCurrency(selectedRow?.from_currency)
        : selectedRow?.extraType === "debit"
          ? getSymbolFromCurrency(selectedRow?.from_currency)
          : selectedRow?.tr_type === "Stripe"
            ? getSymbolFromCurrency(selectedRow?.to_currency)
            : selectedRow?.trans_type === "Exchange"
              ? getSymbolFromCurrency(selectedRow?.from_currency)
              : getSymbolFromCurrency(selectedRow?.from_currency)) + (selectedRow?.amount || ""),
  });

  // Build customerInfo
  const customerInfo = selectedRow?.trans_type === "Add Money"
    ? {
     Note: `Stripe to ${selectedRow?.senderAccountDetails?.[0]?.name || ''} (${selectedRow?.senderAccountDetails?.[0]?.iban || ''})`
  .replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1)),

    }
    : selectedRow?.trans_type === "Exchange"
      ? {
        "Sender Name": selectedRow?.userDetails?.[0]?.name,
        "Sender Account": selectedRow?.senderAccountDetails?.[0]?.iban,
        "Receiver Name": selectedRow?.userDetails?.[0]?.name,
        "Receiver Account": selectedRow?.transferAccountDetails?.[0]?.iban,
        "Sent Amount": sentAmount,
        "Received Amount": receivedAmount
      }
       : selectedRow?.trans_type === "Send Money"
      ? {
        "Sender Name": selectedRow?.userDetails?.[0]?.name,
        "Sender Account": selectedRow?.senderAccountDetails?.[0]?.iban,
        "Receiver Name": selectedRow?.recAccountDetails?.[0]?.name,
        "Receiver Account": selectedRow?.recAccountDetails?.[0]?.iban,
        "Sent Amount": sentAmount,
        "Received Amount": receivedAmount
      }
      : isCryptoView
        ? {
          "User Name": selectedRow?.userDetails?.[0]?.name,
          "User Email": selectedRow?.userDetails?.[0]?.email,
          "User Mobile": selectedRow?.userDetails?.[0]?.mobile,
          "User Address": selectedRow?.userDetails?.[0]?.address,
          "User City": selectedRow?.userDetails?.[0]?.city,
          "User Country": selectedRow?.userDetails?.[0]?.country,
          "Default Currency": selectedRow?.userDetails?.[0]?.defaultCurrency,
          "User Status": selectedRow?.userDetails?.[0]?.status ? "Active" : "Inactive",
        }
        : {
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
          "Sent Amount": sentAmount,
          "Received Amount": receivedAmount
        };

  return (
    <TransactionDetailModal
      open={open}
      onClose={onClose}
      title="Transaction Details"
      transactionData={{
        transactionInfo,
        customerInfo,
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
  );
} 
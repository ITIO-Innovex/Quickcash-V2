import { useState, useEffect } from 'react';
import CustomButton from '@/components/CustomButton';
import CommonFilter from '@/components/CustomFilter';
import { downloadPDF } from '../../../utils/downloadPDF';
import CustomModal from '../../../components/CustomModal';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { downloadExcel } from '../../../utils/downloadExcel';
import { FileSpreadsheet, FileText, Filter } from 'lucide-react';
import { Box, Button, Typography, useTheme, MenuItem, Select, FormControl, InputLabel, TextField} from '@mui/material';
import GenericTable from '../../../components/common/genericTable';
import api from '@/helpers/apiHelper';
import { jwtDecode } from 'jwt-decode';
import TransactionDetailModal from '@/components/common/transactionDetailModal';
import getSymbolFromCurrency from 'currency-symbol-map';
import moment from 'moment';

interface JwtPayload {
  sub: string;
  role: string;
  iat: number;
  exp: number;
  data: {
    defaultcurr: string;
    email: string;
    id: string;
    name: string;
    type: string;
  };
}

const FirstSection = () => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any | null>(null);
  const [filterText, setFilterText] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [list, setList] = useState<any[]>([]);
  const [currentData, setCurrentData] = useState<any[]>([]);
  // Date filter state
  const [dateFilter, setDateFilter] = useState("Today");
  const [customStartDate, setCustomStartDate] = useState<string | null>(null);
  const [customEndDate, setCustomEndDate] = useState<string | null>(null);

  const handleFilter = () => setShowFilter((prev) => !prev);

  const handleOpen = (row: any) => {
    getTransactionById(row._id);
  };

  const getTransactionById = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const url = import.meta.env.VITE_NODE_ENV === "production" ? 'api' : 'api';
      const response = await api.get(`/${url}/v1/transaction/${id}`);
      if (response.data.status === 201) {
        setSelectedRow(response.data.data[0] || response.data.data);
        setOpen(true);
      }
    } catch (error) {
      console.error("Error fetching transaction details:", error);
    }
  };

  const handleClose = () => {
    console.log("Closing modal");
    setOpen(false);
    setSelectedRow(null);
  };


  const url = import.meta.env.VITE_NODE_ENV === "production" ? 'api' : 'api';

  const getTransactionsList = async (filter: string, fromDate?: string, toDate?: string) => {
    try {
      const token = localStorage.getItem('token');
      const accountId = jwtDecode<JwtPayload>(token as string);
      let query = `/${url}/v1/transaction/list/${accountId.data.id}?filter=${filter}`;
      if (filter === 'Custom' && fromDate && toDate) {
        query += `&from=${fromDate}&to=${toDate}`;
      }
      const response = await api.get(query);
      if (response.data.status === 201) {
        setList(response.data.data);
        setCurrentData(response.data.data); // Set initial data
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  useEffect(() => {
    getTransactionsList(dateFilter);
  }, []);

  const handleDateFilterChange = (e: any) => {
    const value = e.target.value;
    setDateFilter(value);

    if (value !== 'Custom') {
      getTransactionsList(value);
    }
  };

  const handleCustomDateChange = (start: string, end: string) => {
    if (start && end) {
      getTransactionsList('Custom', start, end);
    }
  };

  const handleExcelDownload = () => {
    const formattedData = currentData.map((row) => ({
      'Created Date': row.createdAt,
      ID: row.trx,
      Type: row.trans_type,
      Amount: `$${Math.abs(row.amount)}`,
      Balance: row.postBalance,
      Status: row.status,
    }));
    downloadExcel(formattedData, 'TransactionsList.xlsx', 'TransactionsList');
  };

  const handleDownloadPDF = () => {
    const headers = ['Date', 'Transaction ID', 'Type', 'Amount', 'Balance', 'Status'];

    const formattedData = currentData.map((row) => {
      let amountStr = '';
      const fee = parseFloat(row?.fee || 0);
      const amount = parseFloat(row?.amount);

      // Determine currency symbol
      const fromSymbol = getSymbolFromCurrency(row?.from_currency);
      const toSymbol = getSymbolFromCurrency(row?.to_currency);

      // Apply display logic
      if (row?.extraType === 'debit') {
        amountStr = `-${fromSymbol}${(amount + fee).toFixed(2)}`;
      } else if (row?.tr_type === 'Stripe') {
        amountStr = `+${fromSymbol}${amount.toFixed(2)}`;
      } else {
        amountStr = `+${toSymbol}${amount.toFixed(2)}`;
      }

      return {
        'Date': row.createdAt,
        'Transaction ID': row.trx,
        'Type': row.type,
        'Amount': amountStr,
        'Balance': `$${row.postBalance.toFixed(2)}`,
        'Status': row.status,
      };
    });

    downloadPDF(formattedData, headers, 'TransactionsList.pdf', 'Transactions List');
  };


  const handleGlobalSearch = (text: string) => {
    setFilterText(text);
    if (!text.trim()) {
      setCurrentData(list);
      return;
    }

    const lower = text.toLowerCase();
    const filtered = list.filter((row) =>
      Object.values(row).some((val) => String(val).toLowerCase().includes(lower))
    );
    setCurrentData(filtered);
  };

  const columns = [
    {
      field: 'date',
      headerName: 'Date',
      render: (row: any) => row.createdAt?.slice(0, 10) || 'N/A'
    },
    { field: 'id', headerName: 'Transaction ID', render: (row: any) => `${row.trx}` },
    {
      field: 'type', headerName: 'Type',
      render: (row: any) => `${row.trans_type}`

    },
    {
      field: 'amount',
      headerName: 'Amount',
      render: (row: any) => {
        const symbolFrom = getSymbolFromCurrency(row?.from_currency);
        const symbolTo = getSymbolFromCurrency(row?.to_currency);
        const fee = parseFloat(row?.fee || 0);
        const amount = parseFloat(row?.amount || 0);
        const conversionAmount = parseFloat(row?.conversionAmount || 0);

        // Debit Case
        if (row?.extraType === 'debit') {
          return (
            <span>
              -{symbolFrom}
              {(amount + fee).toFixed(2)}
            </span>
          );
        }

        // Stripe or conversion-based logic
        if (row?.conversionAmount && !row?.receipient) {
          if (row?.tr_type === 'Stripe') {
            // Stripe: show converted (to from_currency)
            return (
              <span>
                +{symbolFrom}
                {conversionAmount.toFixed(2)}
              </span>
            );
          } else if (row?.tr_type === 'UPI' || row?.trans_type === 'Exchange') {
            return (
              <span>
                +{symbolTo}
                {conversionAmount.toFixed(2)}
              </span>
            );
          } else {
            return (
              <span>
                +{symbolFrom}
                {conversionAmount.toFixed(2)}
              </span>
            );
          }
        }

        // Default Credit Case
        return (
          <span>
            +{symbolTo}
            {amount.toFixed(2)}
          </span>
        );
      }
    },
    {
      field: 'balance',
      headerName: 'Balance',
      render: (row: any) => `${getSymbolFromCurrency(row?.to_currency)} ${parseFloat(row.postBalance).toFixed(2)}`
    },
    {
      field: 'status',
      headerName: 'Status',
      render: (row: any) => {
        const rawStatus = row.status?.toLowerCase();

        const isSuccess = ['succeeded', 'success', 'complete', 'successful'].includes(rawStatus);
        const displayText = isSuccess ? 'Success' : row.status;
        const statusClass = isSuccess ? 'success' : rawStatus; // force same class for all success types

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
      {/* Action buttons */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Filters */}
        <FormControl sx={{ minWidth: 160 }}>
          <InputLabel>Date Filter</InputLabel>
          <Select value={dateFilter} label="Date Filter" onChange={handleDateFilterChange}>
            <MenuItem value="Today">Today</MenuItem>
            <MenuItem value="Last-7-Days">Last 7 Days</MenuItem>
            <MenuItem value="Last-15-Days">Last 15 Days</MenuItem>
            <MenuItem value="Last-30-Days">Last 30 Days</MenuItem>
            <MenuItem value="Custom">Custom</MenuItem>
          </Select>
        </FormControl>
        {/* Filters End */}
        {/* Custome Filter */}
        {dateFilter === 'Custom' && (
          <>
            <TextField
              label="From"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={customStartDate || ''}
              onChange={(e) => {
                const val = e.target.value;
                setCustomStartDate(val);
                if (val && customEndDate) handleCustomDateChange(val, customEndDate);
              }}
            />
            <TextField
              label="To"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={customEndDate || ''}
              onChange={(e) => {
                const val = e.target.value;
                setCustomEndDate(val);
                if (customStartDate && val) handleCustomDateChange(customStartDate, val);
              }}
            />
          </>
        )}
        {/* Custome Filter Ended */}
        <FormControl sx={{ minWidth: 160 }}>
          <InputLabel>Export</InputLabel>
          <Select value={"Filter"} label="Export" onChange={handleDateFilterChange}>
            <MenuItem value="Filter">
              Select Export Type
            </MenuItem>
            <MenuItem value="Excel">
              <Button
                startIcon={<FileSpreadsheet size={20} />}
                sx={{ color: theme.palette.navbar.text }}
                onClick={handleExcelDownload}
                disabled={currentData.length === 0}
              >
                Download Excel
              </Button>
            </MenuItem>
            <MenuItem value="PDF">
              <Button
                  startIcon={<FileText size={20} />}
                  sx={{ color: theme.palette.navbar.text }}
                  onClick={handleDownloadPDF}
                  disabled={currentData.length === 0}
                >
                  Download PDF
                </Button>
            </MenuItem>
          </Select>
        </FormControl>
        <Button
            startIcon={<Filter size={20} />}
            sx={{ color: theme.palette.navbar.text }}
            onClick={handleFilter}
          >
            Filter
        </Button>

        
      </Box>

      {showFilter && (
        <CommonFilter
          label="Search any field"
          value={filterText}
          onChange={handleGlobalSearch}
          width="200px"
        />
      )}

      {currentData.length ? (
        <GenericTable columns={columns} data={currentData} />
      ) : (
        <Typography variant="body1" sx={{ mt: 2 }}>
          No data found.
        </Typography>
      )}

      <TransactionDetailModal
        open={open}
        onClose={handleClose}
        title="Transaction Details"
        transactionData={{
          // ✅ Transaction Info
          transactionInfo: selectedRow && {
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
          },
          customerInfo: {
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

export default FirstSection;

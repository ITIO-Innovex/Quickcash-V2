import React, { useEffect, useState } from 'react';
import CustomModal from '@/components/CustomModal';
import CommonFilter from '@/components/CustomFilter';
import { downloadPDF } from '../../../utils/downloadPDF';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { downloadExcel } from '../../../utils/downloadExcel';
import { Filter, FileSpreadsheet, FileText } from 'lucide-react';
import GenericTable from '../../../components/common/genericTable';
import { Box, Button, Typography, useTheme, MenuItem, Select, FormControl, InputLabel, TextField } from '@mui/material';
import { jwtDecode } from 'jwt-decode';
import api from '@/helpers/apiHelper';
import getSymbolFromCurrency from 'currency-symbol-map';
import TransactionDetailModalContainer from '@/components/common/TransactionDetailModalContainer';
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
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showFilter, setShowFilter] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [statementData, setStatementData] = useState<any[]>([]);
  const [currentData, setCurrentData] = useState<any[]>([]);
  // Date filter state
  const [dateFilter, setDateFilter] = useState("Today");
  const [customStartDate, setCustomStartDate] = useState<string | null>(null);
  const [customEndDate, setCustomEndDate] = useState<string | null>(null);

  const url = import.meta.env.VITE_NODE_ENV === 'production' ? 'api' : 'api';

  const getTransactionsList = async (filter: string, fromDate?: string, toDate?: string) => {
    try {
      const accountId = jwtDecode<JwtPayload>(localStorage.getItem('token') as string);
      let query = `/${url}/v1/transaction/list/${accountId?.data?.id}?status=Suc&page=1&size=1000&filter=${filter}`;
      if (filter === 'Custom' && fromDate && toDate) {
        query += `&from=${fromDate}&to=${toDate}`;
      }
      const response = await api.get(query);
      if (response.status === 201) {
        const data = response.data.data.map((item: any) => ({
          ...item,
          date: item.createdAt?.slice(0, 10), // Format date
          amount: parseFloat(item.amount).toFixed(2),
          balance: parseFloat(item.postBalance).toFixed(2),
        }));
        setStatementData(data);
        setCurrentData(data);
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    }
  };

  useEffect(() => {
    getTransactionsList(dateFilter);
  }, []);

  const getListById = async (id: any) => {
    await api.get(`/${url}/v1/transaction/${id}`
    )
      .then(result => {
        if (result.data.status == 201) {
          setSelectedId(result.data.data[0]);
          setOpen(true);
        }
      })
      .catch(error => {
        console.log("error", error);
      })
  }
  useEffect(() => {
    console.log("SelectedRow in modal:", selectedId);
  }, [selectedId]);
  const handleFilter = () => setShowFilter((prev) => !prev);

  const handleGlobalSearch = (text: string) => {
    setFilterText(text);

    if (!text.trim()) {
      setCurrentData(statementData);
      return;
    }

    const lower = text.toLowerCase();
    const filtered = statementData.filter((row) =>
      Object.values(row).some((val) => String(val).toLowerCase().includes(lower))
    );

    setCurrentData(filtered);
  };

  const handleActionClick = (row: any) => {
    setSelectedId(row._id);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedId(null);
  };
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
      'Created Date': row.date,
      'Transaction ID': row.trx,
      Type: row.trans_type,
      Amount: `$${row.amount}`,
      Balance: `$${row.balance}`,
      Status: row.status,
    }));
    downloadExcel(formattedData, 'statementList.xlsx', 'statementList');
  };

  const handleDownloadPDF = () => {
    const headers = ['Date', 'Transaction ID', 'Type', 'Amount', 'Balance', 'Status'];
    const formattedData = currentData.map((row) => ({
      Date: row.date,
      'Transaction ID': row.trx,
      Type: row.trans_type,
      Amount: `$${row.amount}`,
      Balance: `$${row.balance}`,
      Status: row.status,
    }));
    downloadPDF(formattedData, headers, 'StatementList.pdf', 'Statement List');
  };

  const columns = [
    { field: 'date', headerName: 'Date' },
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
      render: (row: any) => `$${parseFloat(row.balance).toFixed(2)}`,
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
          style={{ cursor: 'pointer' }}
          onClick={() => handleActionClick(row)}
        />
      ),
    },
  ];
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
          No Data Found.
        </Typography>
      )}


      <TransactionDetailModalContainer
        open={open}
        onClose={handleClose}
        transactionId={selectedId}
      />

    </Box>
  );
};

export default FirstSection;

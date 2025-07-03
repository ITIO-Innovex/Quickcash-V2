import { useState, useEffect } from 'react';
import CustomButton from '@/components/CustomButton';
import CommonFilter from '@/components/CustomFilter';
import { downloadPDF } from '../../../utils/downloadPDF';
import CustomModal from '../../../components/CustomModal';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { downloadExcel } from '../../../utils/downloadExcel';
import { FileSpreadsheet, FileText, Filter } from 'lucide-react';
import { Box, Button, Typography, useTheme } from '@mui/material';
import GenericTable from '../../../components/common/genericTable';
import api from '@/helpers/apiHelper';
import { jwtDecode } from 'jwt-decode';
import TransactionDetailModal from '@/components/common/transactionDetailModal';
import getSymbolFromCurrency from 'currency-symbol-map';

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

  const handleFilter = () => setShowFilter((prev) => !prev);

  const handleOpen = (row: any) => {
    setSelectedRow(row);
    setOpen(true);
  };

  const handleClose = () => {
  console.log("Closing modal");
  setOpen(false);
  setSelectedRow(null);
};


  const url = import.meta.env.VITE_NODE_ENV === "production" ? 'api' : 'api';

  const getTransactionsList = async () => {
    try {
      const token = localStorage.getItem('token');
      const accountId = jwtDecode<JwtPayload>(token as string);
      const response = await api.get(`/${url}/v1/transaction/list/${accountId.data.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      // console.log("API Status Values →", response.data.data.map((item: any) => item.status));

      if (response.data.status === 201) {
        setList(response.data.data);
        setCurrentData(response.data.data); // Set initial data

      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  useEffect(() => {
    getTransactionsList();
  }, []);

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
    const formattedData = currentData.map((row) => ({
      'Date': row.date,
      'Transaction ID': row.id,
      Type: row.type,
      Amount: `$${Math.abs(row.amount)}`,
      Balance: `$${Math.abs(row.balance)}`,
      Status: row.status,
    }));
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
        if (row?.extraType === 'debit') {
          return (
            <span>
              -{getSymbolFromCurrency(row?.from_currency)}
              {(parseFloat(row?.amount) + parseFloat(row?.fee || 0)).toFixed(2)}
            </span>
          );
        }
        // Credit logic
        if (row?.tr_type === 'Stripe') {
          return (
            <span>
              +{getSymbolFromCurrency(row?.from_currency)}
              {parseFloat(row?.amount).toFixed(2)}
            </span>
          );
        }
        return (
          <span>
            +{getSymbolFromCurrency(row?.to_currency)}
            {parseFloat(row?.amount).toFixed(2)}
          </span>
        );
      }
    },
    {
      field: 'balance',
      headerName: 'Balance',
      render: (row: any) => `$${parseFloat(row.postBalance).toFixed(2)}`
    },
    {
      field: 'status',
      headerName: 'Status',
      render: (row: any) => (
        <span className={`status-chip ${row.status.toLowerCase()}`}>
          {row.status}
        </span>
      )
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
      {/* Action buttons */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
        <Button
          startIcon={<FileSpreadsheet size={20} />}
          sx={{ color: theme.palette.navbar.text }}
          onClick={handleExcelDownload}
          disabled={currentData.length === 0}
        >
          Download Excel
        </Button>
        <Button
          startIcon={<FileText size={20} />}
          sx={{ color: theme.palette.navbar.text }}
          onClick={handleDownloadPDF}
          disabled={currentData.length === 0}
        >
          Download PDF
        </Button>
        <Button
          startIcon={<Filter size={20} />}
          onClick={handleFilter}
          sx={{ color: theme.palette.navbar.text }}
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
    transactionInfo: {
      "Transaction ID": selectedRow?.trx,
      Date: selectedRow?.createdAt?.slice(0, 10),
      Type: selectedRow?.trans_type,
      Amount: `${getSymbolFromCurrency(selectedRow?.from_currency)}${parseFloat(selectedRow?.amount || 0).toFixed(2)}`,
      Balance: `${getSymbolFromCurrency(selectedRow?.to_currency)}${parseFloat(selectedRow?.balance || 0).toFixed(2)}`,
      Status: selectedRow?.status,
    },
    customerInfo: {
      Name: "John Doe",
      Email: "john@example.com"
    },
    timeline: [
      { label: "Payment initiated", date: "Jun 1, 2025 12:00 AM", color: "#7e57c2" },
      { label: "Payment authorized", date: "Jun 1, 2025 12:00 AM", color: "#7e57c2" },
      { label: "Payment completed", date: "Jun 1, 2025 12:00 AM", color: "#4caf50" }
    ],
    actions: [
      { label: "Issue Refund", onClick: () => console.log("Refund") },
      { label: "Send Receipt", onClick: () => console.log("Send Receipt") },
      { label: "Create Dispute", onClick: () => console.log("Dispute") }
    ]
  }}
   dialogContentSx={{ backgroundColor:theme.palette.background.default ,color:theme.palette.text.primary}}
  cardSx={{ boxShadow: "none", border: "1px solid #ddd", backgroundColor:theme.palette.background.default}}
  buttonSx={{ color: "white", borderColor: "white" }}
/>

    </Box>
  );
};

export default FirstSection;

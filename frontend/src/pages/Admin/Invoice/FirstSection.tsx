import { useEffect, useState } from 'react';
import autoTable from 'jspdf-autotable';
import CustomModal from '@/components/CustomModal';
import { downloadPDF } from '../../../utils/downloadPDF';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { downloadExcel } from '../../../utils/downloadExcel';
import { Filter, FileSpreadsheet, FileText } from 'lucide-react';
import GenericTable from '../../../components/common/genericTable';
import { Box, Button, Typography, useTheme, TextField } from '@mui/material';
import CommonFilter from '@/components/CustomFilter';
import CustomButton from '@/components/CustomButton';
import { jwtDecode } from 'jwt-decode';
import admin from '@/helpers/adminApiHelper';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Tooltip, IconButton } from '@mui/material';
import InvoiceGeneratedListModal ,{dummyInvoiceData}from './TransactionDetails';
const url = import.meta.env.VITE_NODE_ENV == "production" ? 'api' : 'api';

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
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any | null>(null);
  const [filterText, setFilterText] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [list, setList] = useState<any>();
  const [copiedRowId, setCopiedRowId] = useState<string | null>(null);
  const handleFilter = () => {
    setShowFilter((prev) => !prev);
  };
  useEffect(() => {
    const accountId = jwtDecode<JwtPayload>(localStorage.getItem('admin') as string);
    getTransactionsList(accountId.data.id);
  }, []);

  const handleInvoiceModalOpen = () => {
    setSelectedRow(dummyInvoiceData);   
    setInvoiceModalOpen(true);          
    handleMenuClose();                  
  };
  const getTransactionsList = async (id: any) => {
    await admin.get(`/${url}/v1/admin/invoice/list/${id}`)
      .then(result => {
        if (result.data.status == 201) {
          setList(result.data.data);
          setCurrentData(result.data.data);
        }
      })
      .catch(error => {
        console.log("error", error);
      })
  }


  const handleExcelDownload = () => {
    const formattedData = currentData.map((row) => ({
      InvoiceNumber: row.invoice_number,
      InvoiceDate: row.invoice_date,
      InvoiceDueDate: row.due_date,
      Amount: row.total,
      Transactions: row.dueAmount,
      Status: row.status,
    }));

    downloadExcel(formattedData, 'TransactionsList.xlsx', 'TransactionsList');
  };

  const handleDownloadPDF = () => {
    const headers = [
      'InvoiceNumber',
      'InvoiceDate',
      'InvoiceDueDate',
      'Amount',
      'Transactions',
      'Status',
    ];

    const formattedData = currentData.map((row) => ({
      InvoiceNumber: row.invoice_number,
      InvoiceDate: row.invoice_date,
      InvoiceDueDate: row.due_date,
      Amount: `${Math.abs(Number(row.total.replace(/[^\d.-]/g, '')))}`,
      Transactions: row.dueAmount,
      Status: row.status,
    }));

    downloadPDF(formattedData, headers, 'InvoiceList.pdf', 'Invoice List');
  };

  const handleGlobalSearch = (text: string) => {
    setFilterText(text);

    if (text.trim() === '') {
      setCurrentData(list);
      return;
    }

    const lower = text.toLowerCase();

    const filtered = list.filter((row) =>
      Object.values(row).some((val) =>
        String(val).toLowerCase().includes(lower)
      )
    );

    setCurrentData(filtered ? filtered : []);
    console.log('Filtering by:', text, '→ Found:', filtered, 'items');
  };

  const [currentData, setCurrentData] = useState(list);

  const handleActionClick = (row: any) => {
    setSelectedRow(row);
    setOpen(true);
  };

  const columns = [
    { field: 'invoice_number', headerName: 'InvoiceNumber' },
    { field: 'invoice_date', headerName: 'InvoiceDate' },
    { field: 'due_date', headerName: 'InvoiceDueDate' },
    {
      field: 'total',
      headerName: 'Amount',
      render: (row: any) =>
        row.total != null && row.currency_text
          ? `${row.currency_text} ${row.total.toFixed(2)}`
          : 'N/A',
    },

    { field: 'dueAmount', headerName: 'Transactions' },
    {
      field: 'status',
      headerName: 'Status',
      render: (row: any) => {
        let chipClass = '';

        switch (row.status.toLowerCase()) {
          case 'paid':
            chipClass = 'success';
            break;
          case 'unpaid':
            chipClass = 'unpaid';
            break;
          case 'partial':
            chipClass = 'pending';
            break;
          default:
            chipClass = ''; // fallback
        }

        return <span className={`status-chip ${chipClass}`}>{row.status}</span>;
      },
    },
    {
      field: 'action',
      headerName: 'Action',
      render: (row: any) => (
        <Box display="flex" gap={1}>
          <IconButton onClick={handleInvoiceModalOpen}>
            <VisibilityIcon style={{ cursor: 'pointer',color:'black' }} />
          </IconButton>
          <Tooltip title="Copy Invoice URL">
            <IconButton
              onClick={() => {
                if (row.url) {
                  navigator.clipboard.writeText(row.url);
                  setCopiedRowId(row._id);
                  setTimeout(() => setCopiedRowId(null), 1000);
                }
              }}
            >
              {copiedRowId === row._id ? (
                <CheckCircleIcon color="success" />
              ) : (
                <ContentCopyIcon style={{ cursor: 'pointer' }} />
              )}
            </IconButton>
          </Tooltip>
        </Box>
      ),
    }
  ];

  return (
    <Box>
      {/* Action Buttons */}
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          mb: 3,
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <Button
          startIcon={<FileSpreadsheet size={20} />}
          sx={{ color: theme.palette.navbar.text }}
          onClick={handleExcelDownload}
          disabled={currentData === 0}
        >
          Download Excel
        </Button>

        <Button
          startIcon={<FileText size={20} />}
          sx={{ color: theme.palette.navbar.text }}
          onClick={handleDownloadPDF}
          disabled={currentData === 0}
        >
          {' '}
          Download PDF
        </Button>

        <Button
          startIcon={<Filter size={20} />}
          onClick={handleFilter}
          sx={{ color: theme.palette.navbar.text }}
        >
          {' '}
          Filter{' '}
        </Button>
      </Box>

      {/* Filter Input */}
      {showFilter && (
        <CommonFilter
          label="Search any field"
          value={filterText}
          onChange={handleGlobalSearch}
          width="200px"
        />
      )}
      {currentData ? (
        <GenericTable columns={columns} data={currentData} />
      ) : (
        <Typography variant="body1" sx={{ mt: 2 }}>
          No data found.
        </Typography>
      )}

    <InvoiceGeneratedListModal open={invoiceModalOpen} onClose={() => setInvoiceModalOpen(false)} data={dummyInvoiceData}/>
    </Box>
  );
};

export default FirstSection;
function handleMenuClose() {
  throw new Error('Function not implemented.');
}


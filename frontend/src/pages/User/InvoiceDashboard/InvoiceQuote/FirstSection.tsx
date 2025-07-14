import api from '@/helpers/apiHelper';
import { jwtDecode } from 'jwt-decode';
import { JwtPayload } from '@/types/jwt';
import { useEffect, useState } from 'react';
import CustomModal from '@/components/CustomModal';
import DeleteIcon from '@mui/icons-material/Delete';
import CommonFilter from '@/components/CustomFilter';
import { motion, AnimatePresence } from 'framer-motion';
import CommonTooltip from '@/components/common/toolTip';
import getSymbolFromCurrency from 'currency-symbol-map';
import { downloadPDF } from '../../../../utils/downloadPDF';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Filter, FileSpreadsheet, FileText } from 'lucide-react';
import { downloadExcel } from '../../../../utils/downloadExcel';
import { Box, Button, Typography, useTheme } from '@mui/material';
import GenericTable from '../../../../components/common/genericTable';
import axios from 'axios';
import { useAppToast } from '@/utils/toast';

const FirstSection = () => {
  const theme = useTheme();
  const toast = useAppToast();
  const [open, setOpen] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [currentData, setCurrentData] = useState<any[]>([]);
  const [rowToDelete, setRowToDelete] = useState<any>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any | null>(null);
  const [copiedQuote, setCopiedQuote] = useState<string | null>(null);
  const url = import.meta.env.VITE_NODE_ENV == "production" ? 'api' : 'api';

  const handleFilter = () => {
    setShowFilter((prev) => !prev);
  };

  useEffect(() => {
    const accountId = jwtDecode<JwtPayload>(localStorage.getItem('token') as string);
    getQuoteList(accountId.data.id);
  }, []);
  const getQuoteList = async (id: any) => {
    try {
      const result = await api.get(`/${url}/v1/quote/list/${id}`);
      if (result.status === 201) {
        setCurrentData(result.data.data);
      }
    } catch (error) {
      console.error('Error fetching quote list:', error);
    }
  }

  const handleExcelDownload = () => {
    const formattedData = currentData.map((row) => ({
      'Created Date': row.invoice_date,
      'Due Date': row.due_date,
      'Quote Number': row.quote_number,
      Amount: `${getSymbolFromCurrency(row?.currency)} ${row?.total}`,
      Status: row.status,
    }));

    downloadExcel(formattedData, 'QuotesList.xlsx', 'QuotesList');
  };

  const handleDownloadPDF = () => {
    const headers = [
      'Date',
      'Due Date',
      'Quote Number',
      'Amount',
      'Status',
    ];
    const formattedData = currentData.map((row) => ({
      'Date': row.invoice_date,
      'Due Date': row.due_date,
      'Quote Number': row.quote_number,
      Amount: `${getSymbolFromCurrency(row?.currency)} ${row?.total}`,
      Status: row.status,
    }));

    downloadPDF(
      formattedData,
      headers,
      'QuotesList.pdf',
      'Quote List'
    );
  };

  const handleGlobalSearch = (text: string) => {
    setFilterText(text);

    if (text.trim() === '') {
      setCurrentData(currentData);
      return;
    }

    const lower = text.toLowerCase();

    const filtered = currentData.filter((row) =>
      Object.values(row).some((val) =>
        String(val).toLowerCase().includes(lower)
      )
    );

    setCurrentData(filtered.length ? filtered : []);
    console.log('Filtering by:', text, '→ Found:', filtered.length, 'items');
  };

  const handleActionClick = (row: any) => {
    setSelectedRow(row);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedRow(null);
  };

  // Temporary alertnotify if not globally available
  const alertnotify = (text: string, type: string) => {
    if (type === 'success') window.alert(text);
    else window.alert(text);
  };

  const HandleDeleteQuote = async (val: any) => {
    var r = confirm("Are you sure?");
    if (r == true) {
      await axios.delete(`/${url}/v1/quote/delete/${val}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        }
      })
        .then(result => {
          if (result.data.status == "201") {
            const accountId = jwtDecode<JwtPayload>(localStorage.getItem('token') as string);
            getQuoteList(accountId.data.id);
            toast.success("Selected Quote has been deleted Successfully");
            setDeleteModalOpen(false);
          }
        })
        .catch(error => {
          console.log("error", error);
          toast.error(error?.response?.data?.message || 'Error deleting quote');
        });
    } else {
      return false;
    }
  };

  const columns = [
    {
      field: 'quote_number',
      headerName: 'Quote Number',
      render: (row: any) => (
        <Box component="span" className="clickable-content" onClick={() => { navigator.clipboard.writeText(`https://yourdomain.com/Quote/${row.quote_number}`); setCopiedQuote(row.quote_number); setTimeout(() => setCopiedQuote(null), 1000); }} sx={{ display: 'flex', alignItems: 'center', gap: 1, position: 'relative' }}>

          <AnimatePresence mode="wait">
            {copiedQuote === row.quote_number ? (
              <motion.span key="tick" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} transition={{ duration: 0.3 }} >
                <CheckCircleIcon color="success" fontSize="small" />
              </motion.span>
            ) : (
              <motion.span key="text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                <Typography variant="body2"
                  sx={{
                    color: "primary.main",
                    textDecoration: "underline",
                  }}
                >
                  {row.quote_number}
                </Typography>
              </motion.span>
            )}
          </AnimatePresence>
          {/* Tooltip only when copied */}
          <AnimatePresence>
            {copiedQuote === row.quote_number && (
              <motion.div
                key="tooltip"
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                transition={{ duration: 0.3 }}
                style={{
                  position: "absolute",
                  top: "-30px",
                  left: 0,
                  background: "#333",
                  color: "#fff",
                  padding: "4px 10px",
                  borderRadius: "4px",
                  fontSize: "12px",
                  whiteSpace: "nowrap",
                  zIndex: 10,
                }}
              >
                Quote Number Copied!
              </motion.div>
            )}
          </AnimatePresence>
        </Box>
      )
    },
    { field: 'invoice_date', headerName: 'Quote Date' },
    { field: 'due_date', headerName: 'Due Date' },
    {
      field: 'amount',
      headerName: 'Amount',
      render: (row: any) => `${getSymbolFromCurrency(row?.currency)} ${row?.total}`,
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
        <Box display="flex" gap={1}>
          <VisibilityIcon style={{ cursor: 'pointer' }} onClick={() => handleActionClick(row)} />
          <DeleteIcon sx={{ cursor: 'pointer', color: '#FF0000' }} onClick={() => handleDelete(row)} />
        </Box>
      )
    }
  ];

  const handleDelete = (row: any) => {
    setRowToDelete(row);
    setDeleteModalOpen(true);
    console.log('Trying to delete:', row);
  };

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
        <Button startIcon={<FileSpreadsheet size={20} />}
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

      {showFilter && (
        <CommonFilter label="Search any field"
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

      <CustomModal open={open} onClose={handleClose} title="Product Details" sx={{ backgroundColor: theme.palette.background.default }}>
        <div className="header-divider" />

        <Box sx={{ mt: 2 }}>
          <Box display="flex" justifyContent="space-between" mb={2}>
            <Typography><strong>Quote Date:</strong></Typography>
            <Typography>{selectedRow?.invoice_date}</Typography>
          </Box>

          <Box display="flex" justifyContent="space-between" mb={2}>
            <Typography><strong>Due Date:</strong></Typography>
            <Typography>{selectedRow?.due_date}</Typography>
          </Box>
          <Box display="flex" justifyContent="space-between" mb={2}>
            <Typography><strong>Quote Number:</strong></Typography>
            <Typography>{selectedRow?.quote_number}</Typography>
          </Box>

          <Box display="flex" justifyContent="space-between" mb={2}>
            <Typography><strong>Amount:</strong></Typography>
            <Typography>{getSymbolFromCurrency(selectedRow?.currency)}{selectedRow?.total}</Typography>
          </Box>

          <Box display="flex" justifyContent="space-between" mb={2}>
            <Typography><strong>Status:</strong></Typography>
            <Typography>{selectedRow?.status}</Typography>
          </Box>

          <Button
            className="custom-button"
            onClick={handleClose}
            sx={{ mt: 3 }}
          >
            <span className="button-text">Close</span>
          </Button>
        </Box>
      </CustomModal>

      {/* Delete Modal */}
      <CustomModal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Confirm Delete" sx={{ backgroundColor: theme.palette.background.default }} >
        <Typography>
          Are you sure you want to delete this Invoice?
        </Typography>

        <Box display="flex" justifyContent="flex-end" gap={2} mt={3}>
          <Button
            variant="contained"
            color="error"
            onClick={() => HandleDeleteQuote(rowToDelete?._id)}
          >
            Yes, Delete
          </Button>
        </Box>
      </CustomModal>
    </Box>
  );
};

export default FirstSection;

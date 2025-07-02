import React, { useEffect, useState } from 'react';
import CustomModal from '@/components/CustomModal';
import CommonFilter from '@/components/CustomFilter';
import { downloadPDF } from '../../../utils/downloadPDF';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { downloadExcel } from '../../../utils/downloadExcel';
import { Filter, FileSpreadsheet, FileText } from 'lucide-react';
import GenericTable from '../../../components/common/genericTable';
import { Box, Button, Typography, useTheme } from '@mui/material';
import { jwtDecode } from 'jwt-decode';
import api from '@/helpers/apiHelper';

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
  const [showFilter, setShowFilter] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [statementData, setStatementData] = useState<any[]>([]);
  const [currentData, setCurrentData] = useState<any[]>([]);

  const url = import.meta.env.VITE_NODE_ENV === 'production' ? 'api' : 'api';

  const getTransactionsList = async () => {
    try {
      const accountId = jwtDecode<JwtPayload>(localStorage.getItem('token') as string);
      const response = await api.get(`/${url}/v1/transaction/list/${accountId?.data?.id}?status=Suc&page=1&size=1000`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

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
    getTransactionsList();
  }, []);

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
    setSelectedRow(row);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedRow(null);
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
      render: (row: any) =>
        `${row.amount < 0 ? '-' : '+'}$${parseFloat(row.amount).toFixed(2)}`,
    },
    {
      field: 'balance',
      headerName: 'Balance',
      render: (row: any) => `$${parseFloat(row.balance).toFixed(2)}`,
    },
    {
      field: 'status',
      headerName: 'Status',
      render: (row: any) => (
        <span className={`status-chip ${row.status?.toLowerCase()}`}>
          {row.status}
        </span>
      ),
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
      <Box display="flex" gap={2} mb={3} flexWrap="wrap" alignItems="center">
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

      <CustomModal open={open} onClose={handleClose} title="Statement Details">
        <div className="header-divider" />
        <Box sx={{ mt: 2 }}>
          {[
            ['Date', selectedRow?.date],
            ['Transaction ID', selectedRow?.trx],
            ['Type', selectedRow?.trans_type],
            ['Amount', `$${parseFloat(selectedRow?.amount || 0).toFixed(2)}`],
            ['Balance', `$${parseFloat(selectedRow?.balance || 0).toFixed(2)}`],
            ['Status', selectedRow?.status],
          ].map(([label, value]) => (
            <Box display="flex" justifyContent="space-between" mb={2} key={label}>
              <Typography><strong>{label}:</strong></Typography>
              <Typography>{value}</Typography>
            </Box>
          ))}
          <Button className="custom-button" onClick={handleClose} sx={{ mt: 3 }}>
            <span className="button-text">Close</span>
          </Button>
        </Box>
      </CustomModal>
    </Box>
  );
};

export default FirstSection;

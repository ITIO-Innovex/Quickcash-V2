import React, { useEffect, useState } from 'react';
import CommonFilter from '@/components/CustomFilter';
import CustomButton from '@/components/CustomButton';
import { downloadPDF } from '../../../../utils/downloadPDF';
import VisibilityIcon from '@mui/icons-material/Visibility';
import {KeyValueDisplay} from '@/components/KeyValueDisplay';
import CustomModal from '../../../../components/CustomModal';
import { downloadExcel } from '../../../../utils/downloadExcel';
import { FileSpreadsheet, FileText, Filter } from 'lucide-react';
import { Box, Button, Typography, useTheme } from '@mui/material';
import GenericTable from '../../../../components/common/genericTable';
import TransactionDetailModal from '../../../../components/common/transactionDetailModal';
import admin from '@/helpers/adminApiHelper';
const url = import.meta.env.VITE_NODE_ENV == "production" ? 'api' : 'api';

const FirstSection = () => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any | null>(null);
  const [transactionModalOpen, setTransactionModalOpen] = useState(false);
  const [transactionModalData, setTransactionModalData] = useState<any>(null);

  const handleFilter = () => {
    setShowFilter((prev) => !prev);
  };
  const handleOpen = (row: any) => {
    setSelectedRow(row);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedRow(null);
  };
const [list, setList] = useState<any[]>([]);
const [currentData, setCurrentData] = useState<any[]>([]);

  const [listOne,setListOne] = React.useState<any>();
  // const { toPDF, targetRef } = usePDF({filename: 'transactionList.pdf'});

  useEffect(() => {
    getTransactionsList();
  },[location])

  const getTransactionsList = async() => {
    await admin.get(`/${url}/v1/transaction/admin/listall`, 
   )
    .then(result => {
      if(result.data.status == 201) {
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
      'Created Date': row.createdAt ? row.createdAt.slice(0, 10) : '',
      ID: row.trx,
      Type: row.trans_type,
      Amount: `$${Math.abs(row.conversionAmount)}`,
      Details: row.info,
      Status: row.status,
    }));

    downloadExcel(formattedData, 'TransactionsList.xlsx', 'TransactionsList');
  };

  const handleDownloadPDF = () => {
    const headers = [
      'Date',
      'Transaction ID',
      'Type',
      'Amount',
      'Details',
      'Status',
    ];
    const formattedData = currentData.map((row) => ({
      'Date': row.createdAt ? row.createdAt.slice(0, 10) : '',
      'Transaction ID': row.trx,
      Type: row.trans_type,
      Amount: `$${Math.abs(row.conversionAmount)}`,
      Details: row.info,
      Status: row.status,
    }));

    downloadPDF(
      formattedData,
      headers,
      'TransactionsList.pdf',
      'Transactions List'
    );
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

   setCurrentData(filtered);
  // console.log('Filtering by:', text, '→ Found:', filtered.length, 'items');
};



  const columns = [
    {
      field: 'createdAt',
      headerName: 'Date',
      render: (row: any) => row.createdAt ? row.createdAt.slice(0, 10) : '',
    },
    { field: 'trx', headerName: 'Transaction ID' },
    { field: 'trans_type', headerName: 'Type' },
    {
      field: 'conversionAmount',
      headerName: 'Amount',
      render: (row: any) =>
        `${row.conversionAmount < 0 ? '-' : '+'}${Math.abs(row.conversionAmount)}`,
    },
    {
      field: 'info',
      headerName: 'details',
      render: (row: any) => `${row.info}`,
    },
    {
      field: 'status',
      headerName: 'Status',
      render: (row: any) => (
        <span className={`status-chip ${row.status.toLowerCase()}`}>
          {row.status}
        </span>
      ),
    },
    {
      field: 'action',
      headerName: 'Action',
      render: (row: any) => (
        <VisibilityIcon
          sx={{ cursor: 'pointer' }}
          onClick={() => handleOpen(row)}
        />
      ),
    },
  ];

  return (
    <Box>
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
        disabled={!currentData?.length}
        >
          Download Excel
        </Button>

        <Button
          startIcon={<FileText size={20} />}
          sx={{ color: theme.palette.navbar.text }}
          onClick={handleDownloadPDF}
        disabled={!currentData?.length}
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

      {/* Modal */}
 <CustomModal open={open} onClose={handleClose} sx={{ backgroundColor: theme.palette.background.default }} title={''}>
  {selectedRow && (
    <>
      <Typography className="section-title">Transaction Info</Typography>
      <KeyValueDisplay
        data={{
          'Trx. Id': selectedRow.id,
          'Requested Date': selectedRow.date,
          'Fee': '$2.00',
          'Bill Amount': selectedRow.amount,
          'Transaction Type': selectedRow.type,
        }}
      />

      <Typography className="section-title">Sender Info</Typography>
      <KeyValueDisplay
        data={{
          'Sender Name': 'John Doe',
          'Account No': '1234567890',
          'Sender Address': '123 Main St, City',
        }}
      />

      <Typography className="section-title">Receiver Info</Typography>
      <KeyValueDisplay
        data={{
          'Receiver Name': 'Jane Smith',
          'Account No': '0987654321',
          'Receiver Address': '456 Elm St, City',
        }}
      />

      <div className="header-divider" />
      <Box display="flex" justifyContent="space-between" mb={2} mt={4}>
        <Typography>
          <strong>Date:</strong>
        </Typography>
        <Typography>{selectedRow.createdAt?.slice(0, 10)}</Typography>
      </Box>

      <Box display="flex" justifyContent="space-between" mb={2}>
        <Typography>
          <strong>Transaction ID:</strong>
        </Typography>
        <Typography>{selectedRow.trx}</Typography>
      </Box>

      <Box display="flex" justifyContent="space-between" mb={2}>
        <Typography>
          <strong>Type:</strong>
        </Typography>
        <Typography>{selectedRow.trans_type}</Typography>
      </Box>

      <Box display="flex" justifyContent="space-between" mb={2}>
        <Typography>
          <strong>Amount:</strong>
        </Typography>
        <Typography>{selectedRow.conversionAmount}</Typography>
      </Box>

      <Box display="flex" justifyContent="space-between" mb={2}>
        <Typography>
          <strong>details:</strong>
        </Typography>
        <Typography>{selectedRow.info}</Typography>
      </Box>

      <Typography className="section-title">Bank Status</Typography>
      <KeyValueDisplay
        data={{
          'Trx': selectedRow.id,
          'Transfer Amount': `$${Math.abs(selectedRow.amount)}`,
          'Settle Amount': '$100.00',
          'TransactionStatus': selectedRow.status,
        }}
      />

      <Box display="flex" justifyContent="flex-end" gap={2}>
        <CustomButton onClick={handleClose}>Close</CustomButton>
      </Box>
    </>
  )}
</CustomModal>
    </Box>
  );
}

export default FirstSection;

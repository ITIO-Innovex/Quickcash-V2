import { useEffect, useState } from 'react';
import CustomModal from '@/components/CustomModal';
import CommonFilter from '@/components/CustomFilter';
import { downloadPDF } from '../../../../utils/downloadPDF';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { downloadExcel } from '../../../../utils/downloadExcel';
import { Filter, FileSpreadsheet, FileText } from 'lucide-react';
import { Avatar, Box, Button, Typography, useTheme, Grid } from '@mui/material';
import GenericTable from '../../../../components/common/genericTable';
import { jwtDecode } from 'jwt-decode';
import { JwtPayload } from '@/types/jwt';
import api from '@/helpers/apiHelper';
import AssignmentIcon from '@mui/icons-material/Assignment';
import moment from 'moment';

const FirstSection = () => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any | null>(null);
  const [viewDetails, setViewDetails] = useState<any | null>(null);
  const url = import.meta.env.VITE_NODE_ENV == "production" ? 'api' : 'api';

  const handleFilter = () => {
    setShowFilter((prev) => !prev);
  };

  const [currentData, setCurrentData] = useState([]);
  useEffect(() => {
    const accountId = jwtDecode<JwtPayload>(localStorage.getItem('token') as string);
    getManualInvoiceList();
  }, []);

  const getManualInvoiceList = async () => {
    try {
      const result = await api.get(`/${url}/v1/manualPayment/list`);
      if (result.data.status === 201) {
        setCurrentData(result.data.data);
      } else {
        setCurrentData([]);
        console.error("Failed to fetch invoice list:", result.data.message);
      }
    } catch (error) {
      console.error('Error fetching invoice list:', error);
    }
  }
  const handleExcelDownload = () => {
    const formattedData = currentData.map((row) => ({
      'Date': row.paymentDate.slice(0, 10),
      'ID': row.invoice,
      // Amount: `$${Math.abs(row.amount)}`,
      'Payment Mode': row.paymentMode,
      // 'Amount': `${row.amountCurrencyText ?? ''}${Math.abs(row.amount ?? 0)}`
      'Amount': row.amount
    }));

    downloadExcel(formattedData, 'ManualInvoicePaymentList.xlsx', 'ManualInvoicePaymentList');
  };

  const handleDownloadPDF = () => {
    const headers = [
      'Date',
      'ID',
      'Payment Mode',
      'Amount',
    ];
    const formattedData = currentData.map((row) => ({
      'Date': row.paymentDate.slice(0, 10),
      'ID': row.invoice,
      // Amount: `$${Math.abs(row.amount)}`,
      'Payment Mode': row.paymentMode,
      // 'Amount': `${row.amountCurrencyText ?? ''}${Math.abs(row.amount ?? 0)}`
      'Amount': row.amount
    }));

    downloadPDF(
      formattedData,
      headers,
      'ManualPayementList.pdf',
      'ManualPayementList'
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


  const HandleGetProductData = async (val: any) => {
    console.log('Fetching details for ID:', val);
    try {
      const result = await api.get(`/${url}/v1/manualPayment/${val}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (result?.data?.status === 201) {
        setViewDetails(result?.data?.data);
      }
    } catch (error: any) {
      alert(error?.response?.data?.message || "Error fetching details");
      console.log("error", error);
    }
  };

  const handleActionClick = (row: any) => {
    console.log('Row data:', row);
    setSelectedRow(row);
    setOpen(true);
    // Dynamically fetch details using the selected row's ID
    HandleGetProductData(row._id);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedRow(null);
    setViewDetails(null);
  };


  const columns = [
    {
      field: 'invoices',
      headerName: 'Invoices',
      render: (row: any) => (
        <>
          <Grid sx={{ display: 'flex', flexDirection: 'row', gap: '12px' }}>
            <Grid sx={{ display: { xs: 'none', md: 'flex' }, flexDirection: 'row', alignItems: 'center' }}>
              <Avatar sx={{ color: 'white', background: '#8657E5' }}>
                <AssignmentIcon />
              </Avatar>
            </Grid>
            <Grid sx={{ display: 'flex', flexDirection: 'column' }}>
              <Grid>{row?.clientInfo?.[0]?.name} {row?.invoiceDetails?.[0]?.invoice_number}</Grid>
              <Grid>{row?.clientInfo?.[0]?.email}</Grid>
            </Grid>
          </Grid>
        </>
      )
    },
      {
           field: 'paymentDate',
           headerName: 'Date',
           render: (row: any) => {
             const formattedDateTime = moment(row.paymentDate).format('DD MMM YYYY, hh:mm A');
             return <span>{formattedDateTime}</span>;
           }
         },
    {
      field: 'amount',
      headerName: 'Amount',
      render: (row: any) => `${row?.amountCurrencyText} ${row?.amount}`
    },
    {
      field: 'action',
      headerName: 'Action',
      render: (row: any) => (
        <VisibilityIcon style={{ cursor: 'pointer' }} onClick={() => handleActionClick(row)} />
      )
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

      <CustomModal open={open} onClose={handleClose} title="Invoice Payment Details" sx={{ backgroundColor: theme.palette.background.default }}>
        <div className="header-divider" />
        <Box display="flex" justifyContent="space-between" mb={2}>
          <Typography><strong>Date:</strong></Typography>
          <Typography>
            {viewDetails?.paymentDate
              ? viewDetails.paymentDate.slice(0, 10)
              : viewDetails?.date?.slice(0, 10) ||
              selectedRow?.paymentDate?.slice(0, 10) ||
              selectedRow?.date?.slice(0, 10)}
          </Typography>
        </Box>

        <Box display="flex" justifyContent="space-between" mb={2}>
          <Typography><strong>Invoice ID:</strong></Typography>
          <Typography>{viewDetails?.invoice || selectedRow?.invoice}</Typography>
        </Box>

        <Box display="flex" justifyContent="space-between" mb={2}>
          <Typography><strong>Payment Mode:</strong></Typography>
          <Typography>{viewDetails?.paymentMode || selectedRow?.paymentMode}</Typography>
        </Box>

        <Box display="flex" justifyContent="space-between" mb={2}>
          <Typography><strong>Amount:</strong></Typography>
          <Typography>
            {(viewDetails?.amount !== undefined && viewDetails?.amount !== null)
              ? `${viewDetails?.amountCurrencyText ?? ''} ${viewDetails?.amount}`
              : `${selectedRow?.amountCurrencyText ?? ''} ${selectedRow?.amount}`}
          </Typography>
        </Box>

        <Box display="flex" justifyContent="space-between" mb={2}>
          <Typography><strong>Note:</strong></Typography>
          <Typography>{viewDetails?.notes || selectedRow?.notes}</Typography>
        </Box>

        <Button
          className="custom-button"
          onClick={handleClose}
          sx={{ mt: 3 }}
        >
          <span className="button-text">Close</span>
        </Button>
      </CustomModal>
    </Box>
  );
};

export default FirstSection;

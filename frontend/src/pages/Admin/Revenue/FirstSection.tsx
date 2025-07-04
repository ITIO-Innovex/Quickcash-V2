import { useEffect, useState } from 'react';
import CustomModal from '@/components/CustomModal';
import VisibilityIcon from '@mui/icons-material/Visibility';
import GenericTable from '../../../components/common/genericTable';
import { Box, Button, Typography, useTheme, TextField } from '@mui/material';
import CustomButton from '@/components/CustomButton';
import admin from '@/helpers/adminApiHelper';
import getSymbolFromCurrency from 'currency-symbol-map';
const url = import.meta.env.VITE_NODE_ENV == "production" ? 'api' : 'api';

const FirstSection = () => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any | null>(null);
  const [list, setList] = useState<any>();
  const [totalRevenueAmount, setTotalRevenueAmount] = useState<any>();
  const [currentData, setCurrentData] = useState<any[]>([]);

  const getListData = async () => {
    await admin.get(`/${url}/v1/admin/revenue/list`)
      .then(result => {
        if (result.data.status == 201) {
          setList(result.data.data);
          setTotalRevenueAmount(result?.data?.total);
          setCurrentData(result.data.data);
        }
      })
      .catch(error => {
        console.log("error", error);
      })
  }
  useEffect(() => {
    getListData();
  }, [])

  const handleActionClick = (row: any) => {
    setSelectedRow(row);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedRow(null);
  };

  const columns = [
    {
      field: 'createdAt',
      headerName: 'Date',
      render: (row: any) => row.createdAt ? row.createdAt.slice(0, 10) : '',
    },
    {
      field: 'userDetails?.name',
      headerName: 'Username',
      render: (row: any) => row.userDetails?.[0]?.name || 'N/A',
    },
    {
      field: 'userDetails?.email',
      headerName: 'Email',
      render: (row: any) => row.userDetails?.[0]?.email || 'N/A',
    },
    {
      field: 'amount',
      headerName: 'Amount',
      render: (row: any) =>
        row?.amount
          ? `${getSymbolFromCurrency(row?.fromCurrency)}${parseFloat(row?.amount).toFixed(2)}`
          : 'N/A',
    },

    { field: 'info', headerName: 'Details' },
    { field: 'trans_type', headerName: 'Type' },

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
          style={{ cursor: 'pointer' }}
          onClick={() => handleActionClick(row)}
        />
      ),
    },
  ];

  return (
    <Box>
      <Typography variant='h5' style={{ fontWeight: '700' }}>{"Total Revenue: "}
        ${parseFloat(totalRevenueAmount).toFixed(2)}
      </Typography>
      {currentData ? (
        <GenericTable columns={columns} data={currentData} />
      ) : (
        <Typography variant="body1" sx={{ mt: 2 }}>
          No data found.
        </Typography>
      )}

      <CustomModal
        open={open}
        onClose={handleClose}
        title="Statement Details"
        sx={{ backgroundColor: theme.palette.background.default }}
      >
        <div className="header-divider" />

        <Box sx={{ mt: 2 }}>
          <Box display="flex" justifyContent="space-between" mb={2}>
            <Typography>
              <strong>Date:</strong>
            </Typography>
            <Typography>{selectedRow?.createdAt.slice(0, 10)}</Typography>
          </Box>

          <Box display="flex" justifyContent="space-between" mb={2}>
            <Typography>
              <strong>UserName:</strong>
            </Typography>
            <Typography>{selectedRow?.userDetails?.[0]?.name}</Typography>
          </Box>

          <Box display="flex" justifyContent="space-between" mb={2}>
            <Typography>
              <strong>Email:</strong>
            </Typography>
            <Typography>{selectedRow?.userDetails?.[0]?.email}</Typography>
          </Box>

          <Box display="flex" justifyContent="space-between" mb={2}>
            <Typography>
              <strong>Amount:</strong>
            </Typography>
            <Typography>${selectedRow?.amount.toFixed(2)}</Typography>
          </Box>

          <Box display="flex" justifyContent="space-between" mb={2}>
            <Typography>
              <strong>Detail:</strong>
            </Typography>
            <Typography>{selectedRow?.info}</Typography>
          </Box>

          <Box display="flex" justifyContent="space-between" mb={2}>
            <Typography>
              <strong>Type:</strong>
            </Typography>
            <Typography>{selectedRow?.trans_type}</Typography>
          </Box>

          <Box display="flex" justifyContent="space-between" mb={2}>
            <Typography>
              <strong>Status:</strong>
            </Typography>
            <Typography>{selectedRow?.status}</Typography>
          </Box>

          <Box display="flex" justifyContent="flex-end" gap={2} >
            <CustomButton onClick={handleClose}>Close</CustomButton>
          </Box>
        </Box>
      </CustomModal>
    </Box>
  );
};

export default FirstSection;

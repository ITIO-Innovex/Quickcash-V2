import { useState } from 'react';
import CustomModal from '@/components/CustomModal';
import VisibilityIcon from '@mui/icons-material/Visibility';
import GenericTable from '../../../components/common/genericTable';
import { Box, Button, Typography, useTheme, TextField } from '@mui/material';
import CustomButton from '@/components/CustomButton';

// Add type declaration for jsPDF autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => void;
  }
}

const FirstSection = () => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any | null>(null);

  const userData = [
    {
      date: '2025-05-01',
      username: 'alpha',
      email: 'a@example.com',
      mobile: '1234567890',
      country: 'India',
      currency: 'INR',
      status: true,
      suspend: false,
    },
    {
      date: '2025-05-02',
      username: 'bravo',
      email: 'b@example.com',
      mobile: '9876543210',
      country: 'USA',
      currency: 'USD',
      status: false,
      suspend: false,
    },
    {
      date: '2025-05-03',
      username: 'charlie',
      email: 'c@example.com',
      mobile: '5556667777',
      country: 'UK',
      currency: 'GBP',
      status: false,
      suspend: false,
    },
  ];

  const [currentData, setCurrentData] = useState(userData);

  const handleActionClick = (row: any) => {
    setSelectedRow(row);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedRow(null);
  };

  const handleStatusToggle = (row: any) => {
    const confirm = window.confirm(
      'Are you sure you want to make this user active?'
    );
    if (!confirm) return;

    const updatedData = currentData.map((item) => ({
      ...item,
      status: item.email === row.email,
    }));

    setCurrentData(updatedData);
  };

  const handleSuspendToggle = (row: any) => {
    if (row.status) {
      alert('You can only suspend inactive users.');
      return;
    }

    const updatedData = currentData.map((item) =>
      item.email === row.email ? { ...item, suspend: !item.suspend } : item
    );

    setCurrentData(updatedData);
  };

  const columns = [
    { field: 'date', headerName: 'Date' },
    { field: 'username', headerName: 'Username' },
    { field: 'email', headerName: 'Email' },
    { field: 'mobile', headerName: 'Mobile' },
    { field: 'country', headerName: 'Country' },
    { field: 'currency', headerName: 'Currency' },
    {
      field: 'status',
      headerName: 'Status',
      render: (row: any) => (
        <label className="switch">
          <input
            type="checkbox"
            checked={row.status}
            onChange={() => handleStatusToggle(row)}
          />
          <span className="slider"></span>
        </label>
      ),
    },
    {
      field: 'suspend',
      headerName: 'Suspend',
      render: (row: any) => (
        <label className="switch">
          <input
            type="checkbox"
            checked={row.suspend}
            onChange={() => handleSuspendToggle(row)}
          />
          <span className="slider"></span>
        </label>
      ),
    },
    {
      field: 'action',
      headerName: 'Action',
      render: (row: any) => (
        <VisibilityIcon
          className="action-icon"
          onClick={() => handleActionClick(row)}
        />
      ),
    },
  ];

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 2,
        mb: 3,
        flexWrap: 'wrap',
        alignItems: 'center',
      }}
    >
      <GenericTable columns={columns} data={currentData} />

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
            <Typography>{selectedRow?.date}</Typography>
          </Box>

          <Box display="flex" justifyContent="space-between" mb={2}>
            <Typography>
              <strong>UserName:</strong>
            </Typography>
            <Typography>{selectedRow?.username}</Typography>
          </Box>

          <Box display="flex" justifyContent="space-between" mb={2}>
            <Typography>
              <strong>Email:</strong>
            </Typography>
            <Typography>{selectedRow?.email}</Typography>
          </Box>

          <Box display="flex" justifyContent="space-between" mb={2}>
            <Typography>
              <strong>Mobile:</strong>
            </Typography>
            <Typography>{selectedRow?.mobile}</Typography>
          </Box>

          <Box display="flex" justifyContent="space-between" mb={2}>
            <Typography>
              <strong>Country:</strong>
            </Typography>
            <Typography>{selectedRow?.country}</Typography>
          </Box>

          <Box display="flex" justifyContent="space-between" mb={2}>
            <Typography>
              <strong>Status:</strong>
            </Typography>
            <Typography>
              {selectedRow?.status ? '✅ Active' : '❌ Inactive'}
            </Typography>
          </Box>

          <Box display="flex" justifyContent="space-between" mb={2}>
            <Typography>
              <strong>Suspend:</strong>
            </Typography>
            <Typography>
              {selectedRow?.suspend ? '⛔ Suspended' : '✅ Not Suspended'}
            </Typography>
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

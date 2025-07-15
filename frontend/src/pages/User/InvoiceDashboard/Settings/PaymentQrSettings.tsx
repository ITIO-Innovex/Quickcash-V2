import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import CustomButton from '@/components/CustomButton';
import GenericTable from '@/components/common/genericTable';

const PaymentQrSettings = () => {
  const navigate = useNavigate();

  const dummyData = [
    {
      date: '2025-07-11',
      title: 'UPI Payment',
      image: 'upi_qr.png',
      default: 'Yes',
      action: 'Edit/Delete',
    },
  ];

  const columns = [
    { field: 'date', headerName: 'Date' },
    { field: 'title', headerName: 'Title' },
    { field: 'image', headerName: 'Image' },
    { field: 'default', headerName: 'Default' },
    { field: 'action', headerName: 'Action' },
  ];

  const handleAddQr = () => {
    navigate('/settings/add-qr-code');
  };

  return (
    <Box className="tax-settings-container">
       <Box className="tax-settings-header">
          <Typography variant="h6">Payment QR Code List</Typography>
          <CustomButton onClick={handleAddQr} >Add Qr code</CustomButton>
        </Box>

      <GenericTable columns={columns} data={dummyData} />
    </Box>
  );
};

export default PaymentQrSettings;


import React, { useState } from 'react';
import { Box, Button, Typography, useTheme } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CustomModal from '@/components/CustomModal';
import AddManualPayment from '@/components/forms/AddManualPayment';

const Header = () => {
  const theme = useTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpen = () => {
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
  };

  const handleSave = (data: {
  invoiceNo: string;
  dueAmount: string;
  paidAmount: string;
  paymentDate: string;
  amount: string;
  paymentMode: string;
  notes: string;
}) => {
  console.log("Saved Data:", data);

};


  return (
    <>
      <Box className="header-container">
        <Box className="header-top">
          <Typography 
            variant="h5" 
            component="h1" 
            className="stat-heading"
            sx={{ color: theme.palette.text.primary }}
          >
            Manual Invoice Payment
          </Typography>
          <Button className="custom-button" onClick={handleOpen}>
            <AddIcon className="icon-size" />
            <span className="button-text">Add New</span>
          </Button>
        </Box>

        <div className="header-divider" />
      </Box>

      <CustomModal
        open={isModalOpen}
        onClose={handleClose}
        title="Add manual payemnt"
        maxWidth="md"
      >
        <AddManualPayment onSave={handleSave} onCancel={handleClose} />
      </CustomModal>
    </>
  );
};

export default Header;

import FirstSection from './FirstSection';
import { Box, useTheme } from '@mui/material';
import PageHeader from '@/components/common/pageHeader';
import { useState } from 'react';
import CustomModal from '@/components/CustomModal';
import AddManualPayment from '@/components/forms/AddManualPayment';

const Main = () => {
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
    console.log('Saved Data:', data);
  };

  return (
    <Box
      className="clients-container dashboard-container"
      sx={{ backgroundColor: theme.palette.background.default }}
    >
      <PageHeader title={'Invoice-manual payment'} buttonText='payment' onButtonClick={handleOpen} />
      <FirstSection />

      <CustomModal
        open={isModalOpen}
        onClose={handleClose}
        title="Add manual payemnt"
        maxWidth="md"
      >
        <AddManualPayment onSave={handleSave} onCancel={handleClose} />
      </CustomModal>
    </Box>
  );
};

export default Main;

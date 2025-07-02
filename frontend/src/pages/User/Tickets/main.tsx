import { useState } from 'react';
import FirstSection from './FirstSection';
import { Box, useTheme } from '@mui/material';
import CreateTicketForm from './CreateTicketForm';
import PageHeader from '@/components/common/pageHeader';
import CustomModal from '../../../components/CustomModal';

const Main = () => {
  const theme = useTheme();

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <Box
      className="dashboard-container"
      sx={{ backgroundColor: theme.palette.background.default }}
    >
      <PageHeader
        title="Help Center"
        buttonText="Ticket"
        onButtonClick={handleOpen}
      />

      <FirstSection />
      
      <CustomModal
        open={open}
        onClose={handleClose}
        title="Ticket"
        sx={{ backgroundColor: theme.palette.background.default }}
      >
        <CreateTicketForm onClose={handleClose} />
      </CustomModal>
    </Box>
  );
};

export default Main;

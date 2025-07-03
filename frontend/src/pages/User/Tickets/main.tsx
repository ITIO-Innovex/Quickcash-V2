import { useState, useRef } from 'react';
import FirstSection from './FirstSection';
import { Box, useTheme } from '@mui/material';
import CreateTicketForm from './CreateTicketForm';
import PageHeader from '@/components/common/pageHeader';
import CustomModal from '../../../components/CustomModal';

const Main = () => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [refreshSignal, setRefreshSignal] = useState(0);
  const firstSectionRef = useRef<any>(null);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  // Called after ticket creation
  const handleTicketCreated = () => {
    setRefreshSignal((prev) => prev + 1);
    if (firstSectionRef.current && firstSectionRef.current.refresh) {
      firstSectionRef.current.refresh();
    }
  };

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
      <FirstSection ref={firstSectionRef} refreshSignal={refreshSignal} />
      <CustomModal
        open={open}
        onClose={handleClose}
        title="Ticket"
        sx={{ backgroundColor: theme.palette.background.default }}
      >
        <CreateTicketForm onClose={handleClose} onTicketCreated={handleTicketCreated} />
      </CustomModal>
    </Box>
  );
};

export default Main;

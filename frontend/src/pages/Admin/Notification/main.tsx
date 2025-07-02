import { useRef, useState } from 'react';
import FirstSection from './FirstSection';
import CustomModal from '@/components/CustomModal';
import PageHeader from '@/components/common/pageHeader';
import { Box, Typography, useTheme } from '@mui/material';
import CreateNotificationForm from '@/components/forms/CreateNotificationForm';


const main = () => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const firstSectionRef = useRef<any>(null);
  
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
   const handleRefresh = () => {
    if (firstSectionRef.current?.refreshData) {
      firstSectionRef.current.refreshData();
    }
  };
  return (
      <Box  className="dashboard-container"
        sx={{ backgroundColor: theme.palette.background.default }}>
          <PageHeader title='Notifications' buttonText='Notification' onButtonClick={handleOpen} />

          <CustomModal open={open} onClose={handleClose} title="Add Notification" sx={{backgroundColor: theme.palette.background.default }}>
                  <CreateNotificationForm onClose={handleClose} onAdded={handleRefresh}/>
                </CustomModal>
          <FirstSection ref={firstSectionRef}/>
      </Box>
    )
  }

export default main

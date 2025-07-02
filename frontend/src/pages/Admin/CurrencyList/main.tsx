import { useRef, useState } from 'react';
import FirstSection from './FirstSection';
import { Box, useTheme } from '@mui/material';
import CustomModal from '@/components/CustomModal';
import PageHeader from '@/components/common/pageHeader';
import CreateCurrencyForm from '@/components/forms/CreateCurrencyForm';

const Main = () => {
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
    <Box
      className="dashboard-container" sx={{ backgroundColor: theme.palette.background.default }} >

      <PageHeader title="Currency-list" buttonText="currency" onButtonClick={handleOpen} />

      <FirstSection ref={firstSectionRef} />
      <CustomModal open={open} onClose={handleClose} title="Add Sub-Admin" sx={{backgroundColor: theme.palette.background.default }}>
         <CreateCurrencyForm onClose={handleClose} onAdded={handleRefresh}/>
         </CustomModal>
    </Box>
  );
};

export default Main;

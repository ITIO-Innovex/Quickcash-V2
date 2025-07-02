import { useState } from 'react';
import FirstSection from './FirstSection';
import { Box, useTheme } from '@mui/material';
import PageHeader from '@/components/common/pageHeader';
import CustomModal from '../../../components/CustomModal'; 
import CreateAdminForm from '../../../components/forms/CreateAdminForm';

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
       <PageHeader title="Sub Admin" buttonText='Subadmin' onButtonClick={handleOpen} />

      <CustomModal open={open} onClose={handleClose} title="Add Sub-Admin" sx={{backgroundColor: theme.palette.background.default }}>
        <CreateAdminForm onClose={handleClose} />
      </CustomModal>

      <FirstSection/>
      </Box>
  );
};

export default Main;

import { useState, useRef } from 'react';
import FirstSection from './FirstSection';
import { Box, useTheme } from '@mui/material';
import PageHeader from '@/components/common/pageHeader';
import CustomModal from '../../../components/CustomModal'; 
import CreateAdminForm from '../../../components/forms/CreateAdminForm';

const Main = () => {
    const theme = useTheme();
    const [open, setOpen] = useState(false);
    const firstSectionRef = useRef<any>(null);

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    // Callback for CreateAdminForm: refresh table and close modal
    const handleAdminAdded = () => {
      if (firstSectionRef.current && typeof firstSectionRef.current.getListData === 'function') {
        firstSectionRef.current.getListData();
      }
      handleClose();
    };

    return (
      <Box 
        className="dashboard-container" 
        sx={{ backgroundColor: theme.palette.background.default }}
      >
         <PageHeader title="Sub Admin" buttonText='Subadmin' onButtonClick={handleOpen} />

        <CustomModal open={open} onClose={handleClose} title="Add Sub-Admin" sx={{backgroundColor: theme.palette.background.default }}>
          <CreateAdminForm onClose={handleClose} onAdminAdded={handleAdminAdded} />
        </CustomModal>

        <FirstSection ref={firstSectionRef}/>
        </Box>
    );
};

export default Main;

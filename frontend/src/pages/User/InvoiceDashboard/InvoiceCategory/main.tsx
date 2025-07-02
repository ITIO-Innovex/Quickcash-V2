
import { useState } from 'react';
import FirstSection from './FirstSection';
import { Box, useTheme } from '@mui/material';
import PageHeader from '@/components/common/pageHeader';
import CustomModal from '@/components/CustomModal';
import AddCategoryForm from '@/components/forms/AddCategoryForm';

const Main = () => {  
  const theme = useTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpen = () => {
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
  };

  const handleSave = (data: { name: string }) => {
    console.log('Saving category:', data);
    // Here you would typically save the data to your backend
    setIsModalOpen(false);
  }; 

  return (
    <Box 
      className="clients-container dashboard-container" sx={{ backgroundColor: theme.palette.background.default }}
    >
      <PageHeader title='Category' buttonText='Category' onButtonClick={handleOpen}/>
      <FirstSection />

      <CustomModal open={isModalOpen} onClose={handleClose} title="Add Category Form" maxWidth="sm" sx={{backgroundColor:theme.palette.background.default}} >
        <AddCategoryForm onSave={handleSave} onCancel={handleClose}  />
      </CustomModal>
    </Box>
  );
};

export default Main;

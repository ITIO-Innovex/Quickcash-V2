
import { useState } from 'react';
import FirstSection from './FirstSection';
import { Box, useTheme } from '@mui/material';
import CustomModal from '@/components/CustomModal';
import PageHeader from '@/components/common/pageHeader';
import AddProductForm from '@/components/forms/AddProductForm';

const Main = () => {
  const theme = useTheme();
   const [isModalOpen, setIsModalOpen] = useState(false);
  
    const handleAddProduct = (data: { name: string; productCode: string; category: string; unitPrice: string; description: string; }) => {
      console.log('Add Product:', data);
      setIsModalOpen(false);
    };

  return (
    <Box 
      className="clients-container dashboard-container" 
      sx={{ backgroundColor: theme.palette.background.default }}
    >
      <PageHeader title='Invoice-products'  buttonText='product' onButtonClick={() => setIsModalOpen(true)}/>
      <FirstSection />

      <CustomModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Product"
        sx={{backgroundColor:theme.palette.background.default}}
      >
        <AddProductForm onSubmit={handleAddProduct} />
      </CustomModal>
    </Box>
  );
};

export default Main;

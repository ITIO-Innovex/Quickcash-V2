import { useState } from 'react';
import FirstSection from './FirstSection';
import { Box, useTheme } from '@mui/material';
import CustomModal from '@/components/CustomModal';
import PageHeader from '@/components/common/pageHeader';
import AddProductForm from '@/components/forms/AddProductForm';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useAppToast } from '@/utils/toast'; 
const url = import.meta.env.VITE_NODE_ENV == "production" ? 'api' : 'api';

const Main = () => {
  const theme = useTheme();
  const toast = useAppToast(); 
   const [isModalOpen, setIsModalOpen] = useState(false);
  const [refresh, setRefresh] = useState(false);
  
    const handleAddProduct = async (data: { name: string; productCode: string; category: string; unitPrice: string; description: string; }) => {
      try {
        const token = localStorage.getItem('token');
        const accountId = jwtDecode<{ data: { id: string } }>(token as string);
        const response = await axios.post(`/${url}/v1/product/add`, {
          name: data.name,
          user: accountId?.data?.id,
          productCode: data.productCode,
          category: data.category,
          unitPrice: data.unitPrice,
          description: data.description
        }, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.data.status === 201) {
          setIsModalOpen(false);
          toast.success(response?.data?.message);
            setRefresh(!refresh);
        }
      } catch (error: any) {
        toast.error(error?.response?.data?.message || "Error adding product");
        console.log("error", error);
      }
    };

  return (
    <Box 
      className="clients-container dashboard-container" 
      sx={{ backgroundColor: theme.palette.background.default }}
    >
      <PageHeader title='Invoice-products'  buttonText='product' onButtonClick={() => setIsModalOpen(true)}/>
        <FirstSection refresh={refresh} />

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

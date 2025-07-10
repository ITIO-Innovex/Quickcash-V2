import { useState } from 'react';
import FirstSection from './FirstSection';
import { Box, useTheme } from '@mui/material';
import PageHeader from '@/components/common/pageHeader';
import CustomModal from '@/components/CustomModal';
import AddCategoryForm from '@/components/forms/AddCategoryForm';
import { jwtDecode } from 'jwt-decode';
import { JwtPayload } from '@/types/jwt';
import { useAppToast } from '@/utils/toast'; 
import api from '@/helpers/apiHelper';

const Main = () => {  
  const theme = useTheme();
  const toast = useAppToast(); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refresh, setRefresh] = useState(false);

  const handleOpen = () => {
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
  };

  const handleSave = async (data: { name: string }) => {
    const url = import.meta.env.VITE_NODE_ENV == "production" ? 'api' : 'api';
    try {
      const accountId = jwtDecode<JwtPayload>(localStorage.getItem('token') as string);
      const result = await api.post(`/${url}/v1/category/add`, {
        name: data.name,
        user: accountId?.data?.id
      });
      if (result.data.status == 201) {
        setIsModalOpen(false);
        toast.success(result?.data?.message);
        setRefresh(!refresh);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Error adding category');
      console.log('error', error);
    }
  }; 

  return (
    <Box 
      className="clients-container dashboard-container" sx={{ backgroundColor: theme.palette.background.default }}
    >
      <PageHeader title='Category' buttonText='Category' onButtonClick={handleOpen}/>
      <FirstSection refresh={refresh} />
      <CustomModal open={isModalOpen} onClose={handleClose} title="Add Category Form" maxWidth="sm" sx={{backgroundColor:theme.palette.background.default}} >
        <AddCategoryForm onSave={handleSave} onCancel={handleClose}  />
      </CustomModal>
    </Box>
  );
};

export default Main;

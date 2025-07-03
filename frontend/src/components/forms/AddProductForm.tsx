import React, { useState, useEffect } from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import CustomButton from '../CustomButton';
import CustomInputField from '../CustomInputField';
import CustomDropdown from '../CustomDropdown';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import SyncIcon from '@mui/icons-material/Sync';
import { useAuth } from '@/contexts/authContext';
import api from '@/helpers/apiHelper';
const url = import.meta.env.VITE_NODE_ENV == "production" ? 'api' : 'api';

interface AddProductFormProps {
  onSubmit: (data: { 
    name: string; 
    productCode: string; 
    category: string; 
    unitPrice: string; 
    description: string; 
  }) => void;
}

const AddProductForm: React.FC<AddProductFormProps> = ({ onSubmit }) => {
  const theme = useTheme();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    productCode: '',
    category: '',
    unitPrice: '',
    description: ''
  });
  const [categories, setCategories] = useState<{ label: string; value: string }[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      if (!user?.id) return;
      try {
        const res = await api.get(`/${url}/v1/category/list/${user.id}`);
        const data = res.data?.data || [];
        setCategories(data.map((cat: any) => ({ label: cat.name, value: cat._id })));
      } catch (err) {
        setCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleGenerateProductCode = () => {
    setFormData({
      ...formData,
      productCode: Math.random().toString(36).slice(2, 10).toUpperCase()
    });
  };

  const isFormValid = formData.name && formData.productCode && formData.category && formData.unitPrice;

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Box sx={{ mb: 2 }}>
        <CustomInputField
        label="Product Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter product name"
          fullWidth
        />
      </Box>

      <Box sx={{ mb: 2 }}>
        <CustomInputField
        label="Product Code"
          value={formData.productCode}
          onChange={(e) => setFormData({ ...formData, productCode: e.target.value })}
          placeholder="Enter product code"
          fullWidth
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="generate product code"
                  edge="end"
                  sx={{ color: theme.palette.mode === 'dark' ? 'white' : 'black' }}
                  onClick={handleGenerateProductCode}
                >
                  <SyncIcon />
                </IconButton>
              </InputAdornment>
            )
          }}
        />
      </Box>

      <Box sx={{ mb: 2 }}>
        <CustomDropdown
          label="Category"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value as string })}
          options={categories}
          fullWidth
          disabled={loadingCategories}
        />
      </Box>

      <Box sx={{ mb: 2 }}>
        <CustomInputField
        label="Unit Price"
          type="number"
          value={formData.unitPrice}
          onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
          placeholder="Enter unit price"
          fullWidth
        />
      </Box>

      <Box sx={{ mb: 3 }}>
        <CustomInputField
        label="Description"
          multiline
          rows={3}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Enter product description"
          fullWidth
        />
      </Box>

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <CustomButton
          type="submit"
          disabled={!isFormValid}
          sx={{
            backgroundColor: '#483594',
            '&:hover': {
              backgroundColor: '#3d2a7a'
            }
          }}
        >
          Add Product
        </CustomButton>
        <CustomButton>Discard</CustomButton>
      </Box>
    </Box>
  );
};

export default AddProductForm;

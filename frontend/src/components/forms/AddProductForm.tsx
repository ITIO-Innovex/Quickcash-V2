
import React, { useState } from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import CustomButton from '../CustomButton';
import CustomInputField from '../CustomInputField';
import CustomDropdown from '../CustomDropdown';

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
  const [formData, setFormData] = useState({
    name: '',
    productCode: '',
    category: '',
    unitPrice: '',
    description: ''
  });

  const categoryOptions = [
    { label: 'Electronics', value: 'electronics' },
    { label: 'Software', value: 'software' },
    { label: 'Services', value: 'services' },
    { label: 'Hardware', value: 'hardware' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
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
        />
      </Box>

      <Box sx={{ mb: 2 }}>
        <CustomDropdown
          label="Category"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value as string })}
          options={categoryOptions}
          fullWidth
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

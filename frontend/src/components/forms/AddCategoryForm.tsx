
import React, { useState } from 'react';
import CustomButton from '../CustomButton';
import { SxProps, Theme } from '@mui/material/styles';
import { Box, TextField, Typography, useTheme } from '@mui/material';
import CustomTextField from '../CustomTextField';

interface AddCategoryFormProps {
  onSave: (data: { name: string }) => void;
  onCancel: () => void;
   sx?: SxProps<Theme>; 
}

const AddCategoryForm: React.FC<AddCategoryFormProps> = ({ onSave, onCancel , sx}) => {
  const theme = useTheme();
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave({ name: name.trim() });
      setName('');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{backgroundColor:theme.palette.background.default}}>
      <Box sx={{ mb: 3 }}>
        <CustomTextField
        label='Name'
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter category name"
          required
          variant="outlined"
        />
      </Box>

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <CustomButton
          variant="contained"
          onClick={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent)}
          disabled={!name.trim()}
        >
          SAVE
        </CustomButton>
        <CustomButton
          onClick={onCancel}
        >
          CANCEL
        </CustomButton>
      </Box>
    </Box>
  );
};

export default AddCategoryForm;

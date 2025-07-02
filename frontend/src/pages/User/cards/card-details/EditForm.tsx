import React, { useState } from 'react';
import CustomButton from '@/components/CustomButton';
import { SxProps, Theme } from '@mui/material/styles';
import { Box, MenuItem, useTheme } from '@mui/material';
import CustomTextField from '@/components/CustomTextField';

const statuses = ['ACTIVE', 'INACTIVE'];

interface EditCardFormProps {
  card: {
    name: string;
    cardNumber: string;
    cvv: string;
    expiryDate: string;
    status: string;
  };
  onClose: () => void;
  sx?: SxProps<Theme>;
  onSave: (updatedCard: any) => void;
}

const EditCardForm: React.FC<EditCardFormProps> = ({
  card,
  onClose,
  onSave,
  sx,
}) => {
  const theme = useTheme();
  const [formData, setFormData] = useState({ ...card });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    onSave(formData);
  };

  return (
    <Box p={2} sx={sx} display="flex" flexDirection="column" gap={2}>
      <CustomTextField
        label="Card Name"
        value={formData.name}
        InputProps={{
          readOnly: true,
        }}
        onChange={(e) => handleChange('name', e.target.value)}
      />
      <CustomTextField
        label="Card Number"
        value={formData.cardNumber}
        onChange={(e) => handleChange('cardNumber', e.target.value)}
        InputProps={{
          readOnly:true,
        }}
      />
      <CustomTextField
        label="CVV"
        value={formData.cvv}
        onChange={(e) => handleChange('cvv', e.target.value)}
        InputProps={{
          readOnly:true
        }}
      />
      <CustomTextField
        label="Expiry Date"
        value={formData.expiryDate}
        onChange={(e) => handleChange('expiryDate', e.target.value)}
        InputProps={{
          readOnly:true
        }}
      />
      <CustomTextField
        select
        label="Card Status"
        value={formData.status}
        onChange={(e) => handleChange('status', e.target.value)}
        InputProps={{
          readOnly:true
        }}
      >
        {statuses.map((status) => (
          <MenuItem key={status} value={status}>
            {status}
          </MenuItem>
        ))}
      </CustomTextField>
      <Box display="flex" justifyContent="flex-end" gap={1}>
        <CustomButton onClick={onClose}>Close</CustomButton>
        <CustomButton variant="contained" onClick={handleSubmit}>
          Save
        </CustomButton>
      </Box>
    </Box>
  );
};

export default EditCardForm;

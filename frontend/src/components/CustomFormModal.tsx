import React, { useEffect, useState } from 'react';
import CustomModal from './CustomModal';
import { Box, Button, useTheme } from '@mui/material';
import CustomInput from './CustomTextField';
import CustomButton from './CustomButton';

interface FieldConfig {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
}

interface CustomFormModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  onSubmit: (formData: Record<string, string>) => void;
  fields: FieldConfig[];
  initialValues?: Record<string, string> | null; // allow null
}

const CustomFormModal: React.FC<CustomFormModalProps> = ({
  open,
  title,
  onClose,
  onSubmit,
  fields,
  initialValues = {},
}) => {
  const theme = useTheme();
  const [formData, setFormData] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialValues) {
      setFormData(initialValues);
    }
  }, [initialValues]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  return (
    <CustomModal open={open} onClose={onClose} title={title} sx={{backgroundColor:theme.palette.background.default}}>
      <Box display="flex" flexDirection="column" gap={2}>
        {fields.map((field) => (
          <CustomInput
            key={field.name}
            name={field.name}
            label={field.label}
            type={field.type || 'text'}
            required={field.required}
            value={formData[field.name] || ''}
            onChange={handleChange}
            fullWidth
          />
        ))}

        <Box display="flex" justifyContent="flex-end" mt={2}>
          <CustomButton variant="contained" sx={{mt:2}} onClick={handleSubmit}>
            Save Changes
          </CustomButton>
        </Box>
      </Box>
    </CustomModal>
  );
};

export default CustomFormModal;

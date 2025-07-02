import React, { useState } from 'react';
import CustomButton from '../CustomButton';
import { Box, useTheme } from '@mui/material';
import CommonDateInput from '../CustomDateInput';
import CustomInput from '@/components/CustomInputField';

interface Props {
  onClose: () => void;
}

const CreateAdminForm: React.FC<Props> = ({ onClose }) => {
  const theme = useTheme();
  const [FirstName, setFirstName] = useState('');
  const [LastName, setLastName] = useState('');
  const [Mobile, setMobile] = useState('');
  const [Email, setEmail] = useState('');
  const [Date, setDate] = useState('');

  const handleSubmit = () => {
    console.log({ FirstName, LastName, Email, Mobile, Date });
    onClose();
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <CustomInput
        label="FirstName"
        fullWidth
        value={FirstName}
        onChange={(e) => setFirstName(e.target.value)}
      ></CustomInput>

      <CustomInput
        label="LastName"
        fullWidth
        value={LastName}
        onChange={(e) => setLastName(e.target.value)}
      ></CustomInput>

      <CustomInput
        label="Email"
        fullWidth
        value={Email}
        onChange={(e) => setEmail(e.target.value)}
      ></CustomInput>

      <CustomInput
        label="Mobile"
        fullWidth
        value={Mobile}
        onChange={(e) => setMobile(e.target.value)}
      ></CustomInput>

      <CommonDateInput
        label="Auto Reset-Password Date"
        value={Date}
        onChange={(e) => setDate(e.target.value)}
      />

      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
        <CustomButton onClick={handleSubmit}>Ok</CustomButton>
        <CustomButton onClick={onClose}>Close</CustomButton>
      </Box>
    </Box>
  );
};

export default CreateAdminForm;

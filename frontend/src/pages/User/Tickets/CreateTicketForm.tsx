import React, { useState } from 'react';
import { Box, Button, MenuItem, TextField, useTheme } from '@mui/material';
import CustomInput from '@/components/CustomInputField';
import CustomTextField from '@/components/CustomTextField';
import CustomButton from '@/components/CustomButton';

interface Props {
  onClose: () => void;
}

const CreateTicketForm: React.FC<Props> = ({ onClose }) => {
  const theme = useTheme();
  const [subject, setSubject] = useState('Help');
  const [message, setMessage] = useState('');

  const handleSubmit = () => {

    console.log({ subject, message });
    onClose(); 
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <CustomInput
        label="Subject"
        select
        fullWidth
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
      >
        <MenuItem value="Help">Help</MenuItem>
        <MenuItem value="Billing">Billing</MenuItem>
        <MenuItem value="Technical">Technical</MenuItem>
      </CustomInput>

      <CustomTextField
        label="Message"
        fullWidth
        multiline
        minRows={4}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
        <CustomButton
          variant="contained"
          // sx={{ backgroundColor: '#483594', color: '#fff', px: 4 }}
          onClick={handleSubmit}
        >
          Post
        </CustomButton>
        <CustomButton variant="contained" onClick={onClose}>
          Close
        </CustomButton>
      </Box>
    </Box>
  );
};

export default CreateTicketForm;

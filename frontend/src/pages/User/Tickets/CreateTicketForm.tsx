import React, { useState } from 'react';
import { Box, MenuItem, useTheme, Alert } from '@mui/material';
import CustomInput from '@/components/CustomInputField';
import CustomTextField from '@/components/CustomTextField';
import CustomButton from '@/components/CustomButton';
import api from '@/helpers/apiHelper';
import { jwtDecode } from 'jwt-decode';
import { JwtPayload } from '@/types/jwt';

interface Props {
  onClose: () => void;
  onTicketCreated: () => void;
}

const CreateTicketForm: React.FC<Props> = ({ onClose, onTicketCreated }) => {
  const theme = useTheme();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const url = import.meta.env.VITE_NODE_ENV == "production" ? 'api' : 'api';

  const handleSubmit = async () => {
    setError('');
    if (!subject || !message) {
      setError('Subject and message are required.');
      return;
    }
    setLoading(true);
    try {
      const accountId = jwtDecode<JwtPayload>(localStorage.getItem('token') as string);
      const res = await api.post(`/${url}/v1/support/add`, {
        user: accountId?.data?.id,
        subject,
        message,
        status: 'Pending',
      });
      if (res.data.status === '201' || res.data.status === 201) {
        setSubject('Help');
        setMessage('');
        onClose();
        onTicketCreated();
      } else {
        setError(res.data.message || 'Failed to create ticket.');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to create ticket.');
    }
    setLoading(false);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {error && <Alert severity="error">{error}</Alert>}
      <CustomInput
        label="Subject"
        fullWidth
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
      />
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
          loading={loading}
          onClick={handleSubmit}
        >
          Post
        </CustomButton>
        <CustomButton variant="contained" onClick={onClose} disabled={loading}>
          Close
        </CustomButton>
      </Box>
    </Box>
  );
};

export default CreateTicketForm;

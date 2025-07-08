import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, Box, CircularProgress, Button } from '@mui/material';

interface StatusModalProps {
  open: boolean;
  status: 'pending' | 'success' | 'error';
  onClose: () => void;
}

const statusConfig = {
  pending: {
    title: 'Transfer Pending',
    message: 'Your transfer is being processed. Please wait...',
    icon: <CircularProgress color="primary" />,
    color: 'primary.main',
  },
  success: {
    title: 'Transfer Successful',
    message: 'Your transfer was completed successfully!',
    icon: '✅',
    color: 'success.main',
  },
  error: {
    title: 'Transfer Failed',
    message: 'There was an error processing your transfer.',
    icon: '❌',
    color: 'error.main',
  },
};

const StatusModal: React.FC<StatusModalProps> = ({ open, status, onClose }) => {
  const config = statusConfig[status];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ textAlign: 'center', color: config.color }}>
        {config.title}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2 }}>
          <Box sx={{ mb: 2, fontSize: 40 }}>{config.icon}</Box>
          <Typography variant="body1" sx={{ mb: 2, textAlign: 'center' }}>
            {config.message}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center' }}>
        {status !== 'pending' && (
          <Button onClick={onClose} variant="contained" color="primary">
            Close
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default StatusModal; 
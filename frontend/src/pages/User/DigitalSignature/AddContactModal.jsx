import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, IconButton, TextField, Box, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const AddContactModal = ({ open, onClose, onSubmit, onReset, form, setForm }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 600, fontSize: 20, pb: 1 }}>
        Add contact
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: 1 }}>
        <Box mb={2}>
          <Typography fontWeight={500} mb={0.5}>
            Name <span style={{ color: 'red' }}>*</span>
          </Typography>
          <TextField
            fullWidth
            size="small"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: '#e0e0e0',
                },
                '&:hover fieldset': {
                  borderColor: '#483594',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#483594',
                },
              },
            }}
          />
        </Box>
        <Box mb={2}>
          <Typography fontWeight={500} mb={0.5}>
            Email <span style={{ color: 'red' }}>*</span>
          </Typography>
          <TextField
            fullWidth
            size="small"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: '#e0e0e0',
                },
                '&:hover fieldset': {
                  borderColor: '#483594',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#483594',
                },
              },
            }}
          />
        </Box>
        <Box mb={2}>
          <Typography fontWeight={500} mb={0.5}>
            Phone
          </Typography>
          <TextField
            fullWidth
            size="small"
            value={form.phone}
            onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
            placeholder="optional"
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: '#e0e0e0',
                },
                '&:hover fieldset': {
                  borderColor: '#483594',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#483594',
                },
              },
            }}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, pt: 0 }}>
        <button
          type="button"
          onClick={onSubmit}
          className="op-btn op-btn-primary"
        >
          Submit
        </button>
        <button
          type="button"
          onClick={onReset}
          className="op-btn op-btn-secondary"
        >
          Reset
        </button>
      </DialogActions>
    </Dialog>
  );
};

export default AddContactModal; 
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
  Paper,
  Stack,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';

const CreateTemplateModal = ({ open, onClose }) => {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '12px',
          padding: '16px',
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pb: 2
      }}>
        <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', color: '#483594' }}>
          Create New Template
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          {/* File Upload Section */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
              Upload Template File
            </Typography>
            {!selectedFile ? (
              <Paper
                sx={{
                  px: 4,
                  py: 3,
                  border: '2px dashed #483594',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: 'rgba(72, 53, 148, 0.04)',
                  },
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2,
                }}
                component="label"
              >
                <input
                  type="file"
                  hidden
                  onChange={handleFileSelect}
                  accept=".pdf,.doc,.docx"
                />
                <Stack sx={{
                  alignItems: 'flex-start',
                  width: 'fit-content',
                  gap: 2,
                }}>
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3,
                  }}>
                    <CloudUploadIcon sx={{ fontSize: 60, color: '#483594' }} />
                    <Box sx={{ textAlign: 'left' }}>
                      <Typography variant="h6" sx={{ color: '#483594', fontWeight: 'bold' }}>
                        Drag and drop your file here
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        or click to browse files
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                      Supported formats: PDF, DOC, DOCX
                  </Typography>
                </Stack>
              </Paper>
            ) : (
              <Paper
                sx={{
                  p: 2,
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="body1">{selectedFile.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </Typography>
                </Box>
                <IconButton onClick={handleRemoveFile} size="small">
                  <DeleteIcon />
                </IconButton>
              </Paper>
            )}
          </Box>

          <TextField
            fullWidth
            label="Template Name"
            variant="outlined"
            required
            sx={{ mb: 3 }}
          />
          
          <TextField
            fullWidth
            label="Description"
            variant="outlined"
            multiline
            rows={4}
            sx={{ mb: 3 }}
          />

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'medium' }}>
              Template Type
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                sx={{
                  flex: 1,
                  borderColor: '#483594',
                  color: '#483594',
                  '&:hover': {
                    borderColor: '#3a2a75',
                    backgroundColor: 'rgba(72, 53, 148, 0.04)',
                  },
                }}
              >
                Invoice
              </Button>
              <Button
                variant="outlined"
                sx={{
                  flex: 1,
                  borderColor: '#483594',
                  color: '#483594',
                  '&:hover': {
                    borderColor: '#3a2a75',
                    backgroundColor: 'rgba(72, 53, 148, 0.04)',
                  },
                }}
              >
                Contract
              </Button>
              <Button
                variant="outlined"
                sx={{
                  flex: 1,
                  borderColor: '#483594',
                  color: '#483594',
                  '&:hover': {
                    borderColor: '#3a2a75',
                    backgroundColor: 'rgba(72, 53, 148, 0.04)',
                  },
                }}
              >
                Other
              </Button>
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button 
          onClick={onClose}
          sx={{ 
            color: 'text.secondary',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
            },
          }}
        >
          Cancel
        </Button>
        <Button 
          variant="contained"
          onClick={handleSubmit}
          sx={{
            backgroundColor: '#483594',
            color: 'white',
            '&:hover': {
              backgroundColor: '#3a2a75',
            },
          }}
        >
          Create Template
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateTemplateModal; 
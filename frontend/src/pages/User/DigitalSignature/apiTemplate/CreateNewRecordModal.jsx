import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Modal,
  TextField,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const CreateNewRecordModal = ({ open, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    pdfFile: null
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      setFormData(prev => ({
        ...prev,
        pdfFile: file
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        pdfFile: null
      });
      setErrors({});
      
      onClose();
    }
  };

  const handleClose = () => {
    // Reset form and errors when closing
    setFormData({
      title: '',
      description: '',
      pdfFile: null
    });
    setErrors({});
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Paper
        sx={{
          width: '100%',
          maxWidth: 600,
          maxHeight: '90vh',
          overflow: 'auto',
          borderRadius: 1,
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          position: 'relative',
        }}
      >
        {/* Close Button */}
        <IconButton 
          onClick={handleClose}
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            bgcolor: '#f5f5f5',
            '&:hover': { bgcolor: '#e0e0e0' }
          }}
        >
          <CloseIcon />
        </IconButton>

        {/* Header */}
        <Box sx={{ p: 4, pb: 2 }}>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 700,
              color: '#4285f4',
              mb: 1
            }}
          >
            Create New Record
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              color: '#666',
              fontSize: '16px'
            }}
          >
            Fill in the details below to create a new document record
          </Typography>
        </Box>

        {/* Form Content */}
        <Box sx={{ px: 4, pb: 4 }}>
          {/* Title Field */}
          <Box sx={{ mb: 3 }}>
            <Typography 
              variant="body2" 
              sx={{ 
                fontWeight: 600,
                color: '#333',
                mb: 1
              }}
            >
              Title <span style={{ color: '#f44336' }}>*</span>
            </Typography>
            <TextField
              fullWidth
              variant="outlined"
              value={formData.title}
              onChange={handleInputChange('title')}
              placeholder="Enter record title"
              error={!!errors.title}
              helperText={errors.title}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1,
                  backgroundColor: '#fafafa',
                  '& fieldset': {
                    borderColor: '#e0e0e0',
                  },
                  '&:hover fieldset': {
                    borderColor: '#bdbdbd',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#4285f4',
                  },
                },
                '& .MuiInputBase-input': {
                  py: 1.5,
                }
              }}
            />
          </Box>

          {/* Description Field */}
          <Box sx={{ mb: 3 }}>
            <Typography 
              variant="body2" 
              sx={{ 
                fontWeight: 600,
                color: '#333',
                mb: 1
              }}
            >
              Description <span style={{ color: '#f44336' }}>*</span>
            </Typography>
            <TextField
              fullWidth
              variant="outlined"
              multiline
              rows={4}
              value={formData.description}
              onChange={handleInputChange('description')}
              placeholder="Enter record description"
              error={!!errors.description}
              helperText={errors.description}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1,
                  backgroundColor: '#fafafa',
                  '& fieldset': {
                    borderColor: '#e0e0e0',
                  },
                  '&:hover fieldset': {
                    borderColor: '#bdbdbd',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#4285f4',
                  },
                },
                '& .MuiInputBase-input': {
                  py: 1.5,
                }
              }}
            />
          </Box>

          {/* PDF Upload Field */}
          <Box sx={{ mb: 4 }}>
            <Typography 
              variant="body2" 
              sx={{ 
                fontWeight: 600,
                color: '#333',
                mb: 1
              }}
            >
              PDF Upload (Optional)
            </Typography>
            
            <Box
              component="label"
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 120,
                border: '2px dashed #e0e0e0',
                borderRadius: 1,
                backgroundColor: '#fafafa',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: '#4285f4',
                  backgroundColor: '#f8f9ff',
                },
              }}
            >
              <input
                type="file"
                accept=".pdf"
                hidden
                onChange={handleFileUpload}
              />
              
              <CloudUploadIcon 
                sx={{ 
                  fontSize: 48,
                  color: '#bdbdbd',
                  mb: 1
                }} 
              />
              
              <Typography 
                variant="body1" 
                sx={{ 
                  fontWeight: 500,
                  color: '#666',
                  mb: 0.5
                }}
              >
                Drop your PDF here, or click to browse
              </Typography>
              
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#999',
                  fontSize: '14px'
                }}
              >
                PDF files only, up to 10MB
              </Typography>
              
              {formData.pdfFile && (
                <Typography 
                  variant="body2" 
                  sx={{ 
                    mt: 1,
                    color: '#4285f4',
                    fontWeight: 500
                  }}
                >
                  Selected: {formData.pdfFile.name}
                </Typography>
              )}
            </Box>
          </Box>

          {/* Submit Button */}
          <Button
            fullWidth
            variant="contained"
            onClick={handleSubmit}
            sx={{
              py: 1.5,
              fontSize: '16px',
              fontWeight: 600,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #4285f4 0%, #8a2be2 100%)',
              boxShadow: '0 4px 12px rgba(66, 133, 244, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #3367d6 0%, #7b1fa2 100%)',
                boxShadow: '0 6px 16px rgba(66, 133, 244, 0.4)',
              },
              '&:active': {
                transform: 'translateY(1px)',
              }
            }}
          >
            Create Record
          </Button>
        </Box>
      </Paper>
    </Modal>
  );
};

export default CreateNewRecordModal;
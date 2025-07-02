import React, { useState } from 'react';
import { Box, Typography, Paper, Button, Grid } from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import SettingsIcon from '@mui/icons-material/Settings';
import CodeIcon from '@mui/icons-material/Code';
import AddIcon from '@mui/icons-material/Add';

// Import the separate modal component
import CreateNewRecordModal from './CreateNewRecordModal';

const cardData = [
  {
    title: 'Total Records',
    value: 0,
    icon: <DescriptionIcon sx={{ fontSize: 40, color: '#1976d2' }} />,
    bg: '#f5f8ff',
  },
  {
    title: 'Active Documents',
    value: 0,
    icon: <InsertDriveFileIcon sx={{ fontSize: 40, color: '#43a047' }} />,
    bg: '#f6fcf7',
  },
  {
    title: 'Generated Templates',
    value: 0,
    icon: <SettingsIcon sx={{ fontSize: 40, color: '#8e24aa' }} />,
    bg: '#faf5ff',
  },
];

const ApiTemplateDashboard = () => {
  const [modalOpen, setModalOpen] = useState(false);

  const handleOpenModal = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleFormSubmit = (formData) => {
    // Handle the form submission here
    console.log('New Template Data:', formData);
    
    // Add your API call here
    // Example:
    // try {
    //   const response = await createTemplate(formData);
    //   console.log('Template created successfully:', response);
    //   // Update your state or refetch data
    // } catch (error) {
    //   console.error('Error creating template:', error);
    // }
  };

  return (
    <Box sx={{ p: 3, minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <CodeIcon sx={{ fontSize: 40, color: '#1976d2', mr: 1, bgcolor: '#e3eafd', borderRadius: 2, p: 1 }} />
          <Box>
            <Typography variant="h5" fontWeight={700} color="#2a2a2a">
              API Template System
            </Typography>
            <Typography variant="subtitle2" color="text.secondary">
              Document Management & Code Generation Platform
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" startIcon={<CodeIcon />} sx={{ bgcolor: '#fff' }}>
            API Docs
          </Button>
          <Button variant="contained" startIcon={<InsertDriveFileIcon />} sx={{ bgcolor: '#111827', color: '#fff', '&:hover': { bgcolor: '#222' } }}>
            Records
          </Button>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={handleOpenModal}
            sx={{
              background: 'linear-gradient(90deg, #7b2ff2 0%, #f357a8 100%)',
              color: '#fff',
              boxShadow: 2,
              fontWeight: 600,
              '&:hover': { 
                background: 'linear-gradient(90deg, #6a1fd1 0%, #e0478f 100%)',
              }
            }}
          >
            Create New
          </Button>
        </Box>
      </Box>

      {/* Top Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {cardData.map((card) => (
          <Grid item xs={12} md={4} key={card.title}>
            <Paper elevation={0} sx={{
             p: 3,
             borderRadius: 1,
             background: card.bg,
             display: 'flex',
             alignItems: 'center',
             justifyContent: 'space-between',
             minHeight: 120,
             boxShadow: '0 2px 8px 0 rgba(60,72,100,0.06)',
             border: '1px solid rgba(0, 0, 0, 0.12)',
            }}>
              <Box>
                <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 1 }}>
                  {card.title}
                </Typography>
                <Typography variant="h4" fontWeight={700} color="#222">
                  {card.value}
                </Typography>
              </Box>
              <Box>
                {card.icon}
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Empty State or Table */}
      <Box sx={{ textAlign: 'center', mt: 8 }}>
        <InsertDriveFileIcon sx={{ fontSize: 60, color: '#e0e0e0', mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          No API templates found. Start by creating a new template.
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenModal}
          sx={{
            mt: 3,
            background: 'linear-gradient(90deg, #7b2ff2 0%, #f357a8 100%)',
            color: '#fff',
            fontWeight: 600,
            px: 4,
            py: 1.5,
            borderRadius: 1,
            boxShadow: 2,
            '&:hover': { 
              background: 'linear-gradient(90deg, #6a1fd1 0%, #e0478f 100%)',
            }
          }}
        >
          Create New Template
        </Button>
      </Box>

      {/* Modal Component */}
      <CreateNewRecordModal 
        open={modalOpen} 
        onClose={handleCloseModal}
        onSubmit={handleFormSubmit}
      />
    </Box>
  );
};

export default ApiTemplateDashboard;
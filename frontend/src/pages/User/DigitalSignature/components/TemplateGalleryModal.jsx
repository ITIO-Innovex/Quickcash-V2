import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  DialogActions,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const TemplateGalleryModal = ({ open, onClose }) => {
  const [selectedTemplates, setSelectedTemplates] = useState({});

  const handleCheckboxChange = (templateId) => (event) => {
    setSelectedTemplates((prevSelected) => ({
      ...prevSelected,
      [templateId]: event.target.checked,
    }));
  };

  const handleAddItem = () => {
    const selected = Object.keys(selectedTemplates).filter(
      (id) => selectedTemplates[id]
    );
    console.log('Selected templates for adding:', selected);
    // Implement logic to add selected templates
    onClose();
  };

  // Placeholder data for templates, similar to what's in TemplatePage.jsx
  const templates = [
    {
      id: 1,
      title: 'Professional Invoice Template',
      image: 'https://designshack.net/wp-content/uploads/Colorful-Invoice-Template-Word-1.webp',
    },
    {
      id: 2,
      title: 'Simple Contract Agreement',
      image: 'https://designshack.net/wp-content/uploads/Colorful-Invoice-Template-Word-1.webp',
    },
    {
      id: 3,
      title: 'Service Agreement Template',
      image: 'https://i.etsystatic.com/12952881/r/il/63fe5c/4611283294/il_340x270.4611283294_48nc.jpg',
    },
    {
      id: 4,
      title: 'Basic Invoice Layout',
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTZ7Oe-9Utm8V9gWtZWW9nsY0DN-ESeVT3r-HMQ22lI4auRC5KPd1TeRgipGFETDdFmQ80&usqp=CAU',
    },
    {
      id: 5,
      title: 'NDA Template',
      image: 'https://elements-resized.envatousercontent.com/elements-cover-images/5562f250-e732-43a6-aaa6-a79d56f5110b?w=433&cf_fit=scale-down&q=85&format=auto&s=186c6721905c3259be7fd7814eb3ea6261de1bf1b98522c22afb46c7ff3e7ee8',
    },
    {
      id: 6,
      title: 'Rental Agreement',
      image: 'https://assets.website-files.com/62c938c538a7c20c027419e4/62c938c538a7c234a9741b63_agreement-template.png',
    },
    {
      id: 7,
      title: 'Consent Form',
      image: 'https://eforms.com/images/2020/07/Student-Consent-Form.png',
    },
    {
      id: 8,
      title: 'Contract for Services',
      image: 'https://templates.legal/wp-content/uploads/2021/07/legal-contract-template-1.webp',
    },
  ];

  const hasSelectedTemplates = Object.values(selectedTemplates).some(Boolean);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '12px',
          padding: '16px',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 2,
        }}
      >
        <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', color: '#483594' }}>
          Templates Gallery
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Grid container spacing={3}>
          {templates.map((item) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}> {/* Adjusted for better spacing in modal */}
              <Card sx={{
                borderRadius: '12px',
                overflow: 'hidden',
                position: 'relative',
                border: selectedTemplates[item.id] ? '2px solid #483594' : '1px solid transparent', // Add conditional border
                transition: 'border 0.2s ease-in-out', // Smooth transition
              }}>
                <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                  <Box sx={{
                    position: 'relative',
                    height: '180px',
                    backgroundImage: `url(${item.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    display: 'flex',
                    alignItems: 'flex-end',
                    p: 2,
                  }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={selectedTemplates[item.id] || false}
                          onChange={handleCheckboxChange(item.id)}
                          sx={{
                            color: 'white',
                            '& .MuiSvgIcon-root': {
                              borderRadius: '50%', // Apply circular border to the SVG icon
                              // border: '2px solid white', // Removed visible border
                            },
                          }} 
                        />
                      }
                      label=""
                      sx={{ position: 'absolute', top: 0, left: 0, color: 'white' }} // Position checkbox
                    />
                    <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 'bold', textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
                      {item.title}
                    </Typography>
                    <IconButton sx={{ position: 'absolute', top: 8, right: 8, color: 'white', backgroundColor: 'rgba(0,0,0,0.3)', '&:hover': { backgroundColor: 'rgba(0,0,0,0.5)' } }}>
                      <ArrowForwardIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          onClick={handleAddItem}
          disabled={!hasSelectedTemplates}
          sx={{
            backgroundColor: '#483594',
            color: 'white',
            '&:hover': {
              backgroundColor: '#3a2a75',
            },
          }}
        >
          Add Item
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TemplateGalleryModal; 
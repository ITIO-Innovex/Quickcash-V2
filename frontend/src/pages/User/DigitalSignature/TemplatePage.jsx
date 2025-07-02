import React, { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  Chip,
  Stack,
  CardActions,
  Dialog,
  CardMedia,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import DesignServicesIcon from '@mui/icons-material/DesignServices'; 
import CreateTemplateModal from './components/CreateTemplateModal';
import TemplateGalleryModal from './components/TemplateGalleryModal';
import NDATemplateForm from './components/NDATemplateForm';
import MOUTemplateForm from './components/MOUTemplateForm';
import EmployeeAgreementForm from './components/EmployeeAgreementForm';
import BackgroundVerificationForm from './components/BackgroundVerificationForm';
import DeclarationUndertakingForm from './components/DeclarationUndertakingForm';
import KYCFormTemplate from './components/KYCFormTemplate';

const TemplatePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  // const [activeTab, setActiveTab] = useState('Templates');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [openNDA, setOpenNDA] = useState(false);
  const [openMOU, setOpenMOU] = useState(false);
  const [openEmployeeAgreement, setOpenEmployeeAgreement] = useState(false);
  const [openBackgroundVerification, setOpenBackgroundVerification] = useState(false);
  const [openDeclarationUndertaking, setOpenDeclarationUndertaking] = useState(false);
  const [openKYCForm, setOpenKYCForm] = useState(false);

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  // const handleCreateTemplate = () => {
  //   setIsCreateModalOpen(true);
  // };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  // const handleOpenGalleryModal = () => {
  //   setIsGalleryModalOpen(true);
  // };

  const handleCloseGalleryModal = () => {
    setIsGalleryModalOpen(false);
  };

  // const handleTabChange = (tabName) => {
  //   setActiveTab(tabName);
  // };

  const templates = [
    {
      title: 'Non-Disclosure Agreement',
      description: 'Create a professional NDA to protect your confidential information.',
      onClick: () => setOpenNDA(true),
      image: 'https://img.freepik.com/free-vector/business-team-putting-together-jigsaw-puzzle-isolated-flat-vector-illustration-cartoon-partners-working-connection-teamwork-partnership-cooperation-concept_74855-9814.jpg',
      category: 'Legal',
    },
    {
      title: 'Memorandum of Understanding',
      description: 'Generate a comprehensive MOU for your business partnerships.',
      onClick: () => setOpenMOU(true),
      image: 'https://img.freepik.com/free-vector/handshake-concept-landing-page_52683-22715.jpg',
      category: 'Legal',
    },
    {
      title: 'Employee Agreement',
      description: 'Create a detailed employment agreement for new hires.',
      onClick: () => setOpenEmployeeAgreement(true),
      image: 'https://img.freepik.com/free-vector/business-team-putting-together-jigsaw-puzzle-isolated-flat-vector-illustration-cartoon-partners-working-connection-teamwork-partnership-cooperation-concept_74855-9814.jpg',
      category: 'HR',
    },
    {
      title: 'Background Verification',
      description: 'Generate a comprehensive background verification form for candidates.',
      onClick: () => setOpenBackgroundVerification(true),
      image: 'https://img.freepik.com/free-vector/business-team-putting-together-jigsaw-puzzle-isolated-flat-vector-illustration-cartoon-partners-working-connection-teamwork-partnership-cooperation-concept_74855-9814.jpg',
      category: 'HR',
    },
    {
      title: 'Declaration cum Undertaking',
      description: 'Create a formal declaration and undertaking document for employees.',
      onClick: () => setOpenDeclarationUndertaking(true),
      image: 'https://img.freepik.com/free-vector/business-team-putting-together-jigsaw-puzzle-isolated-flat-vector-illustration-cartoon-partners-working-connection-teamwork-partnership-cooperation-concept_74855-9814.jpg',
      category: 'HR',
    },
    {
      title: 'KYC Form (Interview)',
      description: 'Generate a comprehensive KYC form for customer verification.',
      onClick: () => setOpenKYCForm(true),
      image: 'https://img.freepik.com/free-vector/business-team-putting-together-jigsaw-puzzle-isolated-flat-vector-illustration-cartoon-partners-working-connection-teamwork-partnership-cooperation-concept_74855-9814.jpg',
      category: 'Compliance',
    },
  ];

  // Filter templates based on searchQuery (case-insensitive)
  const filteredTemplates = templates.filter(template =>
    template.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center', position: 'relative' }}>
      {/* Create New Template Button at Top Right */}
      {/* <Box sx={{ position: 'absolute', top: 32, right: 32 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateTemplate}
          sx={{
            borderRadius: '20px',
            textTransform: 'none',
            padding: '8px 16px',
            fontSize: '0.875rem',
            backgroundColor: '#483594',
            color: 'white',
            '&:hover': {
              backgroundColor: '#3a2a75',
            },
          }}
        >
          Create New Template
        </Button>
      </Box> */}

      {/* Create Template Modal */}
      <CreateTemplateModal 
        open={isCreateModalOpen} 
        onClose={handleCloseCreateModal} 
      />

      {/* Templates Gallery Modal */}
      <TemplateGalleryModal
        open={isGalleryModalOpen}
        onClose={handleCloseGalleryModal}
      />

      {/* NDA Template Form Modal */}
      <NDATemplateForm 
        open={openNDA} 
        onClose={() => setOpenNDA(false)} 
      />

      {/* MOU Template Form Modal */}
      <MOUTemplateForm 
        open={openMOU} 
        onClose={() => setOpenMOU(false)} 
      />

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: '#4A4A4A' }}>
          Save time with templates. 
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: '700px', mx: 'auto' }}>
          Think of a template as a master copy of a document — you can reuse it for multiple recipients, then customize any document type you create from it.
        </Typography>
        {/* <Stack direction="row" spacing={2} justifyContent="center" sx={{ mb: 4 }}>
          <Button
            variant={activeTab === 'Your designs' ? 'contained' : 'outlined'}
            onClick={() => handleTabChange('Your designs')}
            startIcon={<DesignServicesIcon />}
            sx={{
              borderRadius: '20px',
              textTransform: 'none',
              borderColor: activeTab === 'Your designs' ? '#483594' : 'grey.400',
              color: activeTab === 'Your designs' ? 'white' : 'text.primary',
              backgroundColor: activeTab === 'Your designs' ? '#483594' : 'transparent',
              '&:hover': {
                backgroundColor: activeTab === 'Your designs' ? '#3a2a75' : 'action.hover',
              },
            }}
          >
            My Templates 
          </Button>
          <Button
            variant={activeTab === 'Templates' ? 'contained' : 'outlined'}
            onClick={handleOpenGalleryModal}
            startIcon={<img src="https://img.icons8.com/ios-filled/24/000000/template.png" alt="templates icon" style={{ filter: activeTab === 'Templates' ? 'invert(1)' : 'none' }} />}
            sx={{
              borderRadius: '20px',
              textTransform: 'none',
              borderColor: activeTab === 'Templates' ? '#483594' : 'grey.400',
              color: activeTab === 'Templates' ? 'white' : 'text.primary',
              backgroundColor: activeTab === 'Templates' ? '#483594' : 'transparent',
              '&:hover': {
                backgroundColor: activeTab === 'Templates' ? '#3a2a75' : 'action.hover',
              },
            }}
          >
            Templates Gallary
          </Button>
        </Stack> */}

        <TextField
          placeholder="Search by templates name"
          variant="outlined"
          fullWidth
          value={searchQuery}
          onChange={handleSearch}
          sx={{
            maxWidth: '600px',
            mx: 'auto',
            borderRadius: '30px',
            '& .MuiOutlinedInput-root': {
              borderRadius: '10px',
              paddingLeft: '20px',
              paddingRight: '10px',
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <IconButton>
                  <SearchIcon />
                </IconButton>
              </InputAdornment>
            )
          }}
        />
      </Box>

      {/* Use Template Section */}
      <Box sx={{ textAlign: 'left', my: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
          Use Templates
        </Typography>
        <Grid container spacing={3}>
          {filteredTemplates.map((template, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 3,
                  },
                  maxWidth: '400px',
                  margin: '0 auto',
                }}
              >
                <Box sx={{ 
                  position: 'relative',
                  paddingTop: '60%', // Slightly taller than 16:9
                  backgroundColor: '#f5f5f5',
                }}>
                  <CardMedia
                    component="img"
                    image={template.image}
                    alt={template.title}
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      padding: '12px',
                    }}
                  />
                </Box>
                <CardContent sx={{ 
                  flexGrow: 1,
                  p: 2,
                  '&:last-child': { pb: 2 }
                }}>
                  <Typography 
                    variant="h6" 
                    gutterBottom
                    sx={{ 
                      fontWeight: 'bold',
                      color: '#1a237e',
                      fontSize: '1.1rem',
                    }}
                  >
                    {template.title}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ 
                      mb: 2,
                      fontSize: '0.9rem',
                      lineHeight: 1.4,
                    }}
                  >
                    {template.description}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      display: 'inline-block',
                      backgroundColor: '#e3f2fd',
                      color: '#1976d2',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontWeight: 'medium',
                      fontSize: '0.75rem',
                    }}
                  >
                    {template.category}
                    </Typography>
                </CardContent>
                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button 
                    variant="contained" 
                    color="primary"
                    onClick={template.onClick}
                    fullWidth
                    size="medium"
                  >
                    Create Template
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      <EmployeeAgreementForm 
        open={openEmployeeAgreement} 
        onClose={() => setOpenEmployeeAgreement(false)} 
      />

      <BackgroundVerificationForm 
        open={openBackgroundVerification} 
        onClose={() => setOpenBackgroundVerification(false)} 
      />

      <DeclarationUndertakingForm 
        open={openDeclarationUndertaking} 
        onClose={() => setOpenDeclarationUndertaking(false)} 
      />

      <KYCFormTemplate 
        open={openKYCForm} 
        onClose={() => setOpenKYCForm(false)} 
      />

    </Container>
  );
};

export default TemplatePage;

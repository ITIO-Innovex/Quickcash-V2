import React, { useState } from 'react';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  Typography,
  Paper,
  Divider,
  Alert,
  Snackbar,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import api from '@/helpers/apiHelper';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  height: '100%',
  overflow: 'auto',
  background: '#fff',
  border: '1px solid #e0e0e0',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  '& .mou-header': {
    textAlign: 'center',
    marginBottom: theme.spacing(4),
    '& h1': {
      fontSize: '2rem',
      fontWeight: 'bold',
      color: '#2e7d32',
      marginBottom: theme.spacing(2),
    },
  },
  '& .mou-section': {
    marginBottom: theme.spacing(3),
    '& h2': {
      fontSize: '1.2rem',
      color: '#2e7d32',
      marginBottom: theme.spacing(1),
    },
  },
  '& .mou-content': {
    fontFamily: 'Georgia, serif',
    fontSize: '1rem',
    lineHeight: 1.6,
    color: '#333',
  },
  '& .mou-signature': {
    marginTop: theme.spacing(4),
    '& .signature-line': {
      borderTop: '1px solid #000',
      width: '250px',
      marginBottom: theme.spacing(1),
    },
  },
}));

const MOUTemplateForm = ({ open, onClose }) => {
  const [mouDetails, setMouDetails] = useState({
    party1: '',
    party2: '',
    effectiveDate: '',
    purpose: '',
    objectives: '',
    responsibilities: '',
    term: '',
    termination: '',
  });
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMouDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  const generatePDF = async () => {
    setLoading(true);
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      let yPos = 20;
      const lineHeight = 7;
      const maxWidth = pageWidth - (2 * margin);

      // Helper function to add text with word wrap
      const addWrappedText = (text, y, fontSize = 12, fontStyle = 'normal') => {
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', fontStyle);
        const splitText = doc.splitTextToSize(text, maxWidth);
        doc.text(splitText, margin, y);
        return y + (splitText.length * lineHeight);
      };

      // Helper function to check if we need a new page
      const checkNewPage = (requiredSpace) => {
        if (yPos + requiredSpace > pageHeight - margin) {
          doc.addPage();
          yPos = margin;
          return true;
        }
        return false;
      };

      // Helper function to add section header
      const addSectionHeader = (text, y) => {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(46, 125, 50); // #2e7d32
        doc.text(text, margin, y);
        doc.setFontSize(12);
        doc.setTextColor(51, 51, 51); // #333
        return y + lineHeight;
      };

      // Title
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(46, 125, 50); // #2e7d32
      doc.text('MEMORANDUM OF UNDERSTANDING', pageWidth / 2, yPos, { align: 'center' });
      yPos += lineHeight * 2;

      // Reset text color for body
      doc.setTextColor(51, 51, 51); // #333

      // Parties
      yPos = addWrappedText(`This Memorandum of Understanding (the "MOU") is entered into on ${mouDetails.effectiveDate || '[Effective Date]'} between:`, yPos);
      yPos += lineHeight;

      yPos = addSectionHeader('PARTIES', yPos);
      doc.setFont('helvetica', 'normal');
      yPos = addWrappedText(`${mouDetails.party1 || '[Party 1]'} ("Party 1")`, yPos);
      yPos += lineHeight;
      doc.text('and', margin, yPos);
      yPos += lineHeight;
      yPos = addWrappedText(`${mouDetails.party2 || '[Party 2]'} ("Party 2")`, yPos);
      yPos += lineHeight * 2;

      // Purpose
      checkNewPage(lineHeight * 6);
      yPos = addSectionHeader('PURPOSE', yPos);
      doc.setFont('helvetica', 'normal');
      yPos = addWrappedText('The purpose of this MOU is to establish a framework for cooperation between the parties for:', yPos);
      yPos += lineHeight;
      yPos = addWrappedText(mouDetails.purpose || '[Purpose of the MOU]', yPos);
      yPos += lineHeight * 2;

      // Objectives
      checkNewPage(lineHeight * 8);
      yPos = addSectionHeader('OBJECTIVES', yPos);
      doc.setFont('helvetica', 'normal');
      yPos = addWrappedText('The objectives of this MOU are:', yPos);
      yPos += lineHeight;
      yPos = addWrappedText(mouDetails.objectives || '[Objectives of the MOU]', yPos);
      yPos += lineHeight * 2;

      // Responsibilities
      checkNewPage(lineHeight * 10);
      yPos = addSectionHeader('RESPONSIBILITIES', yPos);
      doc.setFont('helvetica', 'normal');
      yPos = addWrappedText('Each party shall be responsible for:', yPos);
      yPos += lineHeight;
      yPos = addWrappedText(mouDetails.responsibilities || '[Responsibilities of each party]', yPos);
      yPos += lineHeight * 2;

      // Term
      checkNewPage(lineHeight * 6);
      yPos = addSectionHeader('TERM', yPos);
      doc.setFont('helvetica', 'normal');
      yPos = addWrappedText(`This MOU shall remain in effect for ${mouDetails.term || '[Term Duration]'} from the Effective Date.`, yPos);
      yPos += lineHeight * 2;

      // Termination
      checkNewPage(lineHeight * 6);
      yPos = addSectionHeader('TERMINATION', yPos);
      doc.setFont('helvetica', 'normal');
      yPos = addWrappedText('This MOU may be terminated by either party with written notice. The termination conditions are:', yPos);
      yPos += lineHeight;
      yPos = addWrappedText(mouDetails.termination || '[Termination conditions]', yPos);
      yPos += lineHeight * 2;

      // Non-Binding
      checkNewPage(lineHeight * 4);
      yPos = addSectionHeader('NON-BINDING NATURE', yPos);
      doc.setFont('helvetica', 'normal');
      yPos = addWrappedText('This MOU is a statement of intent and is not legally binding. It does not create any legal obligations between the parties.', yPos);
      yPos += lineHeight * 2;

      // Governing Law
      checkNewPage(lineHeight * 4);
      yPos = addSectionHeader('GOVERNING LAW', yPos);
      doc.setFont('helvetica', 'normal');
      yPos = addWrappedText('This MOU shall be governed by and construed in accordance with the laws of [Jurisdiction].', yPos);
      yPos += lineHeight * 2;

      // Signatures
      checkNewPage(lineHeight * 8);
      yPos = addSectionHeader('IN WITNESS WHEREOF', yPos);
      doc.setFont('helvetica', 'normal');
      yPos = addWrappedText('The parties have executed this MOU as of the Effective Date.', yPos);
      yPos += lineHeight * 3;

      // Signature lines
      const signatureWidth = 80;
      const signatureSpacing = (pageWidth - 2 * margin - 2 * signatureWidth) / 3;

      // Party 1 signature
      doc.setDrawColor(0, 0, 0);
      doc.line(margin, yPos, margin + signatureWidth, yPos);
      doc.setFont('helvetica', 'bold');
      doc.text('Party 1', margin + signatureWidth / 2, yPos + lineHeight, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.text(mouDetails.party1 || '[Party 1 Name]', margin + signatureWidth / 2, yPos + lineHeight * 2, { align: 'center' });

      // Party 2 signature
      doc.line(margin + signatureWidth + signatureSpacing, yPos, margin + 2 * signatureWidth + signatureSpacing, yPos);
      doc.setFont('helvetica', 'bold');
      doc.text('Party 2', margin + signatureWidth + signatureSpacing + signatureWidth / 2, yPos + lineHeight, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.text(mouDetails.party2 || '[Party 2 Name]', margin + signatureWidth + signatureSpacing + signatureWidth / 2, yPos + lineHeight * 2, { align: 'center' });

      // Convert PDF to base64
      const pdfBase64 = doc.output('datauristring').split(',')[1];
      const fileName = `MOU_${mouDetails.party1 || 'Party1'}_${mouDetails.party2 || 'Party2'}_${new Date().toISOString().split('T')[0]}.pdf`;
      
      console.log('PDF generated, file size:', pdfBase64.length);
      console.log('File name:', fileName);
      
      // Upload file to get URL
      const uploadResponse = await api.post('/api/v1/digital-signature/files/save', {
        fileBase64: pdfBase64,
        fileName: fileName
      });

      console.log('Upload response:', uploadResponse.data);

      if (!uploadResponse.data.success) {
        console.error('Upload failed:', uploadResponse.data);
        throw new Error('Failed to upload PDF file');
      }

      const templateUrl = uploadResponse.data.url;
      const fileSize = uploadResponse.data.fileSize;

      console.log('File uploaded successfully. URL:', templateUrl);
      console.log('File size:', fileSize);

      // Store template data
      const templateData = {
        templateName: `MOU_${mouDetails.party1 || 'Party1'}_${mouDetails.party2 || 'Party2'}_${new Date().toISOString().split('T')[0]}`,
        templateUrl: templateUrl,
        fileSize: fileSize,
        mimeType: 'application/pdf'
      };

      console.log('Sending template data:', templateData);

      const templateResponse = await api.post('/api/v1/digital-signature/template/templates-store', templateData);

      console.log('Template response:', templateResponse.data);
      console.log('Template response status:', templateResponse.status);

      // Check for success - the backend returns status 201 for success
      if (templateResponse.status === 201 || templateResponse.data.status === 201) {
        showSnackbar('MOU template generated and stored successfully!', 'success');
        // Also save the PDF locally for user download
        // doc.save('MOU_Agreement.pdf');
        onClose();
        
        // Prepare template data for navigation
        const templateTitle = `MOU - ${mouDetails.party1 || 'Party 1'} & ${mouDetails.party2 || 'Party 2'}`;
        const templateNote = `Please review and sign this Memorandum of Understanding between ${mouDetails.party1 || 'Party 1'} and ${mouDetails.party2 || 'Party 2'}.`;
        
        // Navigate to request signature page with template data
        const searchParams = new URLSearchParams({
          templateUrl: templateUrl,
          documentTitle: templateTitle,
          documentNote: templateNote,
          fromTemplate: 'true'
        });
        
        navigate(`/digital-signature/request-signature?${searchParams.toString()}`);
      } else {
        console.error('Template response error:', templateResponse.data);
        throw new Error(`Failed to store template: ${templateResponse.data.error || 'Unknown error'}`);
      }

    } catch (error) {
      console.error('Error generating and storing PDF:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error message:', error.message);
      
      let errorMessage = 'Failed to generate and store MOU template';
      if (error.response?.data?.error) {
        errorMessage += `: ${error.response.data.error}`;
      } else if (error.message) {
        errorMessage += `: ${error.message}`;
      }
      
      showSnackbar(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
        <DialogTitle>MOU Template Generator</DialogTitle>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <Box sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Enter MOU Details
                </Typography>
                <TextField
                  fullWidth
                  label="Party 1"
                  name="party1"
                  value={mouDetails.party1}
                  onChange={handleInputChange}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Party 2"
                  name="party2"
                  value={mouDetails.party2}
                  onChange={handleInputChange}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Effective Date"
                  name="effectiveDate"
                  value={mouDetails.effectiveDate}
                  onChange={handleInputChange}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Purpose"
                  name="purpose"
                  value={mouDetails.purpose}
                  onChange={handleInputChange}
                  margin="normal"
                  multiline
                  rows={2}
                />
                <TextField
                  fullWidth
                  label="Objectives"
                  name="objectives"
                  value={mouDetails.objectives}
                  onChange={handleInputChange}
                  margin="normal"
                  multiline
                  rows={3}
                />
                <TextField
                  fullWidth
                  label="Responsibilities"
                  name="responsibilities"
                  value={mouDetails.responsibilities}
                  onChange={handleInputChange}
                  margin="normal"
                  multiline
                  rows={3}
                />
                <TextField
                  fullWidth
                  label="Term Duration"
                  name="term"
                  value={mouDetails.term}
                  onChange={handleInputChange}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Termination Conditions"
                  name="termination"
                  value={mouDetails.termination}
                  onChange={handleInputChange}
                  margin="normal"
                  multiline
                  rows={2}
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={9}>
              <StyledPaper>
                <Box className="mou-header">
                  <Typography variant="h1">MEMORANDUM OF UNDERSTANDING</Typography>
                </Box>
                <Box className="mou-content">
                  <Box className="mou-section">
                    <Typography>
                      This Memorandum of Understanding (the "MOU") is entered into on {mouDetails.effectiveDate || '[Effective Date]'} between:
                    </Typography>
                  </Box>

                  <Box className="mou-section">
                    <Typography variant="h2">PARTIES</Typography>
                    <Typography>
                      {mouDetails.party1 || '[Party 1]'} ("Party 1")
                      <br />
                      and
                      <br />
                      {mouDetails.party2 || '[Party 2]'} ("Party 2")
                    </Typography>
                  </Box>

                  <Box className="mou-section">
                    <Typography variant="h2">PURPOSE</Typography>
                    <Typography>
                      The purpose of this MOU is to establish a framework for cooperation between the parties for:
                      <br />
                      {mouDetails.purpose || '[Purpose of the MOU]'}
                    </Typography>
                  </Box>

                  <Box className="mou-section">
                    <Typography variant="h2">OBJECTIVES</Typography>
                    <Typography>
                      The objectives of this MOU are:
                      <br />
                      {mouDetails.objectives || '[Objectives of the MOU]'}
                    </Typography>
                  </Box>

                  <Box className="mou-section">
                    <Typography variant="h2">RESPONSIBILITIES</Typography>
                    <Typography>
                      Each party shall be responsible for:
                      <br />
                      {mouDetails.responsibilities || '[Responsibilities of each party]'}
                    </Typography>
                  </Box>

                  <Box className="mou-section">
                    <Typography variant="h2">TERM</Typography>
                    <Typography>
                      This MOU shall remain in effect for {mouDetails.term || '[Term Duration]'} from the Effective Date.
                    </Typography>
                  </Box>

                  <Box className="mou-section">
                    <Typography variant="h2">TERMINATION</Typography>
                    <Typography>
                      This MOU may be terminated by either party with written notice. The termination conditions are:
                      <br />
                      {mouDetails.termination || '[Termination conditions]'}
                    </Typography>
                  </Box>

                  <Box className="mou-section">
                    <Typography variant="h2">NON-BINDING NATURE</Typography>
                    <Typography>
                      This MOU is a statement of intent and is not legally binding. It does not create any legal obligations between the parties.
                    </Typography>
                  </Box>

                  <Box className="mou-section">
                    <Typography variant="h2">GOVERNING LAW</Typography>
                    <Typography>
                      This MOU shall be governed by and construed in accordance with the laws of [Jurisdiction].
                    </Typography>
                  </Box>

                  <Box className="mou-section">
                    <Typography variant="h2">IN WITNESS WHEREOF</Typography>
                    <Typography>
                      The parties have executed this MOU as of the Effective Date.
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                    <Box className="mou-signature">
                      <Box className="signature-line" />
                      <Typography>Party 1</Typography>
                      <Typography>{mouDetails.party1 || '[Party 1 Name]'}</Typography>
                    </Box>
                    <Box className="mou-signature">
                      <Box className="signature-line" />
                      <Typography>Party 2</Typography>
                      <Typography>{mouDetails.party2 || '[Party 2 Name]'}</Typography>
                    </Box>
                  </Box>
                </Box>
              </StyledPaper>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={generatePDF}
            disabled={loading}
            sx={{
              backgroundColor: '#2e7d32',
              '&:hover': {
                backgroundColor: '#1b5e20',
              },
            }}
          >
            {loading ? 'Generating...' : 'Generate MOU'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default MOUTemplateForm; 
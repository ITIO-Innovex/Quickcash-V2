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
  '& .du-header': {
    textAlign: 'center',
    marginBottom: theme.spacing(4),
    '& h1': {
      fontSize: '2rem',
      fontWeight: 'bold',
      color: '#6d4c41',
      marginBottom: theme.spacing(2),
    },
  },
  '& .du-section': {
    marginBottom: theme.spacing(3),
    '& h2': {
      fontSize: '1.2rem',
      color: '#6d4c41',
      marginBottom: theme.spacing(1),
    },
  },
  '& .du-content': {
    fontFamily: 'Georgia, serif',
    fontSize: '1rem',
    lineHeight: 1.6,
    color: '#333',
  },
  '& .du-signature': {
    marginTop: theme.spacing(4),
    '& .signature-line': {
      borderTop: '1px solid #000',
      width: '250px',
      marginBottom: theme.spacing(1),
    },
  },
}));

const DeclarationUndertakingForm = ({ open, onClose }) => {
  const [duDetails, setDuDetails] = useState({
    declarantName: '',
    declarantEmail: '',
    declarationDate: '',
    subject: '',
    declarationText: '',
    undertakingText: '',
    witnessName: '',
    witnessContact: '',
    remarks: '',
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
    setDuDetails((prev) => ({
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
        doc.setTextColor(109, 76, 65); // #6d4c41
        doc.text(text, margin, y);
        doc.setFontSize(12);
        doc.setTextColor(51, 51, 51); // #333
        return y + lineHeight;
      };

      // Title
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(109, 76, 65); // #6d4c41
      doc.text('DECLARATION & UNDERTAKING', pageWidth / 2, yPos, { align: 'center' });
      yPos += lineHeight * 2;

      // Reset text color for body
      doc.setTextColor(51, 51, 51); // #333

      // Declarant Info
      yPos = addSectionHeader('DECLARANT INFORMATION', yPos);
      doc.setFont('helvetica', 'normal');
      yPos = addWrappedText(`Name: ${duDetails.declarantName || '[Declarant Name]'}`, yPos);
      yPos = addWrappedText(`Email: ${duDetails.declarantEmail || '[Declarant Email]'}`, yPos);
      yPos = addWrappedText(`Date: ${duDetails.declarationDate || '[Declaration Date]'}`, yPos);
      yPos += lineHeight * 2;

      // Subject
      checkNewPage(lineHeight * 6);
      yPos = addSectionHeader('SUBJECT', yPos);
      doc.setFont('helvetica', 'normal');
      yPos = addWrappedText(duDetails.subject || '[Subject of the declaration/undertaking]', yPos);
      yPos += lineHeight * 2;

      // Declaration
      checkNewPage(lineHeight * 8);
      yPos = addSectionHeader('DECLARATION', yPos);
      doc.setFont('helvetica', 'normal');
      yPos = addWrappedText(duDetails.declarationText || '[Declaration statement]', yPos);
      yPos += lineHeight * 2;

      // Undertaking
      checkNewPage(lineHeight * 8);
      yPos = addSectionHeader('UNDERTAKING', yPos);
      doc.setFont('helvetica', 'normal');
      yPos = addWrappedText(duDetails.undertakingText || '[Undertaking statement]', yPos);
      yPos += lineHeight * 2;

      // Remarks
      checkNewPage(lineHeight * 6);
      yPos = addSectionHeader('REMARKS', yPos);
      doc.setFont('helvetica', 'normal');
      yPos = addWrappedText(duDetails.remarks || '[Remarks or additional comments]', yPos);
      yPos += lineHeight * 2;

      // Witness Info
      checkNewPage(lineHeight * 6);
      yPos = addSectionHeader('WITNESS INFORMATION', yPos);
      doc.setFont('helvetica', 'normal');
      yPos = addWrappedText(`Witness Name: ${duDetails.witnessName || '[Witness Name]'}`, yPos);
      yPos = addWrappedText(`Witness Contact: ${duDetails.witnessContact || '[Witness Contact]'}`, yPos);
      yPos += lineHeight * 2;

      // Signatures
      checkNewPage(lineHeight * 8);
      yPos = addSectionHeader('SIGNATURES', yPos);
      doc.setFont('helvetica', 'normal');
      yPos = addWrappedText('I hereby declare that the information provided above is true and correct to the best of my knowledge.', yPos);
      yPos += lineHeight * 3;

      // Signature lines
      const signatureWidth = 80;
      const signatureSpacing = (pageWidth - 2 * margin - 2 * signatureWidth) / 3;

      // Declarant signature
      doc.setDrawColor(0, 0, 0);
      doc.line(margin, yPos, margin + signatureWidth, yPos);
      doc.setFont('helvetica', 'bold');
      doc.text('Declarant', margin + signatureWidth / 2, yPos + lineHeight, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.text(duDetails.declarantName || '[Declarant Name]', margin + signatureWidth / 2, yPos + lineHeight * 2, { align: 'center' });

      // Witness signature
      doc.line(margin + signatureWidth + signatureSpacing, yPos, margin + 2 * signatureWidth + signatureSpacing, yPos);
      doc.setFont('helvetica', 'bold');
      doc.text('Witness', margin + signatureWidth + signatureSpacing + signatureWidth / 2, yPos + lineHeight, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.text(duDetails.witnessName || '[Witness Name]', margin + signatureWidth + signatureSpacing + signatureWidth / 2, yPos + lineHeight * 2, { align: 'center' });

      // Convert PDF to base64
      const pdfBase64 = doc.output('datauristring').split(',')[1];
      const fileName = `DeclarationUndertaking_${duDetails.declarantName || 'Declarant'}_${new Date().toISOString().split('T')[0]}.pdf`;
      
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
        templateName: `DeclarationUndertaking_${duDetails.declarantName || 'Declarant'}_${new Date().toISOString().split('T')[0]}`,
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
        showSnackbar('Declaration & Undertaking template generated and stored successfully!', 'success');
        // Also save the PDF locally for user download
        // doc.save('Declaration_Undertaking.pdf');
        onClose();
        
        // Prepare template data for navigation
        const templateTitle = `Declaration & Undertaking - ${duDetails.declarantName || 'Declarant'}`;
        const templateNote = `Please review and sign this Declaration & Undertaking by ${duDetails.declarantName || 'Declarant'}.`;
        
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
      
      let errorMessage = 'Failed to generate and store Declaration & Undertaking template';
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
        <DialogTitle>Declaration & Undertaking Generator</DialogTitle>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <Box sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Enter Declaration & Undertaking Details
                </Typography>
                <TextField
                  fullWidth
                  label="Declarant Name"
                  name="declarantName"
                  value={duDetails.declarantName}
                  onChange={handleInputChange}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Declarant Email"
                  name="declarantEmail"
                  value={duDetails.declarantEmail}
                  onChange={handleInputChange}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Declaration Date"
                  name="declarationDate"
                  value={duDetails.declarationDate}
                  onChange={handleInputChange}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Subject"
                  name="subject"
                  value={duDetails.subject}
                  onChange={handleInputChange}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Declaration Statement"
                  name="declarationText"
                  value={duDetails.declarationText}
                  onChange={handleInputChange}
                  margin="normal"
                  multiline
                  rows={3}
                />
                <TextField
                  fullWidth
                  label="Undertaking Statement"
                  name="undertakingText"
                  value={duDetails.undertakingText}
                  onChange={handleInputChange}
                  margin="normal"
                  multiline
                  rows={3}
                />
                <TextField
                  fullWidth
                  label="Remarks"
                  name="remarks"
                  value={duDetails.remarks}
                  onChange={handleInputChange}
                  margin="normal"
                  multiline
                  rows={2}
                />
                <TextField
                  fullWidth
                  label="Witness Name"
                  name="witnessName"
                  value={duDetails.witnessName}
                  onChange={handleInputChange}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Witness Contact"
                  name="witnessContact"
                  value={duDetails.witnessContact}
                  onChange={handleInputChange}
                  margin="normal"
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={9}>
              <StyledPaper>
                <Box className="du-header">
                  <Typography variant="h1">DECLARATION & UNDERTAKING</Typography>
                </Box>
                <Box className="du-content">
                  <Box className="du-section">
                    <Typography variant="h2">DECLARANT INFORMATION</Typography>
                    <Typography>
                      Name: {duDetails.declarantName || '[Declarant Name]'}<br />
                      Email: {duDetails.declarantEmail || '[Declarant Email]'}<br />
                      Date: {duDetails.declarationDate || '[Declaration Date]'}
                    </Typography>
                  </Box>
                  <Box className="du-section">
                    <Typography variant="h2">SUBJECT</Typography>
                    <Typography>
                      {duDetails.subject || '[Subject of the declaration/undertaking]'}
                    </Typography>
                  </Box>
                  <Box className="du-section">
                    <Typography variant="h2">DECLARATION</Typography>
                    <Typography>
                      {duDetails.declarationText || '[Declaration statement]'}
                    </Typography>
                  </Box>
                  <Box className="du-section">
                    <Typography variant="h2">UNDERTAKING</Typography>
                    <Typography>
                      {duDetails.undertakingText || '[Undertaking statement]'}
                    </Typography>
                  </Box>
                  <Box className="du-section">
                    <Typography variant="h2">REMARKS</Typography>
                    <Typography>
                      {duDetails.remarks || '[Remarks or additional comments]'}
                    </Typography>
                  </Box>
                  <Box className="du-section">
                    <Typography variant="h2">WITNESS INFORMATION</Typography>
                    <Typography>
                      Witness Name: {duDetails.witnessName || '[Witness Name]'}<br />
                      Witness Contact: {duDetails.witnessContact || '[Witness Contact]'}
                    </Typography>
                  </Box>
                  <Box className="du-section">
                    <Typography variant="h2">SIGNATURES</Typography>
                    <Typography>
                      I hereby declare that the information provided above is true and correct to the best of my knowledge.
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                    <Box className="du-signature">
                      <Box className="signature-line" />
                      <Typography>Declarant</Typography>
                      <Typography>{duDetails.declarantName || '[Declarant Name]'}</Typography>
                    </Box>
                    <Box className="du-signature">
                      <Box className="signature-line" />
                      <Typography>Witness</Typography>
                      <Typography>{duDetails.witnessName || '[Witness Name]'}</Typography>
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
              backgroundColor: '#6d4c41',
              '&:hover': {
                backgroundColor: '#3e2723',
              },
            }}
          >
            {loading ? 'Generating...' : 'Generate Declaration'}
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

export default DeclarationUndertakingForm; 
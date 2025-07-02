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
  '& .bv-header': {
    textAlign: 'center',
    marginBottom: theme.spacing(4),
    '& h1': {
      fontSize: '2rem',
      fontWeight: 'bold',
      color: '#ad1457',
      marginBottom: theme.spacing(2),
    },
  },
  '& .bv-section': {
    marginBottom: theme.spacing(3),
    '& h2': {
      fontSize: '1.2rem',
      color: '#ad1457',
      marginBottom: theme.spacing(1),
    },
  },
  '& .bv-content': {
    fontFamily: 'Georgia, serif',
    fontSize: '1rem',
    lineHeight: 1.6,
    color: '#333',
  },
  '& .bv-signature': {
    marginTop: theme.spacing(4),
    '& .signature-line': {
      borderTop: '1px solid #000',
      width: '250px',
      marginBottom: theme.spacing(1),
    },
  },
}));

const BackgroundVerificationForm = ({ open, onClose }) => {
  const [bvDetails, setBvDetails] = useState({
    candidateName: '',
    candidateEmail: '',
    employer: '',
    position: '',
    verificationDate: '',
    referenceName: '',
    referenceContact: '',
    verificationDetails: '',
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
    setBvDetails((prev) => ({
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
        doc.setTextColor(173, 20, 87); // #ad1457
        doc.text(text, margin, y);
        doc.setFontSize(12);
        doc.setTextColor(51, 51, 51); // #333
        return y + lineHeight;
      };

      // Title
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(173, 20, 87); // #ad1457
      doc.text('BACKGROUND VERIFICATION REPORT', pageWidth / 2, yPos, { align: 'center' });
      yPos += lineHeight * 2;

      // Reset text color for body
      doc.setTextColor(51, 51, 51); // #333

      // Candidate Info
      yPos = addSectionHeader('CANDIDATE INFORMATION', yPos);
      doc.setFont('helvetica', 'normal');
      yPos = addWrappedText(`Name: ${bvDetails.candidateName || '[Candidate Name]'}`, yPos);
      yPos = addWrappedText(`Email: ${bvDetails.candidateEmail || '[Candidate Email]'}`, yPos);
      yPos = addWrappedText(`Position Applied: ${bvDetails.position || '[Position]'}`, yPos);
      yPos = addWrappedText(`Employer: ${bvDetails.employer || '[Employer]'}`, yPos);
      yPos += lineHeight * 2;

      // Reference Info
      checkNewPage(lineHeight * 6);
      yPos = addSectionHeader('REFERENCE INFORMATION', yPos);
      doc.setFont('helvetica', 'normal');
      yPos = addWrappedText(`Reference Name: ${bvDetails.referenceName || '[Reference Name]'}`, yPos);
      yPos = addWrappedText(`Reference Contact: ${bvDetails.referenceContact || '[Reference Contact]'}`, yPos);
      yPos += lineHeight * 2;

      // Verification Details
      checkNewPage(lineHeight * 8);
      yPos = addSectionHeader('VERIFICATION DETAILS', yPos);
      doc.setFont('helvetica', 'normal');
      yPos = addWrappedText(bvDetails.verificationDetails || '[Details of the verification process and findings]', yPos);
      yPos += lineHeight * 2;

      // Remarks
      checkNewPage(lineHeight * 6);
      yPos = addSectionHeader('REMARKS', yPos);
      doc.setFont('helvetica', 'normal');
      yPos = addWrappedText(bvDetails.remarks || '[Remarks or additional comments]', yPos);
      yPos += lineHeight * 2;

      // Date
      checkNewPage(lineHeight * 4);
      yPos = addSectionHeader('VERIFICATION DATE', yPos);
      doc.setFont('helvetica', 'normal');
      yPos = addWrappedText(bvDetails.verificationDate || '[Verification Date]', yPos);
      yPos += lineHeight * 2;

      // Signatures
      checkNewPage(lineHeight * 8);
      yPos = addSectionHeader('SIGNATURES', yPos);
      doc.setFont('helvetica', 'normal');
      yPos = addWrappedText('The information provided above is true and correct to the best of my knowledge.', yPos);
      yPos += lineHeight * 3;

      // Signature lines
      const signatureWidth = 80;
      const signatureSpacing = (pageWidth - 2 * margin - 2 * signatureWidth) / 3;

      // Reference signature
      doc.setDrawColor(0, 0, 0);
      doc.line(margin, yPos, margin + signatureWidth, yPos);
      doc.setFont('helvetica', 'bold');
      doc.text('Reference', margin + signatureWidth / 2, yPos + lineHeight, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.text(bvDetails.referenceName || '[Reference Name]', margin + signatureWidth / 2, yPos + lineHeight * 2, { align: 'center' });

      // Candidate signature
      doc.line(margin + signatureWidth + signatureSpacing, yPos, margin + 2 * signatureWidth + signatureSpacing, yPos);
      doc.setFont('helvetica', 'bold');
      doc.text('Candidate', margin + signatureWidth + signatureSpacing + signatureWidth / 2, yPos + lineHeight, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.text(bvDetails.candidateName || '[Candidate Name]', margin + signatureWidth + signatureSpacing + signatureWidth / 2, yPos + lineHeight * 2, { align: 'center' });

      // Convert PDF to base64
      const pdfBase64 = doc.output('datauristring').split(',')[1];
      const fileName = `BackgroundVerification_${bvDetails.candidateName || 'Candidate'}_${bvDetails.employer || 'Employer'}_${new Date().toISOString().split('T')[0]}.pdf`;
      
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
        templateName: `BackgroundVerification_${bvDetails.candidateName || 'Candidate'}_${bvDetails.employer || 'Employer'}_${new Date().toISOString().split('T')[0]}`,
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
        showSnackbar('Background Verification template generated and stored successfully!', 'success');
        // Also save the PDF locally for user download
        // doc.save('Background_Verification.pdf');
        onClose();
        
        // Prepare template data for navigation
        const templateTitle = `Background Verification - ${bvDetails.candidateName || 'Candidate'} @ ${bvDetails.employer || 'Employer'}`;
        const templateNote = `Please review and sign this Background Verification Report for ${bvDetails.candidateName || 'Candidate'} verified by ${bvDetails.referenceName || 'Reference'}.`;
        
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
      
      let errorMessage = 'Failed to generate and store Background Verification template';
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
        <DialogTitle>Background Verification Generator</DialogTitle>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <Box sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Enter Background Verification Details
                </Typography>
                <TextField
                  fullWidth
                  label="Candidate Name"
                  name="candidateName"
                  value={bvDetails.candidateName}
                  onChange={handleInputChange}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Candidate Email"
                  name="candidateEmail"
                  value={bvDetails.candidateEmail}
                  onChange={handleInputChange}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Employer"
                  name="employer"
                  value={bvDetails.employer}
                  onChange={handleInputChange}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Position Applied"
                  name="position"
                  value={bvDetails.position}
                  onChange={handleInputChange}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Reference Name"
                  name="referenceName"
                  value={bvDetails.referenceName}
                  onChange={handleInputChange}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Reference Contact"
                  name="referenceContact"
                  value={bvDetails.referenceContact}
                  onChange={handleInputChange}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Verification Details"
                  name="verificationDetails"
                  value={bvDetails.verificationDetails}
                  onChange={handleInputChange}
                  margin="normal"
                  multiline
                  rows={3}
                />
                <TextField
                  fullWidth
                  label="Remarks"
                  name="remarks"
                  value={bvDetails.remarks}
                  onChange={handleInputChange}
                  margin="normal"
                  multiline
                  rows={2}
                />
                <TextField
                  fullWidth
                  label="Verification Date"
                  name="verificationDate"
                  value={bvDetails.verificationDate}
                  onChange={handleInputChange}
                  margin="normal"
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={9}>
              <StyledPaper>
                <Box className="bv-header">
                  <Typography variant="h1">BACKGROUND VERIFICATION REPORT</Typography>
                </Box>
                <Box className="bv-content">
                  <Box className="bv-section">
                    <Typography variant="h2">CANDIDATE INFORMATION</Typography>
                    <Typography>
                      Name: {bvDetails.candidateName || '[Candidate Name]'}<br />
                      Email: {bvDetails.candidateEmail || '[Candidate Email]'}<br />
                      Position Applied: {bvDetails.position || '[Position]'}<br />
                      Employer: {bvDetails.employer || '[Employer]'}
                    </Typography>
                  </Box>
                  <Box className="bv-section">
                    <Typography variant="h2">REFERENCE INFORMATION</Typography>
                    <Typography>
                      Reference Name: {bvDetails.referenceName || '[Reference Name]'}<br />
                      Reference Contact: {bvDetails.referenceContact || '[Reference Contact]'}
                    </Typography>
                  </Box>
                  <Box className="bv-section">
                    <Typography variant="h2">VERIFICATION DETAILS</Typography>
                    <Typography>
                      {bvDetails.verificationDetails || '[Details of the verification process and findings]'}
                    </Typography>
                  </Box>
                  <Box className="bv-section">
                    <Typography variant="h2">REMARKS</Typography>
                    <Typography>
                      {bvDetails.remarks || '[Remarks or additional comments]'}
                    </Typography>
                  </Box>
                  <Box className="bv-section">
                    <Typography variant="h2">VERIFICATION DATE</Typography>
                    <Typography>
                      {bvDetails.verificationDate || '[Verification Date]'}
                    </Typography>
                  </Box>
                  <Box className="bv-section">
                    <Typography variant="h2">SIGNATURES</Typography>
                    <Typography>
                      The information provided above is true and correct to the best of my knowledge.
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                    <Box className="bv-signature">
                      <Box className="signature-line" />
                      <Typography>Reference</Typography>
                      <Typography>{bvDetails.referenceName || '[Reference Name]'}</Typography>
                    </Box>
                    <Box className="bv-signature">
                      <Box className="signature-line" />
                      <Typography>Candidate</Typography>
                      <Typography>{bvDetails.candidateName || '[Candidate Name]'}</Typography>
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
              backgroundColor: '#ad1457',
              '&:hover': {
                backgroundColor: '#78002e',
              },
            }}
          >
            {loading ? 'Generating...' : 'Generate Report'}
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

export default BackgroundVerificationForm; 
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
  '& .nda-header': {
    textAlign: 'center',
    marginBottom: theme.spacing(4),
    '& h1': {
      fontSize: '2rem',
      fontWeight: 'bold',
      color: '#1a237e',
      marginBottom: theme.spacing(2),
    },
  },
  '& .nda-section': {
    marginBottom: theme.spacing(3),
    '& h2': {
      fontSize: '1.2rem',
      color: '#1a237e',
      marginBottom: theme.spacing(1),
    },
  },
  '& .nda-content': {
    fontFamily: 'Georgia, serif',
    fontSize: '1rem',
    lineHeight: 1.6,
    color: '#333',
  },
  '& .nda-signature': {
    marginTop: theme.spacing(4),
    '& .signature-line': {
      borderTop: '1px solid #000',
      width: '250px',
      marginBottom: theme.spacing(1),
    },
  },
}));

const NDATemplateForm = ({ open, onClose }) => {
  const [ndaDetails, setNdaDetails] = useState({
    disclosingParty: '',
    receivingParty: '',
    effectiveDate: '',
    purpose: '',
    confidentialInfo: '',
    term: '',
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
    setNdaDetails((prev) => ({
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
        doc.setTextColor(26, 35, 126); // #1a237e
        doc.text(text, margin, y);
        doc.setFontSize(12);
        doc.setTextColor(51, 51, 51); // #333
        return y + lineHeight;
      };

      // Title
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(26, 35, 126); // #1a237e
      doc.text('NON-DISCLOSURE AGREEMENT', pageWidth / 2, yPos, { align: 'center' });
      yPos += lineHeight * 2;

      // Reset text color for body
      doc.setTextColor(51, 51, 51); // #333

      // Parties
      yPos = addWrappedText(`This Non-Disclosure Agreement (the "Agreement") is entered into on ${ndaDetails.effectiveDate || '[Effective Date]'} between:`, yPos);
      yPos += lineHeight;

      yPos = addSectionHeader('PARTIES', yPos);
      doc.setFont('helvetica', 'normal');
      yPos = addWrappedText(`${ndaDetails.disclosingParty || '[Disclosing Party]'} ("Disclosing Party")`, yPos);
      yPos += lineHeight;
      doc.text('and', margin, yPos);
      yPos += lineHeight;
      yPos = addWrappedText(`${ndaDetails.receivingParty || '[Receiving Party]'} ("Receiving Party")`, yPos);
      yPos += lineHeight * 2;

      // Purpose
      checkNewPage(lineHeight * 6);
      yPos = addSectionHeader('WHEREAS', yPos);
      doc.setFont('helvetica', 'normal');
      yPos = addWrappedText('The Disclosing Party possesses certain confidential and proprietary information;', yPos);
      yPos += lineHeight;
      yPos = addWrappedText('The Receiving Party desires to receive such information for the purpose of:', yPos);
      yPos += lineHeight;
      yPos = addWrappedText(ndaDetails.purpose || '[Purpose of the Agreement]', yPos);
      yPos += lineHeight * 2;

      // Now, Therefore
      checkNewPage(lineHeight * 4);
      yPos = addSectionHeader('NOW, THEREFORE', yPos);
      doc.setFont('helvetica', 'normal');
      yPos = addWrappedText('In consideration of the mutual covenants and promises made by the parties hereto, the parties agree as follows:', yPos);
      yPos += lineHeight * 2;

      // Confidential Information
      checkNewPage(lineHeight * 8);
      yPos = addSectionHeader('1. DEFINITION OF CONFIDENTIAL INFORMATION', yPos);
      doc.setFont('helvetica', 'normal');
      yPos = addWrappedText('"Confidential Information" means any information disclosed by the Disclosing Party to the Receiving Party, including but not limited to:', yPos);
      yPos += lineHeight;
      yPos = addWrappedText(ndaDetails.confidentialInfo || '[Description of Confidential Information]', yPos);
      yPos += lineHeight * 2;

      // Obligations
      checkNewPage(lineHeight * 10);
      yPos = addSectionHeader('2. OBLIGATIONS OF RECEIVING PARTY', yPos);
      doc.setFont('helvetica', 'normal');
      yPos = addWrappedText('The Receiving Party shall:', yPos);
      yPos += lineHeight;
      yPos = addWrappedText('a) Maintain the confidentiality of the Confidential Information', yPos);
      yPos += lineHeight;
      yPos = addWrappedText('b) Use the Confidential Information solely for the Purpose stated above', yPos);
      yPos += lineHeight;
      yPos = addWrappedText('c) Not disclose the Confidential Information to any third party', yPos);
      yPos += lineHeight;
      yPos = addWrappedText('d) Take reasonable measures to protect the Confidential Information', yPos);
      yPos += lineHeight * 2;

      // Term
      checkNewPage(lineHeight * 6);
      yPos = addSectionHeader('3. TERM AND TERMINATION', yPos);
      doc.setFont('helvetica', 'normal');
      yPos = addWrappedText(`This Agreement shall remain in effect for ${ndaDetails.term || '[Term Duration]'} from the Effective Date.`, yPos);
      yPos += lineHeight;
      yPos = addWrappedText('The confidentiality obligations shall survive the termination of this Agreement for a period of 5 years.', yPos);
      yPos += lineHeight * 2;

      // Return of Materials
      checkNewPage(lineHeight * 4);
      yPos = addSectionHeader('4. RETURN OF MATERIALS', yPos);
      doc.setFont('helvetica', 'normal');
      yPos = addWrappedText('Upon termination of this Agreement, the Receiving Party shall return all Confidential Information to the Disclosing Party.', yPos);
      yPos += lineHeight * 2;

      // No License
      checkNewPage(lineHeight * 4);
      yPos = addSectionHeader('5. NO LICENSE', yPos);
      doc.setFont('helvetica', 'normal');
      yPos = addWrappedText('Nothing in this Agreement shall be construed as granting any rights under any patent, copyright, or other intellectual property right.', yPos);
      yPos += lineHeight * 2;

      // Governing Law
      checkNewPage(lineHeight * 4);
      yPos = addSectionHeader('6. GOVERNING LAW', yPos);
      doc.setFont('helvetica', 'normal');
      yPos = addWrappedText('This Agreement shall be governed by and construed in accordance with the laws of [Jurisdiction].', yPos);
      yPos += lineHeight * 2;

      // Signatures
      checkNewPage(lineHeight * 8);
      yPos = addSectionHeader('IN WITNESS WHEREOF', yPos);
      doc.setFont('helvetica', 'normal');
      yPos = addWrappedText('The parties have executed this Agreement as of the Effective Date.', yPos);
      yPos += lineHeight * 3;

      // Signature lines
      const signatureWidth = 80;
      const signatureSpacing = (pageWidth - 2 * margin - 2 * signatureWidth) / 3;

      // Disclosing Party signature
      doc.setDrawColor(0, 0, 0);
      doc.line(margin, yPos, margin + signatureWidth, yPos);
      doc.setFont('helvetica', 'bold');
      doc.text('Disclosing Party', margin + signatureWidth / 2, yPos + lineHeight, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.text(ndaDetails.disclosingParty || '[Disclosing Party Name]', margin + signatureWidth / 2, yPos + lineHeight * 2, { align: 'center' });

      // Receiving Party signature
      doc.line(margin + signatureWidth + signatureSpacing, yPos, margin + 2 * signatureWidth + signatureSpacing, yPos);
      doc.setFont('helvetica', 'bold');
      doc.text('Receiving Party', margin + signatureWidth + signatureSpacing + signatureWidth / 2, yPos + lineHeight, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.text(ndaDetails.receivingParty || '[Receiving Party Name]', margin + signatureWidth + signatureSpacing + signatureWidth / 2, yPos + lineHeight * 2, { align: 'center' });

      // Convert PDF to base64
      const pdfBase64 = doc.output('datauristring').split(',')[1];
      const fileName = `NDA_${ndaDetails.disclosingParty || 'Agreement'}_${ndaDetails.receivingParty || 'Parties'}_${new Date().toISOString().split('T')[0]}.pdf`;
      
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
        templateName: `NDA_${ndaDetails.disclosingParty || 'Agreement'}_${ndaDetails.receivingParty || 'Parties'}_${new Date().toISOString().split('T')[0]}`,
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
        showSnackbar('NDA template generated and stored successfully!', 'success');
        // Also save the PDF locally for user download
        // doc.save('NDA_Agreement.pdf');
        onClose();
        
        // Prepare template data for navigation
        const templateTitle = `NDA - ${ndaDetails.disclosingParty || 'Agreement'} & ${ndaDetails.receivingParty || 'Parties'}`;
        const templateNote = `Please review and sign this Non-Disclosure Agreement between ${ndaDetails.disclosingParty || 'Disclosing Party'} and ${ndaDetails.receivingParty || 'Receiving Party'}.`;
        
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
      
      let errorMessage = 'Failed to generate and store NDA template';
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
        <DialogTitle>NDA Template Generator</DialogTitle>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <Box sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Enter NDA Details
                </Typography>
                <TextField
                  fullWidth
                  label="Disclosing Party"
                  name="disclosingParty"
                  value={ndaDetails.disclosingParty}
                  onChange={handleInputChange}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Receiving Party"
                  name="receivingParty"
                  value={ndaDetails.receivingParty}
                  onChange={handleInputChange}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Effective Date"
                  name="effectiveDate"
                  value={ndaDetails.effectiveDate}
                  onChange={handleInputChange}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Purpose"
                  name="purpose"
                  value={ndaDetails.purpose}
                  onChange={handleInputChange}
                  margin="normal"
                  multiline
                  rows={2}
                />
                <TextField
                  fullWidth
                  label="Confidential Information"
                  name="confidentialInfo"
                  value={ndaDetails.confidentialInfo}
                  onChange={handleInputChange}
                  margin="normal"
                  multiline
                  rows={3}
                />
                <TextField
                  fullWidth
                  label="Term Duration"
                  name="term"
                  value={ndaDetails.term}
                  onChange={handleInputChange}
                  margin="normal"
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={9}>
              <StyledPaper>
                <Box className="nda-header">
                  <Typography variant="h1">NON-DISCLOSURE AGREEMENT</Typography>
                </Box>
                <Box className="nda-content">
                  <Box className="nda-section">
                    <Typography>
                      This Non-Disclosure Agreement (the "Agreement") is entered into on {ndaDetails.effectiveDate || '[Effective Date]'} between:
                    </Typography>
                  </Box>

                  <Box className="nda-section">
                    <Typography variant="h2">PARTIES</Typography>
                    <Typography>
                      {ndaDetails.disclosingParty || '[Disclosing Party]'} ("Disclosing Party")
                      <br />
                      and
                      <br />
                      {ndaDetails.receivingParty || '[Receiving Party]'} ("Receiving Party")
                    </Typography>
                  </Box>

                  <Box className="nda-section">
                    <Typography variant="h2">WHEREAS</Typography>
                    <Typography>
                      The Disclosing Party possesses certain confidential and proprietary information;
                      <br />
                      The Receiving Party desires to receive such information for the purpose of:
                      <br />
                      {ndaDetails.purpose || '[Purpose of the Agreement]'}
                    </Typography>
                  </Box>

                  <Box className="nda-section">
                    <Typography variant="h2">NOW, THEREFORE</Typography>
                    <Typography>
                      In consideration of the mutual covenants and promises made by the parties hereto, the parties agree as follows:
                    </Typography>
                  </Box>

                  <Box className="nda-section">
                    <Typography variant="h2">1. DEFINITION OF CONFIDENTIAL INFORMATION</Typography>
                    <Typography>
                      "Confidential Information" means any information disclosed by the Disclosing Party to the Receiving Party, including but not limited to:
                      <br />
                      {ndaDetails.confidentialInfo || '[Description of Confidential Information]'}
                    </Typography>
                  </Box>

                  <Box className="nda-section">
                    <Typography variant="h2">2. OBLIGATIONS OF RECEIVING PARTY</Typography>
                    <Typography>
                      The Receiving Party shall:
                      <br />
                      a) Maintain the confidentiality of the Confidential Information
                      <br />
                      b) Use the Confidential Information solely for the Purpose stated above
                      <br />
                      c) Not disclose the Confidential Information to any third party
                      <br />
                      d) Take reasonable measures to protect the Confidential Information
                    </Typography>
                  </Box>

                  <Box className="nda-section">
                    <Typography variant="h2">3. TERM AND TERMINATION</Typography>
                    <Typography>
                      This Agreement shall remain in effect for {ndaDetails.term || '[Term Duration]'} from the Effective Date.
                      <br />
                      The confidentiality obligations shall survive the termination of this Agreement for a period of 5 years.
                    </Typography>
                  </Box>

                  <Box className="nda-section">
                    <Typography variant="h2">4. RETURN OF MATERIALS</Typography>
                    <Typography>
                      Upon termination of this Agreement, the Receiving Party shall return all Confidential Information to the Disclosing Party.
                    </Typography>
                  </Box>

                  <Box className="nda-section">
                    <Typography variant="h2">5. NO LICENSE</Typography>
                    <Typography>
                      Nothing in this Agreement shall be construed as granting any rights under any patent, copyright, or other intellectual property right.
                    </Typography>
                  </Box>

                  <Box className="nda-section">
                    <Typography variant="h2">6. GOVERNING LAW</Typography>
                    <Typography>
                      This Agreement shall be governed by and construed in accordance with the laws of [Jurisdiction].
                    </Typography>
                  </Box>

                  <Box className="nda-section">
                    <Typography variant="h2">IN WITNESS WHEREOF</Typography>
                    <Typography>
                      The parties have executed this Agreement as of the Effective Date.
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                    <Box className="nda-signature">
                      <Box className="signature-line" />
                      <Typography>Disclosing Party</Typography>
                      <Typography>{ndaDetails.disclosingParty || '[Disclosing Party Name]'}</Typography>
                    </Box>
                    <Box className="nda-signature">
                      <Box className="signature-line" />
                      <Typography>Receiving Party</Typography>
                      <Typography>{ndaDetails.receivingParty || '[Receiving Party Name]'}</Typography>
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
              backgroundColor: '#1a237e',
              '&:hover': {
                backgroundColor: '#283593',
              },
            }}
          >
            {loading ? 'Generating...' : 'Generate NDA'}
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

export default NDATemplateForm; 
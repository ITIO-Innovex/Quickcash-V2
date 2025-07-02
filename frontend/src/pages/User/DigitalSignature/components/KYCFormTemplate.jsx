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
  '& .kyc-header': {
    textAlign: 'center',
    marginBottom: theme.spacing(4),
    '& h1': {
      fontSize: '2rem',
      fontWeight: 'bold',
      color: '#00897b',
      marginBottom: theme.spacing(2),
    },
  },
  '& .kyc-section': {
    marginBottom: theme.spacing(3),
    '& h2': {
      fontSize: '1.2rem',
      color: '#00897b',
      marginBottom: theme.spacing(1),
    },
  },
  '& .kyc-content': {
    fontFamily: 'Georgia, serif',
    fontSize: '1rem',
    lineHeight: 1.6,
    color: '#333',
  },
  '& .kyc-signature': {
    marginTop: theme.spacing(4),
    '& .signature-line': {
      borderTop: '1px solid #000',
      width: '250px',
      marginBottom: theme.spacing(1),
    },
  },
}));

const KYCFormTemplate = ({ open, onClose }) => {
  const [kycDetails, setKycDetails] = useState({
    customerName: '',
    customerEmail: '',
    dob: '',
    address: '',
    idType: '',
    idNumber: '',
    issuedBy: '',
    issueDate: '',
    expiryDate: '',
    declaration: '',
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
    setKycDetails((prev) => ({
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
        doc.setTextColor(0, 137, 123); // #00897b
        doc.text(text, margin, y);
        doc.setFontSize(12);
        doc.setTextColor(51, 51, 51); // #333
        return y + lineHeight;
      };

      // Title
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 137, 123); // #00897b
      doc.text('KYC (KNOW YOUR CUSTOMER) FORM', pageWidth / 2, yPos, { align: 'center' });
      yPos += lineHeight * 2;

      // Reset text color for body
      doc.setTextColor(51, 51, 51); // #333

      // Customer Info
      yPos = addSectionHeader('CUSTOMER INFORMATION', yPos);
      doc.setFont('helvetica', 'normal');
      yPos = addWrappedText(`Name: ${kycDetails.customerName || '[Customer Name]'}`, yPos);
      yPos = addWrappedText(`Email: ${kycDetails.customerEmail || '[Customer Email]'}`, yPos);
      yPos = addWrappedText(`Date of Birth: ${kycDetails.dob || '[DOB]'}`, yPos);
      yPos = addWrappedText(`Address: ${kycDetails.address || '[Address]'}`, yPos);
      yPos += lineHeight * 2;

      // ID Info
      checkNewPage(lineHeight * 6);
      yPos = addSectionHeader('IDENTITY DOCUMENT DETAILS', yPos);
      doc.setFont('helvetica', 'normal');
      yPos = addWrappedText(`ID Type: ${kycDetails.idType || '[ID Type]'}`, yPos);
      yPos = addWrappedText(`ID Number: ${kycDetails.idNumber || '[ID Number]'}`, yPos);
      yPos = addWrappedText(`Issued By: ${kycDetails.issuedBy || '[Issued By]'}`, yPos);
      yPos = addWrappedText(`Issue Date: ${kycDetails.issueDate || '[Issue Date]'}`, yPos);
      yPos = addWrappedText(`Expiry Date: ${kycDetails.expiryDate || '[Expiry Date]'}`, yPos);
      yPos += lineHeight * 2;

      // Declaration
      checkNewPage(lineHeight * 8);
      yPos = addSectionHeader('DECLARATION', yPos);
      doc.setFont('helvetica', 'normal');
      yPos = addWrappedText(kycDetails.declaration || '[Declaration statement]', yPos);
      yPos += lineHeight * 2;

      // Remarks
      checkNewPage(lineHeight * 6);
      yPos = addSectionHeader('REMARKS', yPos);
      doc.setFont('helvetica', 'normal');
      yPos = addWrappedText(kycDetails.remarks || '[Remarks or additional comments]', yPos);
      yPos += lineHeight * 2;

      // Signatures
      checkNewPage(lineHeight * 8);
      yPos = addSectionHeader('SIGNATURE', yPos);
      doc.setFont('helvetica', 'normal');
      yPos = addWrappedText('I hereby declare that the information provided above is true and correct to the best of my knowledge.', yPos);
      yPos += lineHeight * 3;

      // Signature lines
      const signatureWidth = 80;

      // Customer signature
      doc.setDrawColor(0, 0, 0);
      doc.line(margin, yPos, margin + signatureWidth, yPos);
      doc.setFont('helvetica', 'bold');
      doc.text('Customer', margin + signatureWidth / 2, yPos + lineHeight, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.text(kycDetails.customerName || '[Customer Name]', margin + signatureWidth / 2, yPos + lineHeight * 2, { align: 'center' });

      // Convert PDF to base64
      const pdfBase64 = doc.output('datauristring').split(',')[1];
      const fileName = `KYCForm_${kycDetails.customerName || 'Customer'}_${new Date().toISOString().split('T')[0]}.pdf`;
      
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
        templateName: `KYCForm_${kycDetails.customerName || 'Customer'}_${new Date().toISOString().split('T')[0]}`,
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
        showSnackbar('KYC template generated and stored successfully!', 'success');
        // Also save the PDF locally for user download
        // doc.save('KYC_Form.pdf');
        onClose();
        
        // Prepare template data for navigation
        const templateTitle = `KYC Form - ${kycDetails.customerName || 'Customer'}`;
        const templateNote = `Please review and sign this KYC Form for ${kycDetails.customerName || 'Customer'}.`;
        
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
      
      let errorMessage = 'Failed to generate and store KYC template';
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
        <DialogTitle>KYC Form Generator</DialogTitle>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <Box sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Enter KYC Details
                </Typography>
                <TextField
                  fullWidth
                  label="Customer Name"
                  name="customerName"
                  value={kycDetails.customerName}
                  onChange={handleInputChange}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Customer Email"
                  name="customerEmail"
                  value={kycDetails.customerEmail}
                  onChange={handleInputChange}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Date of Birth"
                  name="dob"
                  value={kycDetails.dob}
                  onChange={handleInputChange}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Address"
                  name="address"
                  value={kycDetails.address}
                  onChange={handleInputChange}
                  margin="normal"
                  multiline
                  rows={2}
                />
                <TextField
                  fullWidth
                  label="ID Type"
                  name="idType"
                  value={kycDetails.idType}
                  onChange={handleInputChange}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="ID Number"
                  name="idNumber"
                  value={kycDetails.idNumber}
                  onChange={handleInputChange}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Issued By"
                  name="issuedBy"
                  value={kycDetails.issuedBy}
                  onChange={handleInputChange}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Issue Date"
                  name="issueDate"
                  value={kycDetails.issueDate}
                  onChange={handleInputChange}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Expiry Date"
                  name="expiryDate"
                  value={kycDetails.expiryDate}
                  onChange={handleInputChange}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Declaration Statement"
                  name="declaration"
                  value={kycDetails.declaration}
                  onChange={handleInputChange}
                  margin="normal"
                  multiline
                  rows={3}
                />
                <TextField
                  fullWidth
                  label="Remarks"
                  name="remarks"
                  value={kycDetails.remarks}
                  onChange={handleInputChange}
                  margin="normal"
                  multiline
                  rows={2}
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={9}>
              <StyledPaper>
                <Box className="kyc-header">
                  <Typography variant="h1">KYC (KNOW YOUR CUSTOMER) FORM</Typography>
                </Box>
                <Box className="kyc-content">
                  <Box className="kyc-section">
                    <Typography variant="h2">CUSTOMER INFORMATION</Typography>
                    <Typography>
                      Name: {kycDetails.customerName || '[Customer Name]'}<br />
                      Email: {kycDetails.customerEmail || '[Customer Email]'}<br />
                      Date of Birth: {kycDetails.dob || '[DOB]'}<br />
                      Address: {kycDetails.address || '[Address]'}
                    </Typography>
                  </Box>
                  <Box className="kyc-section">
                    <Typography variant="h2">IDENTITY DOCUMENT DETAILS</Typography>
                    <Typography>
                      ID Type: {kycDetails.idType || '[ID Type]'}<br />
                      ID Number: {kycDetails.idNumber || '[ID Number]'}<br />
                      Issued By: {kycDetails.issuedBy || '[Issued By]'}<br />
                      Issue Date: {kycDetails.issueDate || '[Issue Date]'}<br />
                      Expiry Date: {kycDetails.expiryDate || '[Expiry Date]'}
                    </Typography>
                  </Box>
                  <Box className="kyc-section">
                    <Typography variant="h2">DECLARATION</Typography>
                    <Typography>
                      {kycDetails.declaration || '[Declaration statement]'}
                    </Typography>
                  </Box>
                  <Box className="kyc-section">
                    <Typography variant="h2">REMARKS</Typography>
                    <Typography>
                      {kycDetails.remarks || '[Remarks or additional comments]'}
                    </Typography>
                  </Box>
                  <Box className="kyc-section">
                    <Typography variant="h2">SIGNATURE</Typography>
                    <Typography>
                      I hereby declare that the information provided above is true and correct to the best of my knowledge.
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 4 }}>
                    <Box className="kyc-signature">
                      <Box className="signature-line" />
                      <Typography>Customer</Typography>
                      <Typography>{kycDetails.customerName || '[Customer Name]'}</Typography>
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
              backgroundColor: '#00897b',
              '&:hover': {
                backgroundColor: '#005b4f',
              },
            }}
          >
            {loading ? 'Generating...' : 'Generate KYC'}
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

export default KYCFormTemplate; 
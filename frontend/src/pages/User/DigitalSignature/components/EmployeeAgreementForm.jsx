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
  '& .ea-header': {
    textAlign: 'center',
    marginBottom: theme.spacing(4),
    '& h1': {
      fontSize: '2rem',
      fontWeight: 'bold',
      color: '#1565c0',
      marginBottom: theme.spacing(2),
    },
  },
  '& .ea-section': {
    marginBottom: theme.spacing(3),
    '& h2': {
      fontSize: '1.2rem',
      color: '#1565c0',
      marginBottom: theme.spacing(1),
    },
  },
  '& .ea-content': {
    fontFamily: 'Georgia, serif',
    fontSize: '1rem',
    lineHeight: 1.6,
    color: '#333',
  },
  '& .ea-signature': {
    marginTop: theme.spacing(4),
    '& .signature-line': {
      borderTop: '1px solid #000',
      width: '250px',
      marginBottom: theme.spacing(1),
    },
  },
}));

const EmployeeAgreementForm = ({ open, onClose }) => {
  const [eaDetails, setEaDetails] = useState({
    employer: '',
    employee: '',
    effectiveDate: '',
    position: '',
    salary: '',
    duties: '',
    term: '',
    confidentiality: '',
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
    setEaDetails((prev) => ({
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
        doc.setTextColor(21, 101, 192); // #1565c0
        doc.text(text, margin, y);
        doc.setFontSize(12);
        doc.setTextColor(51, 51, 51); // #333
        return y + lineHeight;
      };

      // Title
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(21, 101, 192); // #1565c0
      doc.text('EMPLOYMENT AGREEMENT', pageWidth / 2, yPos, { align: 'center' });
      yPos += lineHeight * 2;

      // Reset text color for body
      doc.setTextColor(51, 51, 51); // #333

      // Parties
      yPos = addWrappedText(`This Employment Agreement (the "Agreement") is made and entered into on ${eaDetails.effectiveDate || '[Effective Date]'} between:`, yPos);
      yPos += lineHeight;

      yPos = addSectionHeader('PARTIES', yPos);
      doc.setFont('helvetica', 'normal');
      yPos = addWrappedText(`${eaDetails.employer || '[Employer]'} ("Employer")`, yPos);
      yPos += lineHeight;
      doc.text('and', margin, yPos);
      yPos += lineHeight;
      yPos = addWrappedText(`${eaDetails.employee || '[Employee]'} ("Employee")`, yPos);
      yPos += lineHeight * 2;

      // Position
      checkNewPage(lineHeight * 6);
      yPos = addSectionHeader('POSITION', yPos);
      doc.setFont('helvetica', 'normal');
      yPos = addWrappedText(`The Employee is employed as: ${eaDetails.position || '[Position]'}`, yPos);
      yPos += lineHeight * 2;

      // Duties
      checkNewPage(lineHeight * 8);
      yPos = addSectionHeader('DUTIES AND RESPONSIBILITIES', yPos);
      doc.setFont('helvetica', 'normal');
      yPos = addWrappedText('The Employee agrees to perform the following duties:', yPos);
      yPos += lineHeight;
      yPos = addWrappedText(eaDetails.duties || '[Duties and responsibilities]', yPos);
      yPos += lineHeight * 2;

      // Salary
      checkNewPage(lineHeight * 6);
      yPos = addSectionHeader('COMPENSATION', yPos);
      doc.setFont('helvetica', 'normal');
      yPos = addWrappedText(`The Employee will be paid: ${eaDetails.salary || '[Salary]'}`, yPos);
      yPos += lineHeight * 2;

      // Term
      checkNewPage(lineHeight * 6);
      yPos = addSectionHeader('TERM', yPos);
      doc.setFont('helvetica', 'normal');
      yPos = addWrappedText(`This Agreement shall remain in effect for ${eaDetails.term || '[Term Duration]'} from the Effective Date.`, yPos);
      yPos += lineHeight * 2;

      // Confidentiality
      checkNewPage(lineHeight * 6);
      yPos = addSectionHeader('CONFIDENTIALITY', yPos);
      doc.setFont('helvetica', 'normal');
      yPos = addWrappedText(eaDetails.confidentiality || '[Confidentiality clause]', yPos);
      yPos += lineHeight * 2;

      // Termination
      checkNewPage(lineHeight * 6);
      yPos = addSectionHeader('TERMINATION', yPos);
      doc.setFont('helvetica', 'normal');
      yPos = addWrappedText(eaDetails.termination || '[Termination conditions]', yPos);
      yPos += lineHeight * 2;

      // Governing Law
      checkNewPage(lineHeight * 4);
      yPos = addSectionHeader('GOVERNING LAW', yPos);
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

      // Employer signature
      doc.setDrawColor(0, 0, 0);
      doc.line(margin, yPos, margin + signatureWidth, yPos);
      doc.setFont('helvetica', 'bold');
      doc.text('Employer', margin + signatureWidth / 2, yPos + lineHeight, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.text(eaDetails.employer || '[Employer Name]', margin + signatureWidth / 2, yPos + lineHeight * 2, { align: 'center' });

      // Employee signature
      doc.line(margin + signatureWidth + signatureSpacing, yPos, margin + 2 * signatureWidth + signatureSpacing, yPos);
      doc.setFont('helvetica', 'bold');
      doc.text('Employee', margin + signatureWidth + signatureSpacing + signatureWidth / 2, yPos + lineHeight, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.text(eaDetails.employee || '[Employee Name]', margin + signatureWidth + signatureSpacing + signatureWidth / 2, yPos + lineHeight * 2, { align: 'center' });

      // Convert PDF to base64
      const pdfBase64 = doc.output('datauristring').split(',')[1];
      const fileName = `EmployeeAgreement_${eaDetails.employer || 'Employer'}_${eaDetails.employee || 'Employee'}_${new Date().toISOString().split('T')[0]}.pdf`;
      
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
        templateName: `EmployeeAgreement_${eaDetails.employer || 'Employer'}_${eaDetails.employee || 'Employee'}_${new Date().toISOString().split('T')[0]}`,
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
        showSnackbar('Employee Agreement template generated and stored successfully!', 'success');
        // Also save the PDF locally for user download
        // doc.save('Employee_Agreement.pdf');
        onClose();
        
        // Prepare template data for navigation
        const templateTitle = `Employee Agreement - ${eaDetails.employer || 'Employer'} & ${eaDetails.employee || 'Employee'}`;
        const templateNote = `Please review and sign this Employment Agreement between ${eaDetails.employer || 'Employer'} and ${eaDetails.employee || 'Employee'}.`;
        
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
      
      let errorMessage = 'Failed to generate and store Employee Agreement template';
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
        <DialogTitle>Employee Agreement Generator</DialogTitle>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <Box sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Enter Employee Agreement Details
                </Typography>
                <TextField
                  fullWidth
                  label="Employer"
                  name="employer"
                  value={eaDetails.employer}
                  onChange={handleInputChange}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Employee"
                  name="employee"
                  value={eaDetails.employee}
                  onChange={handleInputChange}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Effective Date"
                  name="effectiveDate"
                  value={eaDetails.effectiveDate}
                  onChange={handleInputChange}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Position"
                  name="position"
                  value={eaDetails.position}
                  onChange={handleInputChange}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Salary"
                  name="salary"
                  value={eaDetails.salary}
                  onChange={handleInputChange}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Duties and Responsibilities"
                  name="duties"
                  value={eaDetails.duties}
                  onChange={handleInputChange}
                  margin="normal"
                  multiline
                  rows={3}
                />
                <TextField
                  fullWidth
                  label="Term Duration"
                  name="term"
                  value={eaDetails.term}
                  onChange={handleInputChange}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Confidentiality Clause"
                  name="confidentiality"
                  value={eaDetails.confidentiality}
                  onChange={handleInputChange}
                  margin="normal"
                  multiline
                  rows={2}
                />
                <TextField
                  fullWidth
                  label="Termination Conditions"
                  name="termination"
                  value={eaDetails.termination}
                  onChange={handleInputChange}
                  margin="normal"
                  multiline
                  rows={2}
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={9}>
              <StyledPaper>
                <Box className="ea-header">
                  <Typography variant="h1">EMPLOYMENT AGREEMENT</Typography>
                </Box>
                <Box className="ea-content">
                  <Box className="ea-section">
                    <Typography>
                      This Employment Agreement (the "Agreement") is made and entered into on {eaDetails.effectiveDate || '[Effective Date]'} between:
                    </Typography>
                  </Box>

                  <Box className="ea-section">
                    <Typography variant="h2">PARTIES</Typography>
                    <Typography>
                      {eaDetails.employer || '[Employer]'} ("Employer")
                      <br />
                      and
                      <br />
                      {eaDetails.employee || '[Employee]'} ("Employee")
                    </Typography>
                  </Box>

                  <Box className="ea-section">
                    <Typography variant="h2">POSITION</Typography>
                    <Typography>
                      The Employee is employed as: {eaDetails.position || '[Position]'}
                    </Typography>
                  </Box>

                  <Box className="ea-section">
                    <Typography variant="h2">DUTIES AND RESPONSIBILITIES</Typography>
                    <Typography>
                      The Employee agrees to perform the following duties:
                      <br />
                      {eaDetails.duties || '[Duties and responsibilities]'}
                    </Typography>
                  </Box>

                  <Box className="ea-section">
                    <Typography variant="h2">COMPENSATION</Typography>
                    <Typography>
                      The Employee will be paid: {eaDetails.salary || '[Salary]'}
                    </Typography>
                  </Box>

                  <Box className="ea-section">
                    <Typography variant="h2">TERM</Typography>
                    <Typography>
                      This Agreement shall remain in effect for {eaDetails.term || '[Term Duration]'} from the Effective Date.
                    </Typography>
                  </Box>

                  <Box className="ea-section">
                    <Typography variant="h2">CONFIDENTIALITY</Typography>
                    <Typography>
                      {eaDetails.confidentiality || '[Confidentiality clause]'}
                    </Typography>
                  </Box>

                  <Box className="ea-section">
                    <Typography variant="h2">TERMINATION</Typography>
                    <Typography>
                      {eaDetails.termination || '[Termination conditions]'}
                    </Typography>
                  </Box>

                  <Box className="ea-section">
                    <Typography variant="h2">GOVERNING LAW</Typography>
                    <Typography>
                      This Agreement shall be governed by and construed in accordance with the laws of [Jurisdiction].
                    </Typography>
                  </Box>

                  <Box className="ea-section">
                    <Typography variant="h2">IN WITNESS WHEREOF</Typography>
                    <Typography>
                      The parties have executed this Agreement as of the Effective Date.
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                    <Box className="ea-signature">
                      <Box className="signature-line" />
                      <Typography>Employer</Typography>
                      <Typography>{eaDetails.employer || '[Employer Name]'}</Typography>
                    </Box>
                    <Box className="ea-signature">
                      <Box className="signature-line" />
                      <Typography>Employee</Typography>
                      <Typography>{eaDetails.employee || '[Employee Name]'}</Typography>
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
              backgroundColor: '#1565c0',
              '&:hover': {
                backgroundColor: '#003c8f',
              },
            }}
          >
            {loading ? 'Generating...' : 'Generate Agreement'}
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

export default EmployeeAgreementForm; 
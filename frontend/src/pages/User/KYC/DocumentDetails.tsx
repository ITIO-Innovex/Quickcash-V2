
import React, { useState } from 'react';
import { Box, Typography, Grid, useTheme } from '@mui/material';
import CustomInput from '@/components/CustomInputField';
import CustomSelect from '@/components/CustomDropdown';
import CustomButton from '@/components/CustomButton';
import FileUpload from '@/components/FileUpload';


interface DocumentDetailsProps {
  onNext: () => void;
  onBack: () => void;
}

const DocumentDetails: React.FC<DocumentDetailsProps> = ({ onNext, onBack , }) => {
  const theme = useTheme();
  const [documentType, setDocumentType] = useState('Passport');
  const [documentNumber, setDocumentNumber] = useState('');
  const [frontDocument, setFrontDocument] = useState<File | null>(null);
  const [backDocument, setBackDocument] = useState<File | null>(null);

  const documentTypes = [
    { label: 'Passport', value: 'Passport' },
    { label: 'Driver\'s License', value: 'Driver\'s License' },
    { label: 'National ID', value: 'National ID' },
    { label: 'Utility Bill', value: 'Utility Bill' },
  ];

  const handleNext = () => {
    onNext();
  };

  const handleBack = () => {
    onBack();
  };

  return (
    <Box className="contact-details-container">
      <Box className="step-indicator">
        <Typography className="step-text">STEP 2 OF 3</Typography>
        <Typography variant="h5" className="step-title">
          Document Details
        </Typography>
        <Box className="step-progress">
          <Box className="progress-bar active"></Box>
          <Box className="progress-bar active"></Box>
          <Box className="progress-bar"></Box>
        </Box>
      </Box>

      <Typography className="step-description">
        Please upload your identification document. Accepted documents include a passport, or driver's license.
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box className="input-section">
            <Typography className="input-label">TYPE OF DOCUMENT</Typography>
            <CustomSelect
              label=""
              options={documentTypes}
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value as string)}
            />
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Box className="input-section">
            <Typography className="input-label">SELECTED DOCUMENT NUMBER</Typography>
            <CustomInput
              fullWidth
              value={documentNumber}
              onChange={(e) => setDocumentNumber(e.target.value)}
              placeholder="Enter document number"
            />
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Box className="input-section" >
            <Typography className="input-label">UPLOAD DOCUMENT (FRONT)</Typography>
            <FileUpload 
              onFileSelect={setFrontDocument}
              selectedFile={frontDocument}
              acceptedFormats=".jpg,.jpeg,.png,.pdf"
            />
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Box className="input-section">
            <Typography className="input-label">UPLOAD DOCUMENT (BACK)</Typography>
            <FileUpload
              onFileSelect={setBackDocument}
              selectedFile={backDocument}
              acceptedFormats=".jpg,.jpeg,.png,.pdf"
            />
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Box className="upload-note" >
            <Typography className="upload-note-text">
              <strong>Notes:</strong> Upload the selected document in .jpg, .jpeg or .pdf format, as described above. The maximum file size should be less than of 5mb. Before submitting, double-check that the document includes the correct information.
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Box className="button-container">
            <CustomButton
              className="back-button"
              onClick={handleBack}
            >
              Back
            </CustomButton>
            <CustomButton
              className="update-button"
              onClick={handleNext}
            >
              Next
            </CustomButton>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DocumentDetails;

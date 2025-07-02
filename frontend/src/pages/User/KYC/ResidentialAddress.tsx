
import React, { useState } from 'react';
import { Box, Typography, Grid } from '@mui/material';
import CustomSelect from '@/components/CustomDropdown';
import CustomButton from '@/components/CustomButton';
import FileUpload from '@/components/FileUpload';

interface ResidentialAddressProps {
  onBack: () => void;
}

const ResidentialAddress: React.FC<ResidentialAddressProps> = ({ onBack }) => {
  const [documentType, setDocumentType] = useState('Bank Statement');
  const [document, setDocument] = useState<File | null>(null);

  const documentTypes = [
    { label: 'Bank Statement', value: 'Bank Statement' },
    { label: 'Utility Bill', value: 'Utility Bill' },
    { label: 'Lease Agreement', value: 'Lease Agreement' },
    { label: 'Government Document', value: 'Government Document' },
  ];

  const handleUpdate = () => {
    console.log('Updating residential address...');
  };

  const handleBack = () => {
    onBack();
  };

  return (
    <Box className="contact-details-container">
      <Box className="step-indicator">
        <Typography className="step-text">STEP 3 OF 3</Typography>
        <Typography variant="h5" className="step-title">
          Residential Address
        </Typography>
        <Box className="step-progress">
          <Box className="progress-bar active"></Box>
          <Box className="progress-bar active"></Box>
          <Box className="progress-bar active"></Box>
        </Box>
      </Box>

      <Typography className="step-description">
        Please upload your proof of residential address. Accepted documents include bank statement, utility bill, or lease agreement.
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
            <Typography className="input-label">UPLOAD DOCUMENT</Typography>
            <FileUpload
              onFileSelect={setDocument}
              selectedFile={document}
              acceptedFormats=".jpg,.jpeg,.png,.pdf"
            />
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Box className="upload-note">
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
              onClick={handleUpdate}
            >
              Update
            </CustomButton>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ResidentialAddress;

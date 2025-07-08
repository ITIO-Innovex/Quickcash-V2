import React, { useState } from 'react';
import { useAppToast } from '@/utils/toast';
import FileUpload from '@/components/FileUpload';
import CustomButton from '@/components/CustomButton';
import CustomSelect from '@/components/CustomDropdown';
import CustomInput from '@/components/CustomInputField';
import { Box, Typography, Grid, useTheme } from '@mui/material';

interface DocumentDetailsProps {
  onNext: () => void;
  onBack: () => void;
  setFrontDocument: (doc: { raw: File; preview: string }) => void;
  setBackDocument: (doc: { raw: File; preview: string }) => void;
}

const DocumentDetails: React.FC<DocumentDetailsProps> = ({
  onNext,
  onBack,
  setFrontDocument,
  setBackDocument,
}) => {
  const theme = useTheme();
  const toast = useAppToast();

  const [documentNumber, setDocumentNumber] = useState('');
  const [documentType, setDocumentType] = useState('Passport');
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);

  const documentTypes = [
    { label: 'Passport', value: 'Passport' },
    { label: 'Driver\'s License', value: 'Driver\'s License' },
  ];

  const handleNext = () => {
    const existing = JSON.parse(localStorage.getItem('KycData') || '{}');
    const updated = {
      ...existing,
      documentType,
      documentNumber,
    };
    localStorage.setItem('KycData', JSON.stringify(updated));

    console.log('[📤 NEXT CLICKED]');
    console.log('Document Type:', documentType);
    console.log('Document Number:', documentNumber);
    console.log('Front File:', frontFile);
    console.log('Back File:', backFile);

    onNext();
  };

  const handleBack = () => {
    onBack();
  };

  const handleFileSelect = (file: File | null, type: 'front' | 'back') => {
    if (!file) return;

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only PDF, JPG, JPEG, and PNG formats are allowed');
      return;
    }

    const preview = URL.createObjectURL(file);
    const imageName = `${type}-document-${Date.now()}-${file.name}`;

    const existing = JSON.parse(localStorage.getItem('KycData') || '{}');
    const updated = {
      ...existing,
      ...(type === 'front' ? { frontDocumentName: imageName } : { backDocumentName: imageName }),
    };
    localStorage.setItem('KycData', JSON.stringify(updated));

    if (type === 'front') {
      setFrontFile(file);
      setFrontDocument({ raw: file, preview });

      console.log('[✅ FRONT DOCUMENT SELECTED]');
      console.log('Name:', file.name);
      console.log('Preview:', preview);
    } else {
      setBackFile(file);
      setBackDocument({ raw: file, preview });

      console.log('[✅ BACK DOCUMENT SELECTED]');
      console.log('Name:', file.name);
      console.log('Preview:', preview);
    }
  };

  return (
    <Box className="contact-details-container">
      <Box className="step-indicator">
        <Typography className="step-text">STEP 2 OF 3</Typography>
        <Typography variant="h5" className="step-title">Document Details</Typography>
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
            <Typography className="input-label">DOCUMENT NUMBER</Typography>
            <CustomInput
              fullWidth
              value={documentNumber}
              onChange={(e) => setDocumentNumber(e.target.value)}
              placeholder="Enter document number"
            />
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Box className="input-section">
            <Typography className="input-label">UPLOAD DOCUMENT (FRONT)</Typography>
            <FileUpload sx={{color:'text.gray'}}
              onFileSelect={(file) => handleFileSelect(file, 'front')}
              selectedFile={frontFile}
              acceptedFormats=".jpg,.jpeg,.png,.pdf"
            />
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Box className="input-section">
            <Typography className="input-label">UPLOAD DOCUMENT (BACK)</Typography>
            <FileUpload
            sx={{color:'text.gray'}}
              onFileSelect={(file) => handleFileSelect(file, 'back')}
              selectedFile={backFile}
              acceptedFormats=".jpg,.jpeg,.png,.pdf"
            />
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Box className="upload-note">
            <Typography className="upload-note-text">
              <strong>Note:</strong> Upload the selected document in JPG, PNG, or PDF format, max size 5MB. Make sure the document is clear and readable.
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Box className="button-container">
            <CustomButton className="back-button" onClick={handleBack}>Back</CustomButton>
            <CustomButton className="update-button" onClick={handleNext}>Next</CustomButton>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DocumentDetails;

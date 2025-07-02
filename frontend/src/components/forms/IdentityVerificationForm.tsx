
import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import CustomDropdown from '../CustomDropdown';
import FileUpload from '../FileUpload';

interface IdentityVerificationFormProps {
  values: {
    documentType: string;
    document: File | null;
  };
  errors: {
    documentType?: string;
    document?: string;
  };
  onChange: (name: string, value: string | File | null) => void;
}

const IdentityVerificationForm: React.FC<IdentityVerificationFormProps> = ({
  values,
  errors,
  onChange
}) => {
  const theme = useTheme();
  
  const documentTypeOptions = [
    { label: 'Passport', value: 'passport' },
    { label: 'Driver License', value: 'drivers_license' },
    { label: 'National ID', value: 'national_id' },
  ];

  return (
    <Box sx={{ display: 'grid', gap: 3 }}>
      <Typography variant="h6" sx={{ color: theme.palette.text.primary, mb: 2 }}>
        Verify your identity
      </Typography>
      <CustomDropdown
        label="Document Type"
        name="documentType"
        value={values.documentType}
        onChange={(e) => onChange('documentType', e.target.value as string)}
        options={documentTypeOptions}
      />
      <Box>
        <Typography variant="subtitle2" sx={{ mb: 1, color: theme.palette.text.primary }}>
          Attach Document
        </Typography>
        <FileUpload
          onFileSelect={(file) => onChange('document', file)}
          selectedFile={values.document}
          acceptedFormats=".jpg,.jpeg,.png,.pdf"
        />
        {errors.document && (
          <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
            {errors.document}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default IdentityVerificationForm;

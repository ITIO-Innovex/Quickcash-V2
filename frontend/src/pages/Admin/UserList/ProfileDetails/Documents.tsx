import React, { useState } from 'react';
import { Box, Typography, Grid, Avatar } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CustomInput from '@/components/CustomInputField';
import CustomSelect from '@/components/CustomDropdown';
import logo from '../../../../../public/logo.png';

const Documents = () => {
  const theme = useTheme();
  const [zoom, setZoom] = useState(false);

  const [formData, setFormData] = useState({
    documentId: 'ABCD1234567',
    idType: 'passport',
  });

  const idTypeOptions = [
    { label: 'Driving License', value: 'driving_license' },
    { label: 'Passport', value: 'passport' },
    { label: 'National ID', value: 'national-id' },
    { label: 'Social Security Card', value: 'ssn' },
  ];

  return (
    <Box className="documents-container">
      <Typography variant="h6" className="documents-title">
        Documents
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <CustomInput
            label="Document ID No"
            value={formData.documentId}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, documentId: e.target.value }))
            }
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomSelect
            label="ID of Individual"
            options={idTypeOptions}
            value={formData.idType}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, idType: e.target.value as string }))
            }
          />
        </Grid>
        <Grid item xs={12}>
          <Box
            className={`document-preview-box${zoom ? ' zoomed' : ''}`}
            onMouseEnter={() => setZoom(true)}
            onMouseLeave={() => setZoom(false)}
          >
            <Avatar
              src={logo}
              alt="Uploaded Document"
              className="document-avatar"
            />
            <Typography>Uploaded Document</Typography>
            {zoom && (
              <Box className="document-zoom-box">
                <img
                  src={logo}
                  alt="Zoomed Document"
                  className="document-zoom-img"
                />
              </Box>
            )}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Documents;
import React, { useState } from 'react';
import { Box, Typography, Grid, Avatar } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CustomInput from '@/components/CustomInputField';
import CustomSelect from '@/components/CustomDropdown';
import logo from '../../../../../public/logo.png';

interface DocumentsProps {
  documents: any;
}

const Documents = ({ documents }: DocumentsProps) => {
  const theme = useTheme();
  const [zoom, setZoom] = useState(false);


  return (
    <Box className="documents-container">
      <Typography variant="h6" className="documents-title">
        Documents
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <CustomInput
            label="Document ID No"
            value={documents?.owneridofindividual || ''}
            disabled
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomInput
            label="ID of Individual"
            value={documents?.ownertaxid || ''}
            disabled
          />
        </Grid>
        <Grid item xs={12}>
          <Box
            className={`document-preview-box${zoom ? ' zoomed' : ''}`}
            onMouseEnter={() => setZoom(true)}
            onMouseLeave={() => setZoom(false)}
          >
            <Avatar
              src={documents?.ownerbrd ? `${import.meta.env.VITE_PUBLIC_URL}/${documents.ownerbrd}` : logo}
              alt="Uploaded Document"
              className="document-avatar"
            />
            <Typography>Uploaded Document</Typography>
            {zoom && (
              <Box className="document-zoom-box">
                <img
                  src={documents?.ownerbrd ? `${import.meta.env.VITE_PUBLIC_URL}/${documents.ownerbrd}` : logo}
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
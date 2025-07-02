
import React from 'react';
import { Box, Typography, Grid, useTheme } from '@mui/material';

interface ViewClientModalProps {
  client: any;
  onClose: () => void;
}

const ViewClientModal: React.FC<ViewClientModalProps> = ({ client }) => {
  const theme = useTheme();

  if (!client) return null;

  return (
    <Box 
      className="view-client-modal"
      sx={{ 
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary 
      }}
    >
      <Box className="client-avatar">
        <Box className="avatar-placeholder">
          <Typography variant="h3" className="avatar-text">
            {client.clientName?.charAt(0)?.toUpperCase() || 'C'}
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3} className="client-details-grid">
        <Grid item xs={12} sm={6}>
          <Box className="detail-item">
            <Typography variant="subtitle2" className="detail-label">
              NAME
            </Typography>
            <Typography variant="body1" className="detail-value">
              {client.clientName}
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Box className="detail-item">
            <Typography variant="subtitle2" className="detail-label">
              MOBILE
            </Typography>
            <Typography variant="body1" className="detail-value">
              {client.mobile}
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Box className="detail-item">
            <Typography variant="subtitle2" className="detail-label">
              EMAIL
            </Typography>
            <Typography variant="body1" className="detail-value">
              {client.email}
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Box className="detail-item">
            <Typography variant="subtitle2" className="detail-label">
              POSTAL CODE
            </Typography>
            <Typography variant="body1" className="detail-value">
              {client.postalCode}
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Box className="detail-item">
            <Typography variant="subtitle2" className="detail-label">
              COUNTRY
            </Typography>
            <Typography variant="body1" className="detail-value">
              {client.country}
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Box className="detail-item">
            <Typography variant="subtitle2" className="detail-label">
              STATE
            </Typography>
            <Typography variant="body1" className="detail-value">
              {client.state}
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Box className="detail-item">
            <Typography variant="subtitle2" className="detail-label">
              CITY
            </Typography>
            <Typography variant="body1" className="detail-value">
              {client.city}
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Box className="detail-item">
            <Typography variant="subtitle2" className="detail-label">
              ADDRESS
            </Typography>
            <Typography variant="body1" className="detail-value">
              {client.address}
            </Typography>
          </Box>
        </Grid>

        {client.notes && (
          <Grid item xs={12}>
            <Box className="detail-item">
              <Typography variant="subtitle2" className="detail-label">
                NOTES
              </Typography>
              <Typography variant="body1" className="detail-value">
                {client.notes}
              </Typography>
            </Box>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default ViewClientModal;

import React from 'react';
import {
  Modal,
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Divider,
  Avatar,
  Chip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import { Cancel } from '@mui/icons-material';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  maxHeight: '80vh',
  borderRadius: '8px',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 0,
  overflow: 'auto',
};

const SignersModal = ({ open, handleClose, documentDetails }) => {
  const getDynamicChip = (signer) => {
    const signerEmail = signer?.Email;
    if (!signerEmail) {
      return;
    }

    const details = documentDetails?.AuditTrail?.find(
      (item) => item?.UserDetails?.Email === signerEmail
    );

    const isCurrentSignerDeclinedUser =
      documentDetails?.IsDeclined &&
      documentDetails?.DeclineBy?.email === signerEmail;

    if (isCurrentSignerDeclinedUser) {
      return (
        <Chip
          size="small"
          label="Declined"
          color="error"
          sx={{ width: 'fit-content' }}
          icon={<Cancel fontSize="small" />}
        />
      );
    }

    if (details?.Activity === 'Signed') {
      return (
        <Chip
          size="small"
          label="Signed"
          color="success"
          sx={{ width: 'fit-content' }}
          icon={<CheckCircleIcon fontSize="small" />}
        />
      );
    } else {
      return (
        <Chip
          size="small"
          label="Pending"
          color="warning"
          sx={{ width: 'fit-content' }}
          icon={<PendingIcon fontSize="small" />}
        />
      );
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="signers-modal-title"
      aria-describedby="signers-modal-description"
    >
      <Box sx={style}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 2,
            borderBottom: '1px solid #e0e0e0',
          }}
        >
          <Typography
            id="signers-modal-title"
            variant="h6"
            component="h2"
            sx={{ fontWeight: 'bold' }}
          >
            Signers ({documentDetails?.Signers?.length || 0})
          </Typography>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        <List sx={{ pt: 0 }}>
          {documentDetails?.Signers && documentDetails?.Signers.length > 0 ? (
            documentDetails?.Signers.map((signer, index) => (
              <React.Fragment key={index}>
                <ListItem sx={{ py: 2 }}>
                  <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                    <PersonIcon />
                  </Avatar>
                  <ListItemText
                    primary={signer.Name || signer.name || 'Unnamed Signer'}
                    secondary={
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 0.5,
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          {signer.Email || signer.email}
                        </Typography>
                        {getDynamicChip(signer)}
                      </Box>
                    }
                    primaryTypographyProps={{
                      fontWeight: 'medium',
                      fontSize: '1rem',
                    }}
                  />
                </ListItem>
                {index < documentDetails?.Signers?.length - 1 && (
                  <Divider component="li" />
                )}
              </React.Fragment>
            ))
          ) : (
            <ListItem>
              <ListItemText
                primary="No signers found."
                sx={{ textAlign: 'center', color: 'text.secondary' }}
              />
            </ListItem>
          )}
        </List>
      </Box>
    </Modal>
  );
};

export default SignersModal;

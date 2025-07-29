import React from 'react';
import {
  Modal,
  Box,
  Typography,
  IconButton,
  SxProps,
  Theme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface CustomModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  sx?: SxProps<Theme>;
  hideCloseIcon?: boolean; // NEW
  disableBackdropClick?: boolean; // NEW
}

const CustomModal: React.FC<CustomModalProps> = ({
  open,
  onClose,
  title,
  children,
  maxWidth = 'sm',
  sx = {},
  hideCloseIcon = false, // NEW
  disableBackdropClick = false,
}) => {
  return (
    <Modal
      open={open}
      onClose={
        disableBackdropClick
          ? (event, reason) => {
              if (reason !== 'backdropClick') {
                onClose();
              }
            }
          : onClose
      }
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
      disableEscapeKeyDown={disableBackdropClick}
    >
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '100%',
          maxWidth: {
            xs: '90%',
            sm:
              maxWidth === 'xs'
                ? 400
                : maxWidth === 'sm'
                ? 600
                : maxWidth === 'md'
                ? 900
                : maxWidth === 'lg'
                ? 1200
                : 1536,
          },
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 1,
          maxHeight: '90vh',
          overflowY: 'auto',
          ...sx, 
        }}
      >
         <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography id="modal-title" variant="h6" component="h2">
            {title}
          </Typography>
          {!hideCloseIcon && (
            <IconButton
              aria-label="close"
              onClick={onClose}
              sx={{
                color: (theme) => theme.palette.grey[500],
              }}
            >
              <CloseIcon />
            </IconButton>
          )}
        </Box>
        <Box id="modal-description">{children}</Box>
      </Box>
    </Modal>
  );
};
export default CustomModal;

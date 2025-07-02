import axios from 'axios';
import { Box, Button, IconButton, Modal, Typography } from "@mui/material"

import CloseIcon from '@mui/icons-material/Close';
import { getBearerToken } from "../../constant/Utils";

export const DeleteDocumentModal = ({ openDeleteModal, handleCloseDeleteModal, documentDetails, onDelete }) => {

  const handleConfirmDelete = async () => {
    try {
      const token = getBearerToken();
      const documentId = documentDetails?._id;
      if (!documentId) {
        console.error("Document ID is missing for deletion.");
        return;
      }

      await axios.delete(`http://localhost:5000/api/v1/digital-signature/documents/${documentId}`, {
        headers: {
          Authorization: token,
        },
      });

      onDelete();
    } catch (err) {
      console.error('Error deleting document:', err);
    } finally {
      handleCloseDeleteModal();
    }
  };
  return (
    <Modal
      open={openDeleteModal}
      onClose={handleCloseDeleteModal}
      aria-labelledby="delete-modal-title"
      aria-describedby="delete-modal-description"
    >
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: 'background.paper',
        borderRadius: '8px',
        boxShadow: 24,
        p: 4,
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography id="delete-modal-title" variant="h6" component="h2">
            Delete document
          </Typography>
          <IconButton
            aria-label="close"
            onClick={handleCloseDeleteModal}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
        <Typography id="delete-modal-description" sx={{ mt: 2 }}>
          Are you sure you want to delete this document?
        </Typography>
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button onClick={handleCloseDeleteModal} variant="outlined">
            NO
          </Button>
          <Button onClick={handleConfirmDelete} variant="contained" color="primary">
            YES
          </Button>
        </Box>
      </Box>
    </Modal>
  )
}
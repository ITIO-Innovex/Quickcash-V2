import { Box, Button, Grid, IconButton, Modal, Typography } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { DocumentDetails } from "@/interfaces/digital-signature/document.interface";
import { useAppToast } from '@/utils/toast'; 


interface ShareLinkModalProps {
  openShareModal: boolean;
  handleCloseShareModal: () => void;
  documentDetails: DocumentDetails;
}

export const ShareLinkModal: React.FC<ShareLinkModalProps> = ({
  openShareModal,
  handleCloseShareModal,
  documentDetails
}) => {
  const toast = useAppToast(); 
  return (
    <Modal
      open={openShareModal}
      onClose={handleCloseShareModal}
      aria-labelledby="share-link-modal-title"
      aria-describedby="share-link-modal-description"
    >
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 500,
          bgcolor: 'background.paper',
          border: '1px solid #ddd',
          boxShadow: 24,
          p: 2,
          borderRadius: '8px',
        }}
      >
        <Box
          sx={{
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography id="share-link-modal-title" variant="h5" component="h2">
            Copy link
          </Typography>
          <IconButton onClick={handleCloseShareModal}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Box id="share-link-modal-description">
          {documentDetails?.Signers?.length > 0 ? (
            <Grid container spacing={2}>
              {documentDetails?.Signers?.map((signer, index) => {
                const objectId = signer.objectId;
                const hostUrl = window.location.origin;
                const sendMail = false;
                const encodeBase64 = btoa(
                  `${documentDetails?.objectId}/${signer.Email}/${objectId}/${sendMail}`
                );
                let signPdfUrl = `${hostUrl}/digital-signature/login/${encodeBase64}`;
                return (
                  <Grid
                    item
                    xs={12}
                    key={index}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Typography variant="body1">{signer.Email}</Typography>
                    <Box>
                      <Button
                        variant="contained"
                        startIcon={<ContentCopyIcon />}
                        sx={{
                          borderRadius: '20px',
                          backgroundColor: '#483594',
                        }}
                        onClick={() => {
                          navigator.clipboard.writeText(signPdfUrl);
                          toast.success('Link Copied Successfully');
                        }}
                      >
                        Copy
                      </Button>
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          ) : (
            <Typography>No signers available to share links.</Typography>
          )}
        </Box>
      </Box>
    </Modal>
  )
}
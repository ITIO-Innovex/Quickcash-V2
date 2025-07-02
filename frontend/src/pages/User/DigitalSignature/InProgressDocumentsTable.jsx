import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  CircularProgress,
  Typography,
  Chip,
  TablePagination,
  TextField,
  Box,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Modal,
  Button,
  Grid,
  Avatar,
  Stack,
  Tooltip,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/Download';
import ShareIcon from '@mui/icons-material/Share';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CloseIcon from '@mui/icons-material/Close';
import { getBearerToken } from '../constant/Utils';
import { getDocumentViewRedirectionURL } from '@/utils/digitalSignature';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import { RemoveRedEye, Send } from '@mui/icons-material';
import { CheckCircleIcon } from 'lucide-react';

const InProgressDocumentsTable = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const navigate = useNavigate()

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');

  // Modal state
  const [openShareModal, setOpenShareModal] = useState(false);
  const [selectedDocumentSigners, setSelectedDocumentSigners] = useState({});

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        const userInfo = JSON.parse(localStorage.getItem('UserInformation'));
        const userId = userInfo?.user;
        if (!userId) {
          throw new Error('User ID not found');
        }

        const response = await fetch(
          // 'https://quickcash.oyefin.com/api/v1/digital-signature/documents/get-report?statusFilter=inProgress',
          'http://localhost:5000/api/v1/digital-signature/documents/get-report?statusFilter=inProgress',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: getBearerToken()
            },
            body: JSON.stringify({
              userid: userId,
              skip: page * rowsPerPage,
              limit: rowsPerPage,
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch documents');
        }

        const responseData = await response.json();

        // Handle the correct API response structure
        if (responseData && responseData.success && responseData.data) {
          const documentsData = Array.isArray(responseData.data.documents)
            ? responseData.data.documents
            : [];

          // Set total count from pagination info
          const totalCount =
            responseData.data.pagination?.total || documentsData.length;

          console.log('Processed Documents:', documentsData);
          setDocuments(documentsData);
          setTotalCount(totalCount);
        } else {
          console.log('No data in response');
          setDocuments([]);
          setTotalCount(0);
        }

        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching documents:', err);
        setDocuments([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [page, rowsPerPage]);

  const handleOpenShareModal = (document) => {
    setSelectedDocumentSigners(document || []);
    setOpenShareModal(true);
  };

  const handleCloseShareModal = () => {
    setOpenShareModal(false);
    setSelectedDocumentSigners([]);
  };

  const handleCopyLink = (url) => {
    // In a real application, you'd generate a unique link for the signer
    navigator.clipboard.writeText(url);
    alert(`Link for copied`);
  };

  const handleShareLink = (email) => {
    // In a real application, you'd typically open an email client or a share dialog
    alert(`Sharing link for ${email}! (Placeholder action)`);
  };

  // Filter documents based on search term
  const filteredDocuments = Array.isArray(documents)
    ? documents.filter((document) => {
      const matchesSearch = document.Name?.toLowerCase().includes(
        searchTerm.toLowerCase()
      );
      return matchesSearch;
    })
    : [];

  // Handle pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle search
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const getSignerStatusChip = (signer, documentDetails) => {
    const details = documentDetails?.AuditTrail?.find(
      (item) => item?.UserDetails?.Email === signer?.Email
    );

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
    }
    
    const hasViewed = documentDetails?.Viewers?.find?.(item => item.signerId === signer._id);
    if (hasViewed && hasViewed?.viewedAt) {
      return (
        <Tooltip title={moment(hasViewed.viewedAt).format('DD/MM/YYYY hh:mm A')}>
          <Chip
            size="small"
            label="Viewed"
            color="info"
            sx={{ width: 'fit-content' }}
            icon={<RemoveRedEye fontSize="small" />}
          />
        </Tooltip>
      );
    }

    return (
      <Chip
        size="small"
        label="Sent"
        color="secondary"
        sx={{ width: 'fit-content' }}
        icon={<Send fontSize="small" />}
      />
    );
  };

  if (loading) {
    return (
      <div
        style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}
      >
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}
      >
        <Typography color="error">Error: {error}</Typography>
      </div>
    );
  }

  return (
    <Paper sx={{ width: '100%', mb: 2, mt: 5 }}>
      <Box
        sx={{
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="h6">In-progress Documents</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            label="Search Documents"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              ),
            }}
            sx={{ minWidth: 200 }}
          />
        </Box>
      </Box>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#483594' }}>
              <TableCell sx={{ color: '#fff' }}>
                <strong>Title</strong>
              </TableCell>
              <TableCell sx={{ color: '#fff' }}>
                <strong>Note</strong>
              </TableCell>
              <TableCell sx={{ color: '#fff' }}>
                <strong>Owner</strong>
              </TableCell>
              <TableCell sx={{ color: '#fff' }}>
                <strong>Signers</strong>
              </TableCell>
              <TableCell sx={{ color: '#fff' }}>
                <strong>Actions</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredDocuments.length > 0 ? (
              filteredDocuments.map((document) => (
                <TableRow key={document._id}>
                  <TableCell>{document.Name || 'Untitled Document'}</TableCell>
                  <TableCell>{document.Note || 'No note'}</TableCell>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Avatar sx={{ bgcolor: 'green' }}>
                        {document.CreatedBy?.name ? document.CreatedBy.name.charAt(0).toUpperCase() : 'U'}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {document.CreatedBy?.name || 'Unknown User'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {document.CreatedBy?.email || 'No email'}
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    {document.Signers && document.Signers.length > 0 ? (
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 0.5,
                        }}
                      >
                        {document.Signers.map((signer, index) => {
                          return (
                            <Box
                              key={index}
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                mb: 0.5,
                              }}
                            >
                              {getSignerStatusChip(signer, document)}
                              <Typography variant="body2">
                                {signer.Email || 'No email'}
                              </Typography>
                            </Box>
                          );
                        })}
                      </Box>
                    ) : (
                      <Typography variant="body2">No signers</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Share Document">
                      <IconButton
                        onClick={() => handleOpenShareModal(document)}
                        title="Share"
                      >
                        <ShareIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="View Document">
                      <IconButton
                        onClick={() => navigate(getDocumentViewRedirectionURL(document))}
                        title="View Document"
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <Typography>No in-progress documents found</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={totalCount}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

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
            p: 4,
            borderRadius: '8px',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2,
            }}
          >
            <Typography id="share-link-modal-title" variant="h6" component="h2">
              Copy link
            </Typography>
            <IconButton onClick={handleCloseShareModal}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Box id="share-link-modal-description">
            {selectedDocumentSigners?.Signers?.length > 0 ? (
              <Grid container spacing={2}>
                {selectedDocumentSigners?.Signers?.map((signer, index) => {
                  const objectId = signer.objectId;
                  const hostUrl = window.location.origin;
                  const sendMail = false;
                  //encode this url value `${pdfDetails?.[0].objectId}/${signerMail[i].Email}/${objectId}` to base64 using `btoa` function
                  const encodeBase64 = btoa(
                    `${selectedDocumentSigners?.objectId}/${signer.Email}/${objectId}/${sendMail}`
                  );
                  let signPdf = `${hostUrl}/digital-signature/login/${encodeBase64}`;
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
                          variant="outlined"
                          startIcon={<ShareIcon />}
                          sx={{
                            mr: 1,
                            borderRadius: '20px',
                            borderColor: '#483594',
                            color: '#483594',
                          }}
                          onClick={() => handleShareLink(signPdf)}
                        >
                          Share
                        </Button>
                        <Button
                          variant="contained"
                          startIcon={<ContentCopyIcon />}
                          sx={{
                            borderRadius: '20px',
                            backgroundColor: '#483594',
                          }}
                          onClick={() => handleCopyLink(signPdf)}
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
    </Paper>
  );
};

export default InProgressDocumentsTable;

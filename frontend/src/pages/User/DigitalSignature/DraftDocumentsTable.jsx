import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  TablePagination,
  TextField,
  Box,
  CircularProgress,
  Avatar,
  Modal,
  Button,
  Tooltip,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import CloseIcon from '@mui/icons-material/Close';
import SignersModal from './SignersModal';
import { getBearerToken } from '../constant/Utils';
import { useNavigate } from 'react-router-dom';
import { getDocumentViewRedirectionURL } from '@/utils/digitalSignature';
import NoDocumentFound from './components/NoDocumentFound';

const DraftDocumentsTable = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const navigate = useNavigate();

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');

  // Signers Modal state
  const [openSignersModal, setOpenSignersModal] = useState(false);
  const [currentDocumentDetails, setCurrentDocumentDetails] = useState([]);

  // Delete Confirmation Modal state
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState(null);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const userInfo = JSON.parse(localStorage.getItem('UserInformation'));
      const userId = userInfo?.user;

      console.log('Fetching documents with params:', {
        userid: userId,
        skip: page * rowsPerPage,
        limit: rowsPerPage,
      });

      const response = await axios.post(
        // 'https://quickcash.oyefin.com/api/v1/digital-signature/documents/get-report?statusFilter=draft',
        'http://localhost:5000/api/v1/digital-signature/documents/get-report?statusFilter=draft',
        {
          userid: userId,
          skip: page * rowsPerPage,
          limit: rowsPerPage,
        },
        {
          headers: {
            Authorization: getBearerToken(),
          },
        }
      );

      console.log('API Response:', response.data);

      if (!response.data || !response.data.success || !response.data.data) {
        console.error('Unexpected API response structure:', response.data);
        throw new Error('Invalid response format from API');
      }

      const documents = response.data.data.documents || [];
      const total = response.data.data.total || 0;

      setDocuments(documents);
      setTotalCount(total);
      setError(null);
    } catch (err) {
      console.error('Error details:', err);
      setError(err.message);
      if (
        err.message.includes('Token has been expired') ||
        err.message.includes('Missing Token')
      ) {
        localStorage.clear();
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [page, rowsPerPage]); 

  const handleOpenSignersModal = (document) => {
    setCurrentDocumentDetails(document);
    setOpenSignersModal(true);
  };

  const handleCloseSignersModal = () => {
    setOpenSignersModal(false);
    setCurrentDocumentDetails({});
  };

  const handleCloseDeleteModal = () => {
    setOpenDeleteModal(false);
    setDocumentToDelete(null);
  };

  const handleConfirmDelete = async () => {
    try {
      const token = getBearerToken();
      const documentId = documentToDelete?._id;
      if (!documentId) {
        console.error("Document ID is missing for deletion.");
        return;
      }

      await axios.delete(`http://localhost:5000/api/v1/digital-signature/documents/${documentId}`, {
        headers: {
          Authorization: token,
        },
      });

      console.log('Document deleted successfully!', documentToDelete.Name);
      fetchDocuments();
    } catch (err) {
      console.error('Error deleting document:', err);
      setError(err.message);
    } finally {
      handleCloseDeleteModal();
    }
  };

  // Filter documents based on search term
  const filteredDocuments = documents.filter((document) => {
    const matchesSearch = document.Name.toLowerCase().includes(
      searchTerm.toLowerCase()
    );
    return matchesSearch;
  });

  // Handle pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to first page when changing rows per page
  };

  // Handle search
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0); // Reset to first page when searching
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

  if (!filteredDocuments || filteredDocuments.length === 0) {
    console.log('Current documents state:', documents);
    console.log('Filtered documents:', filteredDocuments);
    return (
      <NoDocumentFound />
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
        <Typography variant="h6">Draft documents</Typography>
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
            {filteredDocuments.map((document) => (
              <TableRow key={document._id}>
                <TableCell>{document.Name}</TableCell>
                <TableCell>{document.Note}</TableCell>
                <TableCell>
                  {document.CreatedBy ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar
                        sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}
                      >
                        {document.CreatedBy.name
                          ? document.CreatedBy.name.charAt(0).toUpperCase()
                          : 'U'}
                      </Avatar>
                      <Box>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 'medium' }}
                        >
                          {document.CreatedBy.name || 'Unknown'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {document.CreatedBy.email || ''}
                        </Typography>
                      </Box>
                    </Box>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell>
                  {document.Signers && document.Signers.length > 0 ? (
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handleOpenSignersModal(document);
                      }}
                      style={{ textDecoration: 'none', color: '#483594' }}
                    >
                      View
                    </a>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell>
                  <Tooltip title="View Document" arrow placement="top">
                    <IconButton
                      onClick={() => navigate(getDocumentViewRedirectionURL(document))}
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete Document" arrow placement="top">
                    <IconButton
                      onClick={() => {
                        setDocumentToDelete(document);
                        setOpenDeleteModal(true);
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
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

      <SignersModal
        open={openSignersModal}
        handleClose={handleCloseSignersModal}
        documentDetails={currentDocumentDetails}
      />

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
          borderRadius:'8px',
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
    </Paper>
  );
};

export default DraftDocumentsTable;

import React, { useEffect, useState } from 'react';
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
  InputLabel
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';

const DocumentsTable = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  
  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('UserInformation'));
        const userId = userInfo?._id;
        const token = localStorage.getItem('token');
        
        if (!userId) {
          setError('User ID not found');
          return;
        }

        if (!token) {
          setError('Authentication token not found');
          return;
        }

        const response = await axios.get(
          `http://localhost:5000/api/v1/digital-signature/documents/list/${userId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.data && Array.isArray(response.data)) {
          setDocuments(response.data);
        } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
          setDocuments(response.data.data);
        } else {
          setError('Invalid data format received from server');
          setDocuments([]);
        }
      } catch (error) {
        console.error('Error fetching documents:', error);
        if (error.response?.status === 403) {
          setError('Token expired or invalid');
        } else {
          setError('Failed to fetch documents');
        }
        setDocuments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  // Filter documents based on search term and status
  const filteredDocuments = documents.filter((document) => {
    const matchesSearch = document.Name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'completed' && document.IsCompleted) ||
      (statusFilter === 'pending' && !document.IsCompleted);
    return matchesSearch && matchesStatus;
  });

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

  // Handle status filter
  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
    setPage(0);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
        <Typography color="error">{error}</Typography>
      </div>
    );
  }

  if (!documents || documents.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
        <Typography>No documents found</Typography>
      </div>
    );
  }

  return (
    <Paper sx={{ width: '100%', mb: 2, mt: 5 }}>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">
          Documents Lists
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            label="Search Documents"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
            sx={{ minWidth: 200 }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={handleStatusFilterChange}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#483594' }}>
              <TableCell sx={{ color: '#fff' }}><strong>Document Name</strong></TableCell>
              <TableCell sx={{ color: '#fff' }}><strong>Note</strong></TableCell>
              <TableCell sx={{ color: '#fff' }}><strong>Created By</strong></TableCell>
              <TableCell sx={{ color: '#fff' }}><strong>Status</strong></TableCell>
              <TableCell sx={{ color: '#fff' }}><strong>Created At</strong></TableCell>
              <TableCell sx={{ color: '#fff' }}><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredDocuments
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((document) => (
                <TableRow key={document._id}>
                  <TableCell>{document.Name}</TableCell>
                  <TableCell>{document.Note}</TableCell>
                  <TableCell>{document.CreatedBy?.name}</TableCell>
                  <TableCell>
                    <Chip 
                      label={document.IsCompleted ? "Completed" : "Pending"} 
                      color={document.IsCompleted ? "success" : "warning"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(document.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <IconButton 
                      onClick={() => window.open(document.URL, '_blank')}
                      title="View Document"
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredDocuments.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
};

export default DocumentsTable; 
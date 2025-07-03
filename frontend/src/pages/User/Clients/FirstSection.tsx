import { Filter } from 'lucide-react';
import api from '@/helpers/apiHelper';
import { jwtDecode } from 'jwt-decode';
import { JwtPayload } from '@/types/jwt';
import ViewClientModal from './ViewClientModal';
import EditIcon from '@mui/icons-material/Edit';
import React, { useEffect, useState } from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import CommonFilter from '@/components/CustomFilter';
import CustomButton from '@/components/CustomButton';
import CustomModal from '../../../components/CustomModal';
import CustomFormModal from '@/components/CustomFormModal';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Box, Button, Typography, useTheme } from '@mui/material';
import GenericTable from '../../../components/common/genericTable';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const url = import.meta.env.VITE_NODE_ENV == 'production' ? 'api' : 'api';

const FirstSection = () => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [selectedClient, setSelectedClient] = useState('');
  const [rowToDelete, setRowToDelete] = useState<any>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentData, setCurrentData] = React.useState<any>([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any | null>(null);

  useEffect(() => {
    // current user id
    const accountId = jwtDecode<JwtPayload>(
      localStorage.getItem('token') as string
    );
    getClientsList(accountId.data.id);
  }, []);

  const getClientsList = async (id: string) => {
    try {
      const result = await api.get(`/${url}/v1/client/list/${id}`);
      if (result.data.status === 201) {
        setCurrentData(result.data.data);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const handleFilter = () => {
    setShowFilter((prev) => !prev);
  };

  const handleGlobalSearch = (text: string) => {
    setFilterText(text);

    if (text.trim() === '') {
      setCurrentData(currentData);
      return;
    }

    const lower = text.toLowerCase();

    const filtered = currentData.filter((row) =>
      Object.values(row).some((val) =>
        String(val).toLowerCase().includes(lower)
      )
    );

    setCurrentData(filtered.length ? filtered : []);
    console.log('Filtering by:', text, '→ Found:', filtered.length, 'items');
  };

  const handleSubmit = async (formValues: any) => {
    try {
      const accountId = jwtDecode<JwtPayload>(localStorage.getItem('token') as string);
      const clientId = selectedRow?._id;
      // Prepare form data for multipart/form-data
      const formData = new FormData();
      formData.append('user', accountId?.data?.id);
      formData.append('firstName', formValues.firstName || '');
      formData.append('lastName', formValues.lastName || '');
      formData.append('email', formValues.email || '');
      formData.append('mobile', formValues.mobile || '');
      formData.append('postalCode', formValues.postalCode || '');
      formData.append('country', formValues.country || '');
      formData.append('city', formValues.city || '');
      formData.append('state', formValues.state || '');
      formData.append('address', formValues.address || '');
      formData.append('notes', formValues.notes || '');
      if (formValues.profilePhoto && formValues.profilePhoto.raw) {
        formData.append('profilePhoto', formValues.profilePhoto.raw);
      }

      const result = await api.patch(
        `/${url}/v1/client/update/${clientId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (result.data.status == "201") {
        toast.success("Client data has been updated successfully");
        setEditModalOpen(false);
        const accountId = jwtDecode<JwtPayload>(localStorage.getItem('token') as string);
        getClientsList(accountId?.data?.id);
      }
    } catch (error: any) {
      console.log("error", error);
      toast.error(error?.response?.data?.message || 'Error updating client');
    }
  };

  const handleEdit = (row: any) => {
    setSelectedRow(row);
    setEditModalOpen(true);
  };

  const editFields = [
    { name: 'firstName', label: 'First Name', type: 'text', required: true },
    { name: 'lastName', label: 'Last Name', type: 'text' ,required: true},
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'mobile', label: 'Mobile', type: 'text',required: true },
    { name: 'country', label: 'Country', type: 'text',required: true },
  ];

  const handleDelete = (row: any) => {
    setRowToDelete(row);
    setDeleteModalOpen(true);
    console.log('Trying to delete:', row);
  };

  const handleOpen = (row: any) => {
    setSelectedRow(row);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedRow(null);
  };

  const handleDeleteClient = async () => {
    try {
      const clientId = rowToDelete?._id;
      const result = await api.delete(
        `/${url}/v1/client/delete/${clientId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      if (result.data.status == "201") {
        toast.success("Selected Client has been deleted Successfully");
        setDeleteModalOpen(false);
        const accountId = jwtDecode<JwtPayload>(localStorage.getItem('token') as string);
        getClientsList(accountId.data.id);
      }
    } catch (error: any) {
      console.log("error", error);
      toast.error(error?.response?.data?.message || 'Error deleting client');
    }
  };

  const columns = [
    {
      field: 'createdAt',
      headerName: 'Created Date',
    },
    {
      field: 'clientName',
      headerName: 'Client Name',
      render: (row: any) =>
        `${row.firstName || ''} ${row.lastName || ''}`.trim(),
    },
    {
      field: 'email',
      headerName: 'Email',
    },
    {
      field: 'mobile',
      headerName: 'Mobile',
    },
    {
      field: 'country',
      headerName: 'Country',
    },
    {
      field: 'action',
      headerName: 'Actions',
      render: (row: any) => (
        <Box display="flex" gap={1}>
          <VisibilityIcon
            sx={{ cursor: 'pointer', color: 'blue' }}
            onClick={() => handleOpen(row)}
          />
          <EditIcon
            sx={{ cursor: 'pointer', color: 'green' }} // optional color
            onClick={() => handleEdit(row)}
          />
          <DeleteIcon
            sx={{ cursor: 'pointer', color: '#FF0000' }} // optional color
            onClick={() => handleDelete(row)}
          />
        </Box>
      ),
    },
  ];

  function setViewModalOpen(arg0: boolean): void {
    throw new Error('Function not implemented.');
  }

  return (
    <Box className="clients-table-section" sx={{ backgroundColor: theme.palette.background.default, color: theme.palette.text.primary, }} >
      {/* Action Buttons */}
      <Box
        sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center', }}
      >
        <Button startIcon={<Filter size={20} />} onClick={handleFilter}sx={{ color: theme.palette.navbar.text }} >
          {' '}
          Filter{' '}
        </Button>
      </Box>
      {showFilter && (
        <CommonFilter label="Search any field"  value={filterText} onChange={handleGlobalSearch} width="200px" />
      )}
      {currentData.length ? (
        <GenericTable columns={columns} data={currentData} />
      ) : (
        <Typography variant="body1" sx={{ mt: 2 }}>
          No data found.
        </Typography>
      )}

      {/* view Modal */}
      <CustomModal open={open} onClose={handleClose} title="Client Details" sx={{ backgroundColor: theme.palette.background.default }} >

        <div className="header-divider" />
        {selectedRow && (
          <>
            <Box display="flex" justifyContent="space-between" mb={2} mt={4}>
              <Typography>
                <strong>Created Date:</strong>
              </Typography>
              <Typography>{selectedRow.createdAt}</Typography>
            </Box>

            <Box display="flex" justifyContent="space-between" mb={2}>
              <Typography>
                <strong>Client Name:</strong>
              </Typography>
              <Typography>
                {selectedRow.firstName} {selectedRow.lastName}
              </Typography>
            </Box>

            <Box display="flex" justifyContent="space-between" mb={2}>
              <Typography>
                <strong>Email:</strong>
              </Typography>
              <Typography>{selectedRow.email}</Typography>
            </Box>

            <Box display="flex" justifyContent="space-between" mb={2}>
              <Typography>
                <strong>Mobile:</strong>
              </Typography>
              <Typography>{selectedRow.mobile}</Typography>
            </Box>

            <Box display="flex" justifyContent="space-between" mb={2}>
              <Typography>
                <strong>Country:</strong>
              </Typography>
              <Typography>{selectedRow.country}</Typography>
            </Box>

             <Box display="flex" justifyContent="flex-end" gap={2} mt={3}>
            <CustomButton onClick={handleClose}>
              <span className="button-text">Close</span>
            </CustomButton>
            </Box>
          </>
        )}
      </CustomModal>

      <ViewClientModal client={selectedClient} onClose={() => setViewModalOpen(false)} />

      {/* Edit Modal */}
      <CustomFormModal open={editModalOpen} title="Edit Client" onClose={() => setEditModalOpen(false)} onSubmit={handleSubmit} initialValues={selectedRow} fields={editFields}/>

      {/* Delete Modal */}
      <CustomModal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Confirm Delete" sx={{backgroundColor:theme.palette.background.default}} >
        <Typography>
          Are you sure you want to delete this client's data?
        </Typography>

        <Box display="flex" justifyContent="flex-end" gap={2} mt={3}>
          {/* <Button variant="outlined" onClick={() => setDeleteModalOpen(false)}>
            Cancel
          </Button> */}
          <Button variant="contained" color="error" onClick={handleDeleteClient} >
            Yes, Delete
          </Button>
        </Box>
      </CustomModal>
    </Box>
  );
};

export default FirstSection;

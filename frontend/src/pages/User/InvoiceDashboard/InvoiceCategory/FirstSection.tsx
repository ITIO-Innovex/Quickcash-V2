import api from '@/helpers/apiHelper';
import { Filter } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';
import { JwtPayload } from '@/types/jwt';
import { useEffect, useState } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import CustomModal from '@/components/CustomModal';
import DeleteIcon from '@mui/icons-material/Delete';
import CommonFilter from '@/components/CustomFilter';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Box, Button, Typography, useTheme} from '@mui/material';
import GenericTable from '../../../../components/common/genericTable';
import CustomFormModal from '@/components/CustomFormModal';
import CustomButton from '@/components/CustomButton';

const FirstSection = () => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [selectedClient, setSelectedClient] = useState('');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState<any>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any | null>(null);
  const url = import.meta.env.VITE_NODE_ENV == "production" ? 'api' : 'api';
  const [currentData, setCurrentData] = useState([]);

  const handleFilter = () => {
    setShowFilter((prev) => !prev);
  };

    useEffect(() => {
   // current user id
   const accountId = jwtDecode<JwtPayload>(localStorage.getItem('token') as string);
   getCategories(accountId.data.id);
  },[]);
    const getCategories = async(id:any) => {
      try {
        const result = await api.get(`/${url}/v1/category/list/${id}`);
        if (result.data.status === 201) {
          console.log(result.data.data);
          setCurrentData(result.data.data);
        }else{
          setCurrentData([]);
          console.error("Failed to fetch wallet address requests:", result.data.message);
        }
      }catch (error) {
        console.error("Error fetching wallet address requests:", error);
      }
  }

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

  const handleActionClick = (row: any) => {
    setSelectedRow(row);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedRow(null);
  };

  const handleEdit = (row: any) => {
  const initialValues = {
    ...row,
    product: row.productDetails?.length?.toString() || '0', // 👈 convert to string for input
  };
  setSelectedRow(initialValues);
  setEditModalOpen(true);
};

  const handleDelete = (row: any) => {
    setRowToDelete(row);
    setDeleteModalOpen(true);
    console.log('Trying to delete:', row);
  };

  const handleSubmit = async (formValues: any) => {
    try {
      const categoryId = selectedRow?._id;

      const result = await api.put(
        `/${url}/v1/category/list/${categoryId}`,
        formValues
      );

      if (result.data.status === 200) {
        console.log('Category updated successfully');
        setEditModalOpen(false);

        const accountId = jwtDecode<JwtPayload>(
          localStorage.getItem('token') as string
        );
        getCategories (accountId.data.id);
      }
    } catch (error) {
      console.error('Error updating client:', error);
    }
  };

  const columns = [
    { field: 'createdAt', headerName: 'Created Date' },
    { field: 'name', headerName: 'Category' },
    { 
      field: 'product', 
      headerName: 'Product',
      render: (row: any) => (
      <span>{row.productDetails?.length || 0}</span>
    ),
     },
    {
      field: 'action',
      headerName: 'Actions',
      render: (row: any) => (
        <Box display="flex" gap={1}>
          <VisibilityIcon
            sx={{ cursor: 'pointer', color: 'blue' }}
            onClick={() => handleActionClick(row)}
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

  const editFields = [
    { name: 'createdAt', label: 'Created Date', type: 'text', required: true },
    { name: 'name', label: 'Category', type: 'text',required:true },
    { name: 'product', label: 'Product', type: 'number', required: true },
  ];

  return (
    <Box>
      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center', }}>
        <Button startIcon={<Filter size={20} />} onClick={handleFilter} sx={{ color: theme.palette.navbar.text }} >
          {' '}
          Filter{' '}
        </Button>
      </Box>

      {showFilter && (
        <CommonFilter label="Search any field" value={filterText} onChange={handleGlobalSearch} width="200px" />
      )}
      {currentData.length ? (
        <GenericTable columns={columns} data={currentData} />
      ) : (
        <Typography variant="body1" sx={{ mt: 2 }}>
          No data found.
        </Typography>
      )}

      {/* View Modal */}
      <CustomModal open={open} onClose={handleClose} title="Category Details" sx={{ backgroundColor: theme.palette.background.default }}>
        <div className="header-divider" />

        <Box sx={{ mt: 2 }}>
          <Box display="flex" justifyContent="space-between" mb={2}>
            <Typography>
              <strong>Date:</strong>
            </Typography>
            <Typography>{selectedRow?.createdAt}</Typography>
          </Box>

          <Box display="flex" justifyContent="space-between" mb={2}>
            <Typography>
              <strong>Category:</strong>
            </Typography>
            <Typography>{selectedRow?.name}</Typography>
          </Box>

          <Box display="flex" justifyContent="space-between" mb={2}>
            <Typography>
              <strong>Product:</strong>
            </Typography>
            <Typography>{selectedRow?.productDetails?.length}</Typography>
          </Box>
         
             <Box display="flex" justifyContent="flex-end" gap={2} mt={3}>
            <CustomButton onClick={handleClose}>
              <span className="button-text">Close</span>
            </CustomButton>
            </Box>
        </Box>
      </CustomModal>

      {/* Edit modal */}
       <CustomFormModal open={editModalOpen} title="Edit Client" onClose={() => setEditModalOpen(false)} onSubmit={handleSubmit} initialValues={selectedRow} fields={editFields}/>

      {/* Delete Modal */}
      <CustomModal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Confirm Delete" sx={{backgroundColor:theme.palette.background.default}} >
        <Typography>
          Are you sure you want to delete this category?
        </Typography>

        <Box display="flex" justifyContent="flex-end" gap={2} mt={3}>
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              console.log('Deleted row:', rowToDelete); 
              setDeleteModalOpen(false);
            }}
          >
            Yes, Delete
          </Button>
        </Box>
      </CustomModal>
    </Box>
  );
};

export default FirstSection;

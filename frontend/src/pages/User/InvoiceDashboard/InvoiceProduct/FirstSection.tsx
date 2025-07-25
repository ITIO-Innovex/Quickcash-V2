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
import GenericTable from '../../../../components/common/genericTable';
import { Box, Button, Typography, useTheme, TextField } from '@mui/material';
import CustomFormModal from '@/components/CustomFormModal';
import axios from 'axios';
import { useAppToast } from '@/utils/toast';
import moment from 'moment';

const FirstSection = ({ refresh }: { refresh: boolean }) => {
  const theme = useTheme();
  const toast = useAppToast();
  const [open, setOpen] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [currentData, setCurrentData] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [categoriesList, setCategoriesList] = useState([]);
  const [rowToDelete, setRowToDelete] = useState<any>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any | null>(null);
  const url = import.meta.env.VITE_NODE_ENV == 'production' ? 'api' : 'api';

  const handleFilter = () => {
    setShowFilter((prev) => !prev);
  };

  useEffect(() => {
    // current user id
    const accountId = jwtDecode<JwtPayload>(
      localStorage.getItem('token') as string
    );
    getProduct(accountId.data.id);
    getProductList();
  }, [refresh]);

  const getProduct = async (id: any) => {
    try {
      const result = await api.get(`/${url}/v1/product/list/${id}`);
      if (result.data.status === 201) {
        console.log(result.data.data);
        setCurrentData(result.data.data);
      } else {
        setCurrentData([]);
        console.error(
          'Failed to fetch wallet address requests:',
          result.data.message
        );
      }
    } catch (error) {
      console.error('Error fetching wallet address requests:', error);
    }
  };

  const getProductList = async () => {
    try {
      const accountId = jwtDecode<JwtPayload>(
        localStorage.getItem('token') as string
      );
      const result = await api.get(
        `/${url}/v1/category/list/${accountId?.data?.id}`
      );
      if (result.data.status === 201) {
        setCategoriesList(result?.data?.data);
      } else {
        console.error('Failed to fetch category list:', result.data.message);
      }
    } catch (error) {
      console.error('Error fetching category list:', error);
    }
  };

  const handleActionClick = (row: any) => {
    setSelectedRow(row);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedRow(null);
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

  const columns = [
    {
      field: 'createdAt',
      headerName: 'Created Date',
      minWidth: 180,
      render: (row: any) => {
        if (!row.createdAt) return '';
        const date = new Date(row.createdAt);
        return date.toLocaleDateString('en-GB');
      },
    },
    { field: 'name', headerName: 'Product Name' },
    {
      field: 'category',
      headerName: 'Category',
      render: (row: any) => {
        const category = categoriesList.find((cat) => cat._id === row.category);
        return <span>{category?.name || 'Unknown'}</span>;
      },
    },
    { field: 'unitPrice', headerName: 'Price' },
    {
      field: 'status',
      headerName: 'Status',
      render: (row: any) => (
        <span
          className={`status-chip ${row.status == true ? 'active' : 'inactive'}`}
        >
          {row.status == true ? 'Active' : 'Inactive'}
        </span>
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

  const handleDelete = (row: any) => {
    setRowToDelete(row);
    setDeleteModalOpen(true);
    console.log('Trying to delete:', row);
  };

  const handleEdit = (row: any) => {
    const initialValues = {
      ...row,
      product: row.productDetails?.length?.toString() || '0',
      category: row.category,
    };

    setSelectedRow(initialValues);
    setEditModalOpen(true);
  };

  const editFields = [
    { name: 'createdAt', label: 'Created Date', type: 'text', required: true },
    { name: 'name', label: 'Product Name', type: 'text', required: true },
    {
      name: 'productCode',
      label: 'Product Code',
      type: 'text',
      required: true,
    },
    {
      name: 'category',
      label: 'Category',
      type: 'select',
      required: true,
      options: categoriesList.map((cat) => ({
        label: cat.name,
        value: cat._id,
      })),
    },
    { name: 'unitPrice', label: 'Price', type: 'text', required: true },
    {
      name: 'description',
      label: 'Description',
      type: 'text',
      required: false,
    },
    { name: 'status', label: 'Status', type: 'text', required: true },
  ];

  const handleSubmit = async (formValues: any) => {
    try {
      const accountId = jwtDecode<JwtPayload>(
        localStorage.getItem('token') as string
      );
      const editFlag = selectedRow?._id;
      await axios
        .patch(
          `/${url}/v1/product/update/${editFlag}`,
          {
            user_id: accountId?.data?.id,
            name: formValues.name,
            productCode: formValues.productCode,
            category: formValues.category,
            unitPrice: formValues.unitPrice,
            description: formValues.description,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        )
        .then((result) => {
          if (result.data.status == 201) {
            toast.success('Product data has been updated successfully');
            setEditModalOpen(false);
            setSelectedRow(null);
            const accountId = jwtDecode<JwtPayload>(
              localStorage.getItem('token') as string
            );
            getProduct(accountId.data.id);
            console.log('Product updated successfully:', result.data);
          }
        })
        .catch((error) => {
          console.log('error', error);
          toast.error(
            error.response?.data?.message || 'Error updating product'
          );
        });
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Error updating product');
    }
  };

  const HandleDeleteProduct = async (val: any) => {
    try {
      await axios.delete(`/${url}/v1/product/delete/${val}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const accountId = jwtDecode<JwtPayload>(
        localStorage.getItem('token') as string
      );
      toast.success('Selected Product has been deleted Successfully');
      setDeleteModalOpen(false);
      getProduct(accountId.data.id);
    } catch (error: any) {
      console.log('error', error);
      toast.error(error?.response?.data?.message || 'Error deleting product');
    }
  };

  return (
    <Box>
      {/* Action Buttons */}
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          mb: 3,
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <Button
          startIcon={<Filter size={20} />}
          onClick={handleFilter}
          sx={{ color: theme.palette.navbar.text }}
        >
          {' '}
          Filter{' '}
        </Button>
      </Box>

      {showFilter && (
        <CommonFilter
          label="Search any field"
          value={filterText}
          onChange={handleGlobalSearch}
          width="200px"
        />
      )}

      {currentData.length ? (
        <GenericTable columns={columns} data={currentData} />
      ) : (
        <Typography variant="body1" sx={{ mt: 2 }}>
          No data found.
        </Typography>
      )}

      {/* View Modal */}
      <CustomModal
        open={open}
        onClose={handleClose}
        title="Product Details"
        sx={{ backgroundColor: theme.palette.background.default }}
      >
        <div className="header-divider" />

        <Box sx={{ mt: 2 }}>
          <Box display="flex" justifyContent="space-between" mb={2}>
            <Typography>
              <strong>Date:</strong>
            </Typography>
            <Typography>{selectedRow?.createdAt.slice(0, 10)}</Typography>
          </Box>

          <Box display="flex" justifyContent="space-between" mb={2}>
            <Typography>
              <strong>Product Code:</strong>
            </Typography>
            <Typography>{selectedRow?.productCode}</Typography>
          </Box>

          <Box display="flex" justifyContent="space-between" mb={2}>
            <Typography>
              <strong>Product Name:</strong>
            </Typography>
            <Typography>{selectedRow?.name}</Typography>
          </Box>

          <Box display="flex" justifyContent="space-between" mb={2}>
            <Typography>
              <strong>Unit Price:</strong>
            </Typography>
            <Typography>{selectedRow?.unitPrice}</Typography>
          </Box>

          <Box display="flex" justifyContent="space-between" mb={2}>
            <Typography>
              <strong>Description:</strong>
            </Typography>
            <Typography>{selectedRow?.description}</Typography>
          </Box>

          <Box display="flex" justifyContent="space-between" mb={2}>
            <Typography>
              <strong>Status:</strong>
            </Typography>
            <Typography>
              {selectedRow?.status ? 'Active' : 'Inactive'}
            </Typography>
          </Box>


          <Button
            className="custom-button"
            onClick={handleClose}
            sx={{ mt: 3 }}
          >
            <span className="button-text">Close</span>
          </Button>
        </Box>
      </CustomModal>

      {/* Edit Modal */}
      <CustomFormModal
        open={editModalOpen}
        title="Edit Product"
        onClose={() => setEditModalOpen(false)}
        onSubmit={handleSubmit}
        initialValues={selectedRow}
        fields={editFields}
      />

      {/* Delete Modal */}
      <CustomModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirm Delete"
        sx={{ backgroundColor: theme.palette.background.default }}
      >
        <Typography>
          Are you sure you want to delete this client's data?
        </Typography>

        <Box display="flex" justifyContent="flex-end" gap={2} mt={3}>
          <Button
            variant="contained"
            color="error"
            onClick={() => rowToDelete && HandleDeleteProduct(rowToDelete._id)}
          >
            Yes, Delete
          </Button>
        </Box>
      </CustomModal>
    </Box>
  );
};

export default FirstSection;

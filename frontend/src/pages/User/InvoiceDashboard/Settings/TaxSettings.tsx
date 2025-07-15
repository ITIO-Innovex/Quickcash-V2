
import {jwtDecode} from 'jwt-decode';
import api from '@/helpers/apiHelper';
import { useState, useEffect } from 'react';
import { useAppToast } from '@/utils/toast';
import { useNavigate } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CustomButton from '@/components/CustomButton';
import { Box, Typography, Switch } from '@mui/material';
import GenericTable from '@/components/common/genericTable';
const url = import.meta.env.VITE_NODE_ENV == "production" ? 'api' : 'api';

const TaxSettings = () => {
  const navigate = useNavigate();
  const toast = useAppToast();
  const [taxData, setTaxData] = useState<any[]>([]);
  // Helper to create row data for table
  const createData = (id: string, date: string, name: string, value: string, isDefault: string) => ({
    id,
    date,
    name,
    value,
    default: (
      (typeof isDefault === 'string' && isDefault.toLowerCase() === 'yes') ||
      (typeof isDefault === 'boolean' && isDefault === true)
    ) ? 'Yes' : 'No',
  });

  // Delete tax API handler
  const HandleDeleteTax = async (val: any) => {
    const r = window.confirm("Are you sure? You want to delete the Tax details.");
    if (r === true) {
      try {
        const token = localStorage.getItem('token');
        const decoded: any = jwtDecode(token as string);
        const accountId = decoded?.data?.id;

        const result = await api.delete(`/${url}/v1/tax/delete/${val}`);
        console.log('Delete API result:', result);
        if (result.data.status == 201) {
          toast.success("Selected tax details has been deleted Successfully");
          // Refresh tax list
          fetchTaxList();
        } else {
          toast.error(result.data.message || 'Delete failed');
        }
      } catch (error: any) {
        console.log("error", error);
        toast.error(error?.response?.data?.message );
      }
    } else {
      return false;
    }
  };
  // Fetch tax list from API
  const fetchTaxList = async () => {
    try {
      const token = localStorage.getItem('token');
      const decoded: any = jwtDecode(token as string);
      const userId = decoded?.data?.id;
      const result = await api.get(`/${url}/v1/tax/list/${userId}`);

      if (result.data.status == 201 || result.data.status == 201) {
        const list = result.data.data;
        const rows = list.map((item: any) =>
          createData(item._id, item.createdAt, item.Name, item.taxvalue, item.IsDefault)
        ).sort((a: any, b: any) => (a.date < b.date ? -1 : 1));
        setTaxData(rows);
      }
    } catch (error: any) {
      console.log("error", error);
    }
  };

  useEffect(() => {
    fetchTaxList();
  }, []);

  const handleAddTax = () => {
    navigate('/settings/add-tax');
  };

  // Update tax default status handler
  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>, row: any) => {
    const url = import.meta.env.VITE_NODE_ENV == "production" ? 'api' : 'api';
    const token = localStorage.getItem('token');
    const decoded: any = jwtDecode(token as string);
    try {
      const result = await api.patch(`/${url}/v1/tax/update/${row.id}`, {
        user: decoded?.data?.id,
        isDefault: event.target.checked ? "yes" : "no"
      });
      if (result.data.status == 201 ) {
        toast.success(result.data.message);
        fetchTaxList();
      } else {
        toast.error(result.data.message || 'Update failed');
      }
    } catch (error: any) {
      console.log("error", error);
      toast.error(error?.response?.data?.message || 'Error');
    }
  };

  const columns = [
    { field: 'date', headerName: 'Date' },
    { field: 'name', headerName: 'Name' },
    { field: 'value', headerName: 'Value' },
    {
      field: 'default',
      headerName: 'Default',
      render: (row: any) => (
        <Switch
          checked={row.default === 'Yes'}
          onChange={(event) => handleChange(event, row)}
          color={row.default === 'Yes' ? 'success' : 'default'}
        />
      ),
    },
    {
      field: 'action',
      headerName: 'Actions',
      render: (row: any) => (
        <Box display="flex" gap={1}>
          <EditIcon sx={{ cursor: 'pointer', color: 'green' }} onClick={() => navigate(`/settings/edit-tax/${row.id}`)} />
          <DeleteIcon sx={{ cursor: 'pointer', color: '#FF0000' }} onClick={() => HandleDeleteTax(row.id)} />
        </Box>
      ),
    },
  ];

  return (
    <Box className="tax-settings-container">
      <Box className="tax-settings-header">
        <Typography variant="h6">Tax Settings</Typography>
        <CustomButton onClick={handleAddTax}>Add Tax</CustomButton>
      </Box>

      <GenericTable columns={columns} data={taxData} />
    </Box>
  );
};

export default TaxSettings;

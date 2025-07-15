import api from '@/helpers/apiHelper';
import { jwtDecode } from 'jwt-decode';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Box, Typography, Switch } from '@mui/material';
import CustomButton from '@/components/CustomButton';
import GenericTable from '@/components/common/genericTable';
import { useAppToast } from '@/utils/toast';
const url = import.meta.env.VITE_NODE_ENV == "production" ? 'api' : 'api';

const PaymentQrSettings = () => {
  const navigate = useNavigate();
  const toast = useAppToast();

  const [qrList, setQrList] = useState<any[]>([]);

  // Helper to create row data for table
  const createData = (id: string, date: string, title: string, image: string, isDefault: string) => ({
    id,
    date,
    title,
    image,
    default: (typeof isDefault === 'string' && isDefault.toLowerCase() === 'yes') ? 'Yes' : 'No',
  });

  // Fetch QR code list from API
  const fetchQrList = async () => {
    try {
      const token = localStorage.getItem('token');
      const decoded: any = jwtDecode(token as string);
      const userId = decoded?.data?.id;
      const result = await api.get(`/${url}/v1/qrcode/list/${userId}`);
      if (result.data.status == 201 ) {
        const list = result.data.data;
        const rows = list.map((item: any) =>
          createData(item._id, item.createdAt, item.title, item.qrCodeImage, item.IsDefault)
        ).sort((a: any, b: any) => (a.date < b.date ? -1 : 1));
        setQrList(rows);
      }
    } catch (error: any) {
      console.log("error", error);
    }
  };

  useEffect(() => {
    fetchQrList();
  }, []);
  // Update QR default status handler
  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>, row: any) => {
    try {
      const token = localStorage.getItem('token');
      const decoded: any = jwtDecode(token as string);
      const result = await api.patch(`/${url}/v1/qrcode/update/${row.id}`, {
        user: decoded?.data?.id,
        isDefault: event.target.checked ? "yes" : "no"
      });
      if (result.data.status == 201 ) {
        toast.success(result.data.message );
        fetchQrList();
      } else {
        toast.error(result.data.message );
      }
    } catch (error: any) {
      console.log("error", error);
      toast.error(error?.response?.data?.message );
    }
  };

  // Delete QR code handler
  const HandleDeleteQr = async (val: any) => {
    const r = window.confirm("Are you sure? You want to delete these Details.");
    if (r === true) {
      try {
        const token = localStorage.getItem('token');
        const result = await api.delete(`/${url}/v1/qrcode/delete/${val}`);
        if (result.data.status == 201 || result.data.status == "201") {
          toast.success("Selected Payment QR Code details has been deleted Successfully");
          fetchQrList();
        } else {
          toast.error(result.data.message || 'Delete failed');
        }
      } catch (error: any) {
        console.log("error", error);
        toast.error(error?.response?.data?.message || 'Error');
      }
    } else {
      return false;
    }
  };

  const columns = [
    { field: 'date', headerName: 'Date' },
    { field: 'title', headerName: 'Title' },
    {
      field: 'image',
      headerName: 'Image',
      render: (row: any) => (
        row?.image && row?.image !== '' ? (
          <img
            crossOrigin="anonymous"
            src={`${import.meta.env.VITE_PUBLIC_URL}/qrcode/${row?.image}`}
            width="60"
            height="60"
            alt={`paymentqrcode${row?.title}`}
            style={{ objectFit: 'contain', borderRadius: 4 }}
          />
        ) : (
          <Typography>QR is not available</Typography>
        )
      ),
    },
   {
      field: 'default',
      headerName: 'Default',
      render: (row: any) => (
        <Switch
          checked={row.default === 'Yes'}
          onChange={(event) => handleChange(event, row)}
          color={row.default === 'Yes' ? 'success' : 'default'}
          value={row.id}
        />
      ),
    },
    {
      field: 'action',
      headerName: 'Actions',
      render: (row: any) => (
        <Box display="flex" gap={1}>
          <EditIcon sx={{ cursor: 'pointer', color: 'green' }} onClick={() => navigate(`/settings/edit-qr-code/${row.id}`)} />
          <DeleteIcon sx={{ cursor: 'pointer', color: '#FF0000' }} onClick={() => HandleDeleteQr(row.id)} />
        </Box>
      ),
    },
  ];

  const handleAddQr = () => {
    navigate('/settings/add-qr-code');
  };

  return (
    <Box className="tax-settings-container">
       <Box className="tax-settings-header">
          <Typography variant="h6">Payment QR Code List</Typography>
          <CustomButton onClick={handleAddQr} >Add Qr code</CustomButton>
        </Box>

      <GenericTable columns={columns} data={qrList} />
    </Box>
  );
};

export default PaymentQrSettings;

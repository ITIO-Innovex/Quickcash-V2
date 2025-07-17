import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import axios from 'axios';
import CustomModal from '@/components/CustomModal';
import VisibilityIcon from '@mui/icons-material/Visibility';
import GenericTable from '../../../components/common/genericTable';
import { Box, Button, Typography, useTheme, TextField, Select, MenuItem } from '@mui/material';
import CustomButton from '@/components/CustomButton';
import moment from 'moment';
import admin from '@/helpers/adminApiHelper';
const url = import.meta.env.VITE_NODE_ENV == "production" ? 'api' : 'api';

const FirstSection = forwardRef((props, ref) => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [list, setList] = useState<any[]>([]);
  const [fname, setFname] = useState('');
  const [lname, setLname] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [status, setStatus] = useState('true');
  const [autoResetTime, setAutoResetTime] = useState('');

  // Fetch subadmin list

  useImperativeHandle(ref, () => ({
    getListData,
  }));
  const getListData = async () => {
    try {
      const result = await admin.get(`/${url}/v1/admin/adminsList`);
      if (result.data.status == "201" || result.data.status == 201) {
        setList(result.data.data);
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  useEffect(() => {
    getListData();
  }, []);

  // Add or update subadmin
  const handleSubmit = async () => {
    if (editId) {
      // Update
      try {
        const result = await admin.patch(`/${url}/v1/admin/update-profile`, {
          user_id: editId,
          fname,
          lname,
          email,
          mobile,
          autoResetTime,
          status,
        });
        if (result.data.status == 201) {
          getListData();
          setOpen(false);
          setEditId(null);
        }
      } catch (error: any) {
        alert(error?.response?.data?.message || 'Update failed');
      }
    } else {
      // Create
      try {
        const result = await admin.post(`/${url}/v1/admin/register`, {
          fname,
          lname,
          email,
          mobile,
          autoResetTime,
          status: true,
          password: Math.random().toString(36).slice(2, 7),
        });
        if (result.data.status == 201) {
          getListData();
          setOpen(false);
        }
      } catch (error: any) {
        alert(error?.response?.data?.message || 'Create failed');
      }
    }
  };

  // Open modal for add/edit
  const handleOpen = (row?: any) => {
    if (row) {
      setEditId(row._id);
      setFname(row.fname);
      setLname(row.lname);
      setEmail(row.email);
      setMobile(row.mobile);
      setStatus(row.status ? 'true' : 'false');
      setAutoResetTime(row.autoresettime || '');
    } else {
      setEditId(null);
      setFname('');
      setLname('');
      setEmail('');
      setMobile('');
      setStatus('true');
      setAutoResetTime('');
    }
    setOpen(true);
  };

  // View details
  const handleActionClick = (row: any) => {
    setSelectedRow(row);
    setOpen(true);
  };

  // Close modal
  const handleClose = () => {
    setOpen(false);
    setSelectedRow(null);
    setEditId(null);
    setFname('');
    setLname('');
    setEmail('');
    setMobile('');
    setStatus('true');
    setAutoResetTime('');
  };

  // Table columns
  const columns = [
    { field: 'date', headerName: 'Date', render: (row: any) => moment(row.createdAt).format('YYYY-MM-DD') },
    { field: 'username', headerName: 'Username', render: (row: any) => row.fname },
    { field: 'email', headerName: 'Email', render: (row: any) => row.email },
    { field: 'mobile', headerName: 'Mobile', render: (row: any) => row.mobile },
    { field: 'autoresetpassword', headerName: 'Password Expire Date', render: (row: any) => row.autoresettime },
    {
      field: 'status',
      headerName: 'Status',
      render: (row: any) => {
        const isActive = !!row.status;
        const label = isActive ? 'Active' : 'Inactive';
        const statusClass = isActive ? 'success' : 'inactive'; // You can define styles for .success and .inactive

        return (
          <span className={`status-chip ${statusClass}`}>
            {label}
          </span>
        );
      }
    },

    {
      field: 'action',
      headerName: 'Actions',
      render: (row: any) => (
        <VisibilityIcon style={{ cursor: 'pointer' }} onClick={() => handleOpen(row)}>
          Edit
        </VisibilityIcon>
      ),
    },
  ];

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 2,
        mb: 3,
        flexWrap: 'wrap',
        alignItems: 'center',
      }}
    >
      {/* Use only the user's original button to open the modal */}
      {/* <CustomButton onClick={() => handleOpen()} sx={{ mb: 2 }}>
        Add Subadmin
      </CustomButton> */}
      <GenericTable columns={columns} data={list} />

      <CustomModal
        open={open}
        onClose={handleClose}
        title={editId ? 'Edit Subadmin' : 'Add Subadmin'}
        sx={{ backgroundColor: theme.palette.background.default }}
      >
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="First Name"
            value={fname}
            onChange={(e) => setFname(e.target.value)}
            fullWidth
          />
          <TextField
            label="Last Name"
            value={lname}
            onChange={(e) => setLname(e.target.value)}
            fullWidth
          />
          <TextField
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
          />
          <TextField
            label="Mobile"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            fullWidth
          />
          <TextField
            label="Auto Reset-Password Date"
            type="date"
            value={autoResetTime}
            onChange={(e) => setAutoResetTime(e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            fullWidth
          >
            <MenuItem value={"true"}>Active</MenuItem>
            <MenuItem value={"false"}>Inactive</MenuItem>
          </Select>
          <Box display="flex" justifyContent="flex-end" gap={2}>
            <CustomButton onClick={handleClose}>Cancel</CustomButton>
            <CustomButton onClick={handleSubmit}>{editId ? 'Update' : 'Create'}</CustomButton>
          </Box>
        </Box>
      </CustomModal>
    </Box>
  );
});

export default FirstSection;

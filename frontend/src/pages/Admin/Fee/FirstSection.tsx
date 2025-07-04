import { useEffect, useState } from 'react';
import CustomModal from '@/components/CustomModal';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import GenericTable from '../../../components/common/genericTable';
import { Box, Typography, useTheme, TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions, Select, MenuItem, OutlinedInput } from '@mui/material';
import CustomButton from '@/components/CustomButton';
import CustomInput from '@/components/CustomInputField';
import admin from '@/helpers/adminApiHelper';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useAppToast } from '@/utils/toast'; 
const url = import.meta.env.VITE_NODE_ENV == "production" ? 'api' : 'api';
 interface JwtPayload {
    sub: string;
    role: string;
    iat: number;
    exp: number;
    data: {
      defaultcurr: string;
      email: string;
      id: string;
      name: string;
      type: string;
    };
  }  

const FirstSection = () => {
  const theme = useTheme();
  const toast = useAppToast(); 
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editRow, setEditRow] = useState<any | null>(null);
  const [selectedRow, setSelectedRow] = useState<any | null>(null);
  const [list, setList] = useState<any>();

  // Edit modal fields
  const [type, setType] = useState('');
  const [commissionType, setCType] = useState('');
  const [taxRate, setValue] = useState('');
  const [minimumValue, setMinimumValue] = useState('');

  const getListData = async () => {
    await admin.get(`/${url}/v1/admin/feetype/list`)
      .then(result => {
        if (result.data.status == 201) {
          setList(result.data.data);
        }
      })
      .catch(error => {
        console.log("error", error);
      })
  }
  useEffect(() => {
    getListData();
  }, [])

  const handleActionClick = (row: any) => {
    setSelectedRow(row);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedRow(null);
  };
  const handleEdit = (row: any) => {
    setEditRow(row);
    setEditOpen(true);
    getDataById(row.feedetails?.[0]?._id);
  };

  // Fetch previous values for editing
  const getDataById = async (val: any) => {
    if (val !== 'undefined') {
      await admin.get(`/${url}/v1/admin/fee/fees/${val}`
        )
        .then(result => {
          if (result.data.status == 201) {
            setType(result.data.data.type || '');
            setCType((result.data.data.commissionType || '').toLowerCase());
            // console.log('Commission Type set to:', (result.data.data.commissionType || '').toLowerCase());  
            setValue(result.data.data.value || '');
            setMinimumValue(result.data.data.minimumValue || '');
            setEditOpen(true);
          }
        })
        .catch(error => {
          console.log("error", error);
        })
    }
  };

  // Save edited values
 const handleSave = async () => {
    const accountId = jwtDecode<JwtPayload>(localStorage.getItem('admin') as string);
    await admin.post(`/${url}/v1/admin/fee/add`,{
      user:accountId?.data?.id,
      type,
      commissionType,
      value: taxRate,
      minimumValue: commissionType == "fixed" ? 0 : minimumValue
    },
   )
    .then(result => {
      if(result.data.status == 201) {
        toast.success(result.data.message);
        getListData();
        setEditOpen(false);
      }
    })
   .catch(error => {
     console.log("error", error);
     toast.error(error.response.data.message);
    }) 
  }
  // Reset edit modal state on close
  const handleEditClose = () => {
    setEditOpen(false);
    setEditRow(null);
    setType('');
    setCType('');
    setValue('');
    setMinimumValue('');
  };

  const columns = [
    {
      field: 'createdAt',
      headerName: 'Modified Date',
      render: (row: any) => row.createdAt ? row.createdAt.slice(0, 10) : '',
    },
    {
      field: 'title',
      headerName: 'Name'
    },
    {
      field: 'feedetails?.commissionType',
      headerName: 'Type',
      render: (row: any) => row.feedetails?.[0]?.commissionType || 'N/A',
    },
    {
      field: 'feedetails?.value',
      headerName: 'Tax Rate',
      render: (row: any) => row.feedetails?.[0]?.value || 'N/A',
    },
    {
      field: 'action',
      headerName: 'Action',
      render: (row: any) => (
        <Box display="flex" gap={1}>
          <VisibilityIcon sx={{ cursor: 'pointer', color: 'blue' }} onClick={() => handleActionClick(row)} />
          
          <EditIcon sx={{ cursor: 'pointer', color: 'green' }} onClick={() => handleEdit(row)} />
        </Box>
      ),
    },
  ];

  // console.log('Commission Type in render:', commissionType);
  return (
    <Box>
      {list ? (
        <GenericTable columns={columns} data={list} />
      ) : (
        <Typography variant="body1" sx={{ mt: 2 }}>
          No data found.
        </Typography>
      )}
      <CustomModal open={open} onClose={handleClose} title="Fee Details" sx={{ backgroundColor: theme.palette.background.default }}>
        <div className="header-divider" />

        <Box sx={{ mt: 2 }}>
          <Box display="flex" justifyContent="space-between" mb={2}>
            <Typography><strong>Modified Date:</strong></Typography>
            <Typography>{selectedRow?.createdAt.slice(0, 10)}</Typography>
          </Box>

          <Box display="flex" justifyContent="space-between" mb={2}>
            <Typography><strong>Name:</strong></Typography>
            <Typography>{selectedRow?.title}</Typography>
          </Box>

          <Box display="flex" justifyContent="space-between" mb={2}>
            <Typography><strong>Tax-Rate:</strong></Typography>
            <Typography>{selectedRow?.feedetails?.[0]?.value}</Typography>
          </Box>

          <Box display="flex" justifyContent="space-between" mb={2}>
            <Typography><strong>Type:</strong></Typography>
            <Typography>{selectedRow?.feedetails?.[0]?.commissionType}</Typography>
          </Box>
          <Box display="flex" justifyContent="flex-end" gap={2}>
            <CustomButton onClick={handleClose}>Close</CustomButton>
          </Box>
        </Box>
      </CustomModal>

      {/* Edit Modal */}
      <CustomModal open={editOpen} onClose={handleEditClose} title="Add Fee Structure Details" sx={{ backgroundColor: theme.palette.background.default }}>
        <div className="header-divider" />
        <Box sx={{ mt: 2 }}>
          <label className={`${theme ? 'avatarDarkSecondaryExtra' : 'avatarLight'}`}>Fee Type</label>
          <Select value={editRow?.title || ''} fullWidth style={{marginBottom: '10px',border: `${theme ? '1px solid white': ''}`}}>
            {editRow?.title && <MenuItem value={editRow.title}>{editRow.title}</MenuItem>}
          </Select>
          <label className={`${theme ? 'avatarDarkSecondaryExtra' : 'avatarLight'}`}>Commission Type</label>
          <Select
            value={commissionType}
            onChange={(e) => setCType(e.target.value)}
            fullWidth
            sx={{
              color: theme.palette.text.primary,
              backgroundColor: theme.palette.background.paper,
              mb: 1,
              border: theme.palette.mode === 'dark' ? '1px solid white' : undefined
            }}
          >
            <MenuItem value="fixed">Fixed</MenuItem>
            <MenuItem value="percentage">Percentage</MenuItem>
          </Select>
          <label className={`${theme ? 'avatarDarkSecondaryExtra' : 'avatarLight'}`}>Tax Rate</label>
          <OutlinedInput
            id="outlined-adornment-weight"
            aria-describedby="outlined-weight-helper-text"
            inputProps={{
              'aria-label': 'weight'
            }}
            fullWidth
            value={taxRate}
            type='number'
            sx={{ border: `${theme ? '1px solid white': ''}` }}
            onChange={(e) => setValue(e.target.value)}
          />
          {commissionType === "percentage" && (
            <>
              <label className={`${theme ? 'avatarDarkSecondaryExtra' : 'avatarLight'}`}>Minimum Value</label>
              <OutlinedInput
                id="outlined-adornment-weight"
                aria-describedby="outlined-weight-helper-text"
                inputProps={{
                  'aria-label': 'weight'
                }}
                fullWidth
                value={minimumValue}
                type='number'
                sx={{ border: `${theme ? '1px solid white': ''}` }}
                onChange={(e) => setMinimumValue(e.target.value)}
              />
            </>
          )}
          <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
            <CustomButton onClick={handleSave} sx={{ mt: 2 }}>
              Save
            </CustomButton>
            <Button className="custom-button" onClick={handleEditClose}>Close</Button>
          </Box>
        </Box>
      </CustomModal>
    </Box>
  );
};

export default FirstSection;

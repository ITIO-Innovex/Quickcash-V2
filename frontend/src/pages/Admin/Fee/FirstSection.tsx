
import { useEffect, useState } from 'react';
import CustomModal from '@/components/CustomModal';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import GenericTable from '../../../components/common/genericTable';
import { Box, Typography, useTheme, TextField, Button } from '@mui/material';
import CustomButton from '@/components/CustomButton';
import CustomInput from '@/components/CustomInputField';
import admin from '@/helpers/adminApiHelper';
const url = import.meta.env.VITE_NODE_ENV == "production" ? 'api' : 'api';

const FirstSection = () => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editRow, setEditRow] = useState<any | null>(null);
  const [selectedRow, setSelectedRow] = useState<any | null>(null);
  const [list, setList] = useState<any>();

  const [formData, setFormData] = useState({
  type: editRow?.type || '',
  commissionType: 'Fixed',
  taxRate: editRow?.taxRate || '',
});

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
      <CustomModal open={editOpen} onClose={() => setEditOpen(false)} title="Add Fee Structure Details" sx={{ backgroundColor: theme.palette.background.default }}
 >
        <div className="header-divider" />
        <Box sx={{ mt: 2 }}>
          <Box mb={2}>
            <CustomInput label="Fee Type" value={formData.type}  onChange={(e) => setFormData({ ...formData, type: e.target.value })} fullWidth margin="normal" />
          </Box>
          <Box mb={2}>
            <CustomInput label="Commission Type"  value={formData.commissionType} onChange={(e) => setFormData({ ...formData, commissionType: e.target.value })} fullWidth margin="normal" />
          </Box>
          <Box mb={2}>
            <CustomInput label="Tax Rate" value={formData.taxRate} onChange={(e) => setFormData({ ...formData, taxRate: e.target.value })} fullWidth margin="normal" />
          </Box>
          <Box display="flex" justifyContent="flex-end" gap={2}>
            <CustomButton onClick={() => {
                /* handle save logic here */
              }}
              sx={{ mt: 2 }}
            >
              save
            </CustomButton>
            <Button  className="custom-button" onClick={() => setEditOpen(false)} > Close </Button>
          </Box>
        </Box>
      </CustomModal>
    </Box>
  );
};

export default FirstSection;

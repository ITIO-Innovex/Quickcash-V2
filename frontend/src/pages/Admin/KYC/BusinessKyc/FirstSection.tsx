import { useState, useEffect } from 'react';
import CustomInput from '@/components/CustomInputField';
import NoImage from '../../../../../public/no-image.png';
import { Box, Typography, useTheme, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CustomModal from '../../../../components/CustomModal';
import GenericTable from '../../../../components/common/genericTable';
import CustomButton from '@/components/CustomButton';
import admin from '@/helpers/adminApiHelper';

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'verified', label: 'Verified' },
  { value: 'reject', label: 'Rejected' },
];

const FirstSection = () => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any | null>(null);
  const [currentData, setCurrentData] = useState<any[]>([]);
  const [statusUpdate, setStatusUpdate] = useState('');
  const [updating, setUpdating] = useState(false);

  const handleOpen = (row: any) => {
    setSelectedRow(row);
    setStatusUpdate(row.status || 'pending');
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedRow(null);
    setStatusUpdate('');
  };

  const fetchKycList = async () => {
    try {
      const result = await admin.get('/api/v1/admin/business/list');
      if (result.status === 200) {
        const apiData = result.data.data;
        const mappedRows = apiData.map((item: any) => ({
          id: item._id,
          date: item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A',
          username: item.name || 'N/A',
          email: item.email || 'N/A',
          status: item.status || 'N/A',
          frontImage: item.kycDocuments?.[0]?.path || null,
          backImage: item.kycDocuments?.[1]?.path || null,
        }));
        setCurrentData(mappedRows);
      }
    } catch (error) {
      console.log('error', error);
    }
  };

  useEffect(() => {
    fetchKycList();
  }, []);

  const handleStatusChange = (event: any) => {
    setStatusUpdate(event.target.value);
  };

  const handleUpdateStatus = async () => {
    if (!selectedRow) return;
    setUpdating(true);
    try {
      await admin.put(`/api/v1/admin/business/status/${selectedRow.id}`, { status: statusUpdate });
      await fetchKycList();
      handleClose();
    } catch (error) {
      console.log('Status update error', error);
    } finally {
      setUpdating(false);
    }
  };

  const columns = [
    { field: 'date', headerName: 'Date' },
    { field: 'username', headerName: 'UserName' },
    { field: 'email', headerName: 'Email' },
    {
      field: 'status',
      headerName: 'Status',
      render: (row: any) => (
        <span className={`status-chip ${row.status.toLowerCase()}`}>
          {row.status}
        </span>
      )
    },
    {
      field: 'action',
      headerName: 'Action',
      render: (row: any) => (
        <VisibilityIcon
          sx={{ cursor: 'pointer' }} 
          onClick={() => handleOpen(row)}
        />
      )
    }
  ];

  return (
    <Box>
      <GenericTable columns={columns} data={currentData} />
      {/* Modal */}
      <CustomModal
        open={open}
        onClose={handleClose}
        title=""
        sx={{ backgroundColor: theme.palette.background.default }}
      >
        {selectedRow && (
          <>
            <Typography className="section-title">Contact Details</Typography>
            <Box display="flex" justifyContent="space-between" mb={2} mt={4}>
              <Typography><strong>Contact NO:</strong></Typography>
              <Typography>1234</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" mb={2}>
              <Typography><strong>Secondary Phone:</strong></Typography>
              <Typography>1234</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" mb={2}>
              <Typography><strong>Email:</strong></Typography>
              <Typography>{selectedRow.email}</Typography>
            </Box>
            <Typography className="section-title">Document Details</Typography>
            <Box display="flex" justifyContent="space-between" mb={2} gap={2}>
              <CustomInput label="Type Of Document"/>
              <CustomInput label="Selected Document No"/>
            </Box>
            <Box display="flex" justifyContent="space-between" mb={2} gap={2}>
              <Box>
                <Typography>Uploaded Document Front</Typography>
                <div className="kyc-doc-image-preview">
                  {selectedRow.frontImage ? (
                    <img src={selectedRow.frontImage} alt="Document Front" />
                  ) : (
                    <div className="kyc-doc-image-placeholder">
                      <img src={NoImage} alt="No Document" className="no-image-logo" />
                    </div>
                  )}
                </div>
              </Box>
              <Box>
                <Typography>Uploaded Document Back</Typography>
                <div className="kyc-doc-image-preview">
                  {selectedRow.backImage ? (
                    <img src={selectedRow.backImage} alt="Document Back" />
                  ) : (
                    <div className="kyc-doc-image-placeholder">
                      <img src={NoImage} alt="No Document" className="no-image-logo" />
                    </div>
                  )}
                </div>
              </Box>
            </Box>
            <Typography className="section-title">Residential Address</Typography>
            <Box display="flex" justifyContent="space-between" mb={2} gap={2}>
              <CustomInput label="Type Of Document"/>
            </Box>
            <Typography>Uploaded Document</Typography>
            <div className="kyc-doc-image-preview">
              {selectedRow.backImage ? (
                <img src={selectedRow.backImage} alt="Document Back" />
              ) : (
                <div className="kyc-doc-image-placeholder">
                  <img src={NoImage} alt="No Document" className="no-image-logo" />
                </div>
              )}
            </div>
            {/* Status Update Section */}
            <Box display="flex" alignItems="center" gap={2} mt={2}>
              <FormControl size="small" fullWidth>
                <InputLabel id="status-update-label">Update Status</InputLabel>
                <Select
                  labelId="status-update-label"
                  value={statusUpdate}
                  label="Update Status"
                  onChange={handleStatusChange}
                  disabled={updating}
                >
                  {statusOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            
            </Box>
            <Box display="flex" justifyContent="flex-end" gap={2} >
            <CustomButton onClick={handleUpdateStatus} disabled={updating}>
                {updating ? 'Saving...' : 'Save'}
              </CustomButton>
              <CustomButton onClick={handleClose}>Close</CustomButton>
            </Box>
          </>
        )}
      </CustomModal>
    </Box>
  );
};

export default FirstSection;

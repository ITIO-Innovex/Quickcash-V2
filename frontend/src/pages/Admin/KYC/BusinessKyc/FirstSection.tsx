import { useState, useEffect } from 'react';
import CustomInput from '@/components/CustomInputField';
import NoImage from '../../../../../public/no-image.png';
import { Box, Typography, useTheme, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CustomModal from '../../../../components/CustomModal';
import GenericTable from '../../../../components/common/genericTable';
import CustomButton from '@/components/CustomButton';
import admin from '@/helpers/adminApiHelper';
import { getBusinessKycById } from '@/api/businessKyc.api';

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
  { value: 'declined', label: 'Declined' },
];

const FirstSection = () => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any | null>(null);
  const [currentData, setCurrentData] = useState<any[]>([]);
  const [statusUpdate, setStatusUpdate] = useState('');
  const [updating, setUpdating] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  const handleOpen = async (row: any) => {
    setModalLoading(true);
    setOpen(true);
    try {
      const token = localStorage.getItem('admin');
      const res = await getBusinessKycById(row.id, token);
      if (res.status === 200 && res.data.data) {
        setSelectedRow(res.data.data);
        setStatusUpdate(res.data.data.status || 'pending');
      }
    } catch (error) {
      // handle error, maybe show a toast
      setSelectedRow(null);
    } finally {
      setModalLoading(false);
    }
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
          frontImage: (`${import.meta.env.VITE_PUBLIC_URL || ''}/${item.kycDocuments?.[0]?.path || null}`),
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
      await admin.put(`/api/v1/admin/business/status/${selectedRow._id}`, { status: statusUpdate });
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
        {modalLoading ? (
          <Typography>Loading...</Typography>
        ) : selectedRow && (
          <>
            <Typography className="section-title">Business Details</Typography>
            <Box display="flex" justifyContent="space-between" mb={2} mt={4}>
              <Typography><strong>Business Name:</strong></Typography>
              <Typography>{selectedRow.businessDetails?.businessName || 'N/A'}</Typography>
            </Box>

            <Box display="flex" justifyContent="space-between" mb={2} mt={4}>
              <Typography><strong>Business Type:</strong></Typography>
              <Typography>{selectedRow.businessDetails?.businessType || 'N/A'}</Typography>
            </Box>

            <Box display="flex" justifyContent="space-between" mb={2} mt={4}>
              <Typography><strong>Registration Number:</strong></Typography>
              <Typography>{selectedRow.businessDetails?.registrationNumber || 'N/A'}</Typography>
            </Box>

            <Box display="flex" justifyContent="space-between" mb={2} mt={4}>
              <Typography><strong>Industry:</strong></Typography>
              <Typography>{selectedRow.businessDetails?.industry || 'N/A'}</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" mb={2} mt={4}>
              <Typography><strong>Incorporation Country:</strong></Typography>
              <Typography>{selectedRow.businessDetails?.incorporationCountry || 'N/A'}</Typography>
            </Box>

            <Box display="flex" justifyContent="space-between" mb={2} mt={4}>
              <Typography><strong>Website:</strong></Typography>
              <Typography>{selectedRow.businessDetails?.website || 'N/A'}</Typography>
            </Box>

            <Typography className="section-title">Address</Typography>
            <Box display="flex" justifyContent="space-between" mb={2} mt={4}>
              <Typography><strong>City:</strong></Typography>
              <Typography>{selectedRow.address?.city || 'N/A'}</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" mb={2} mt={4}>
              <Typography><strong>State:</strong></Typography>
              <Typography>{selectedRow.address?.state || 'N/A'}</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" mb={2} mt={4}>
              <Typography><strong>Postal Code:</strong></Typography>
              <Typography>{selectedRow.address?.postalCode || 'N/A'}</Typography>
            </Box>

            <Box display="flex" justifyContent="space-between" mb={2} mt={4}>
              <Typography><strong>Country:</strong></Typography>
              <Typography>{selectedRow.address?.country || 'N/A'}</Typography>
            </Box>


            <Typography className="section-title">Bank Details</Typography>
            <Box display="flex" justifyContent="space-between" mb={2} mt={4}>
              <Typography><strong>Bank Name:</strong></Typography>
              <Typography>{selectedRow.bank?.bankName || 'N/A'}</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" mb={2} mt={4}>
              <Typography><strong>Account Number:</strong></Typography>
              <Typography>{selectedRow.bank?.accountNumber || 'N/A'}</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" mb={2} mt={4}>
              <Typography><strong>SWIFT/BIC:</strong></Typography>
              <Typography>{selectedRow.bank?.swiftBic || 'N/A'}</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" mb={2} mt={4}>
              <Typography><strong>Currency:</strong></Typography>
              <Typography> {selectedRow.bank?.currency || 'N/A'}</Typography>
            </Box>
            <Typography className="section-title">Contact Details</Typography>
            <Box display="flex" justifyContent="space-between" mb={2} mt={4}>
              <Typography><strong>Name:</strong></Typography>
              <Typography>{selectedRow.name || 'N/A'}</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" mb={2}>
              <Typography><strong>Email:</strong></Typography>
              <Typography>{selectedRow.email || 'N/A'}</Typography>
            </Box>
            <Typography className="section-title">Document Details</Typography>
            <Box display="flex" flexDirection="column" gap={2} mb={2}>
              {Array.isArray(selectedRow.kycDocuments) && selectedRow.kycDocuments.length > 0 ? (
                selectedRow.kycDocuments.map((doc: any, idx: number) => (
                  <Box key={doc._id || idx} display="flex" alignItems="center" gap={2}>
                    <Typography><strong>Type:</strong> {doc.docType || 'N/A'}</Typography>

                    <div className="kyc-doc-image-preview">
                      {doc.path ? (
                        <img src={`${import.meta.env.VITE_PUBLIC_URL || ''}/${doc.path}`} alt={doc.docType || 'Document'} style={{ maxWidth: 500, maxHeight: 500 }} />
                      ) : (
                        <div className="kyc-doc-image-placeholder">
                          <img src={NoImage} alt="No Document" className="no-image-logo" />
                        </div>
                      )}
                    </div>
                  </Box>
                ))
              ) : (
                <Typography>No documents uploaded.</Typography>
              )}
            </Box>
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

import { useEffect, useState } from 'react';
import admin from '@/helpers/adminApiHelper';
import CustomButton from '@/components/CustomButton';
import CustomInput from '@/components/CustomInputField';
import NoImage from '../../../../../public/no-image.png';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CustomModal from '../../../../components/CustomModal';
import { Box, Button, Typography, useTheme } from '@mui/material';
import GenericTable from '../../../../components/common/genericTable';
import { useNavigate } from 'react-router-dom';
import { useAppToast } from '@/utils/toast';
const url = import.meta.env.VITE_NODE_ENV == "production" ? 'api' : 'api';

const FirstSection = () => {
  const theme = useTheme();
  const toast = useAppToast();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any | null>(null);
  const [currentRequestStatus, setCurrentRequestStatus] = useState(selectedRow?.status || '');
  const [comment, setComment] = useState('');
  const [list, setList] = useState<any>();

  const handleOpen = (row: any) => {
    setSelectedRow(row);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedRow(null);
  };


  const getListData = async (status: any) => {
  const stsUpdated = status === "all" ? '' : status;

  try {
    const response = await admin.get(`/${url}/v1/kyc/list?status=${stsUpdated}`);
    console.log("🔁 API Response for KYC List ➜", response);

    if (
      response?.data?.status === "201" ||
      response?.data?.status === 201 ||
      response?.data?.status === "success"
    ) {
      console.log("✅ KYC Data List:", response.data.data);
      setList(response.data.data);
    } else {
      console.warn("⚠️ KYC list fetch returned unexpected status:", response.data.status);
    }

  } catch (error) {
    console.error("❌ Error while fetching KYC list:", error);
  }
};

  useEffect(() => {
    getListData(status);
  }, [status]);
  const [currentData, setCurrentData] = useState(list);

 const HandleUpdateStatus = async (id: string, status: string) => {
  await admin.patch(`/${url}/v1/kyc/updateStatus/${id}`, {
    comment: comment,
    status: status,
  }, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('admintoken')}`
    }
  })
  .then(result => {
    if (result.data.status == 201) {
      toast.success(result.data.message);
      navigate('/admin/user-kyc-details');
    }
  })
  .catch(error => {
    console.log("error", error);
    toast.error(error.response?.data?.message || "Something went wrong");
  });
};

const handleCloseWithUpdate = async () => {
  if (selectedRow?._id) {
    await HandleUpdateStatus(selectedRow._id, currentRequestStatus);
  }
  setOpen(false);
  setSelectedRow(null);
};

  const columns = [
    {
      field: 'createdAt',
      headerName: 'Date',
      render: (row: any) => row.createdAt ? row.createdAt.slice(0, 10) : '',
    },
    {
      field: 'userDetails?.name',
      headerName: 'Type',
      render: (row: any) => row.userDetails?.[0]?.name || 'N/A',
    },
    {
      field: 'userDetails?.email',
      headerName: 'Type',
      render: (row: any) => row.userDetails?.[0]?.email || 'N/A',
    },
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
      {list ? (
        <GenericTable columns={columns} data={list} />
      ) : (
        <Typography variant="body1" sx={{ mt: 2 }}>
          No data found.
        </Typography>
      )}
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
              <Typography><strong>UserName:</strong></Typography>
              <Typography>{selectedRow.userDetails?.[0]?.name}</Typography>
            </Box>

            <Box display="flex" justifyContent="space-between" mb={2}>
              <Typography><strong>Email:</strong></Typography>
              <Typography>{selectedRow.userDetails?.[0]?.email}</Typography>
            </Box>

            <Box display="flex" justifyContent="space-between" mb={2}> 
              <Typography><strong>Contact NO:</strong></Typography>
              <Typography>+{selectedRow.primaryPhoneNumber}</Typography>
            </Box>

            <Box display="flex" justifyContent="space-between" mb={2}>
              <Typography><strong>Secondary Phone:</strong></Typography>
              <Typography>+{selectedRow.secondaryPhoneNumber}</Typography>
            </Box>

             <Box display="flex" justifyContent="space-between" mb={2}>
            <Typography><strong>Date:</strong></Typography>
              <Typography>{selectedRow.createdAt.slice(0, 10)}</Typography></Box>

             <Typography className="section-title">Document Details</Typography>
              <Box display="flex" justifyContent="space-between" mb={2} gap={2}>
              <CustomInput 
                label="Type Of Document"
                value={selectedRow.documentType || 'N/A'} 
                disabled 
              />
              <CustomInput 
                label="Selected Document No" 
                value={selectedRow.documentNumber || 'N/A'} 
                disabled 
              />
            </Box>
          <Box display="flex" justifyContent="space-between" mb={2} gap={2}>
                <Box>
                  <Typography>Uploaded Document Front</Typography>
                  <div className="kyc-doc-image-preview">
                    {selectedRow.documentPhotoFront ? (
                      <img
                       src={`${import.meta.env.VITE_PUBLIC_URL}/kyc/${selectedRow.documentPhotoFront}`}
                        alt="Document Front"
                      />
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
                    {selectedRow.documentPhotoBack ? (
                      <img
                        src={`http://localhost:5000/kyc/${selectedRow.documentPhotoBack}`}
                        alt="Document Back"
                      />
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
              <CustomInput
                label="Type Of Document"
                value={selectedRow?.addressDocumentType || 'N/A'}
                disabled
              />
            </Box>

            <Typography>Uploaded Document</Typography>

            <div className="kyc-doc-image-preview">
              {selectedRow?.addressProofPhoto ? (
                <img
                  src={`http://localhost:5000/kyc/${selectedRow.addressProofPhoto}`}
                  alt="Address Document"
                />
              ) : (
                <div className="kyc-doc-image-placeholder">
                  <img src={NoImage} alt="No Document" className="no-image-logo" />
                </div>
              )}
            </div>

            <Box mt={3}>
            <Typography className="input-label">KYC Status</Typography>
            <select
              className="kyc-status-dropdown"
              value={currentRequestStatus}
              onChange={async (e) => {
                const newStatus = e.target.value;
                setCurrentRequestStatus(newStatus);

                // ✅ Use selectedRow._id instead of selectedRow.id
                if (selectedRow?._id) {
                  await HandleUpdateStatus(selectedRow._id, newStatus);
                }
              }}
            >
              {/* 👇 Show current status at top but hidden from the rest */}
              {selectedRow?.status && (
                <option value={selectedRow.status} hidden>
                  {selectedRow.status}
                </option>
              )}

              {/* 👇 Only show other statuses to switch to */}
              {['Pending', 'Completed', 'Decline']
                .filter((status) => status !== selectedRow?.status)
                .map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
            </select>
          </Box>

          <Box mt={3}>
          <Typography className="input-label">Admin Comment</Typography>
          <textarea
            className="kyc-comment-box"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            placeholder="Write your reason or note here..."
          />
        </Box>

             <Box display="flex" justifyContent="flex-end" gap={2} >
              <CustomButton sx={{}}>Download</CustomButton>
           <CustomButton onClick={handleCloseWithUpdate}>Close</CustomButton>

            </Box>
          </>
        )}
      </CustomModal>
    </Box>
  );
};

export default FirstSection;

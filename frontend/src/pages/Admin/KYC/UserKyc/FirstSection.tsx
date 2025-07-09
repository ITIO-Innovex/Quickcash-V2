import { useEffect, useState } from 'react';
import admin from '@/helpers/adminApiHelper';
import CustomButton from '@/components/CustomButton';
import CustomInput from '@/components/CustomInputField';
import NoImage from '../../../../../public/no-image.png';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CustomModal from '../../../../components/CustomModal';
import { Box, Button, Typography, useTheme } from '@mui/material';
import GenericTable from '../../../../components/common/genericTable';
const url = import.meta.env.VITE_NODE_ENV == "production" ? 'api' : 'api';

const FirstSection = () => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any | null>(null);
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
    const stsUpdated = status == "all" ? '' : status;
    await admin.get(`/${url}/v1/kyc/list?status=${stsUpdated}`)
      .then(result => {
        if (result.data.status == "201") {
          setList(result.data.data);
        }
      })
      .catch(error => {
        console.log("error", error);
      })
  }

  useEffect(() => {
    getListData(status);
  }, [status]);
  const [currentData, setCurrentData] = useState(list);

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
              <Typography><strong>Contact NO:</strong></Typography>
              <Typography>{selectedRow.primaryPhoneNumber}</Typography>
            </Box>

            <Box display="flex" justifyContent="space-between" mb={2}>
              <Typography><strong>Secondary Phone:</strong></Typography>
              <Typography>{selectedRow.secondaryPhoneNumber}</Typography>
            </Box>

             <Box display="flex" justifyContent="space-between" mb={2}>
            <Typography><strong>Date:</strong></Typography>
              <Typography>{selectedRow.createdAt.slice(0, 10)}</Typography></Box>

            <Box display="flex" justifyContent="space-between" mb={2}>
              <Typography><strong>userName:</strong></Typography>
              <Typography>{selectedRow.userDetails?.[0]?.name}</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" mb={2}>
              <Typography><strong>Email:</strong></Typography>
              <Typography>{selectedRow.userDetails?.[0]?.email}</Typography>
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
             <Box display="flex" justifyContent="flex-end" gap={2} >
              <CustomButton sx={{}}>Download</CustomButton>
            <CustomButton onClick={handleClose}>Close</CustomButton>
            </Box>
          </>
        )}
      </CustomModal>
    </Box>
  );
};

export default FirstSection;

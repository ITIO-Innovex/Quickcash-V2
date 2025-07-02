import { useState } from 'react';
import CustomInput from '@/components/CustomInputField';
import NoImage from '../../../../../public/no-image.png';
import { Box, Typography, useTheme } from '@mui/material'; 
import VisibilityIcon from '@mui/icons-material/Visibility';
import CustomModal from '../../../../components/CustomModal';
import GenericTable from '../../../../components/common/genericTable';
import CustomButton from '@/components/CustomButton';

const FirstSection = () => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any | null>(null);

  const handleOpen = (row: any) => {
    setSelectedRow(row);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedRow(null);
  };

  const UserKycData = [
  {
    date: '2025-06-02',
    username: 'rodel sayson',
    email: 'rodelsayson25@gmail.com',
    status: 'success',
  },
  {
    date: '2025-06-02',
    username: 'Adeoye aderemi idris',
    email: 'ben283117@gmail.com',
    status:'pending',
  },
  {
    date: '2025-06-02',
    username: 'Cheryl Estor',
    email: 'cherylestor19@gmail.com',
    status: 'failed',
  },
  {
    date: '2025-06-02',
    username: 'chinaza',
    email: 'chinazaamanda36@gmail.com',
    status: 'success',
  },
  {
    date: '2025-06-02',
    username: 'ISOOBA ABUBAKALI',
    email: 'laazpaaz074@gmail.com',
    status: 'pending',
  },
];

 const [currentData, setCurrentData] = useState(UserKycData);

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
     
      <GenericTable columns={columns} data={UserKycData} />

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

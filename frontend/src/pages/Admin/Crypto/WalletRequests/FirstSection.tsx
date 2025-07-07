import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import React, { useEffect, useState } from 'react';
import autoTable from 'jspdf-autotable';
import { FileSpreadsheet, FileText } from 'lucide-react';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CustomModal from '../../../../components/CustomModal';
import { Box, Button, Typography, useTheme } from '@mui/material'; 
import GenericTable from '../../../../components/common/genericTable';
import CustomButton from '@/components/CustomButton';
import admin from '@/helpers/adminApiHelper';
const url = import.meta.env.VITE_NODE_ENV == "production" ? 'api' : 'api';

const FirstSection = () => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any | null>(null);
  const [list,setList] = React.useState<any>();
  const [currentData, setCurrentData] = useState<any[]>([]);

  const handleOpen = (row: any) => {
    setSelectedRow(row);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedRow(null);
  };
 const getListData = async() => {
    await admin.get(`/${url}/v1/walletaddressrequest/listadmin`, )
    .then(result => {
      if(result.data.status == 201) {
        setList(result.data.data);
        setCurrentData(result.data.data);
      }
    })
    .catch(error => {
      console.log("error", error);
    })
  }
   useEffect(() => {
      getListData();
    }, [])
 

  const columns = [
    {
      field: 'createdAt',
      headerName: 'Date',
      render: (row: any) => row.createdAt ? row.createdAt.slice(0, 10) : '',
    },
    {
      field: 'userDetails?.name',
      headerName: 'Username',
      render: (row: any) => row.userDetails?.[0]?.name || 'N/A',
    },
    {
      field: 'userDetails?.email',
      headerName: 'Email',
      render: (row: any) => row.userDetails?.[0]?.email || 'N/A',
    },
   {
      field: 'coin',
      headerName: 'Coin',
      render: (row: any) => (
        <Box display="flex" alignItems="center" gap={1}>
          <img
            src={`https://assets.coincap.io/assets/icons/${ row?.coin?.split("_")[0].replace("_TEST","").toLowerCase()}@2x.png`}
            alt={row.coin}
            width={20}
            height={20}
            style={{ objectFit: 'contain' }}
            onError={(e) => (e.currentTarget.style.display = 'none')}
          />
          <span>{row?.coin?.replace("_TEST","")}</span>
        </Box>
      )
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
      
       {currentData ? (
        <GenericTable columns={columns} data={currentData} />
      ) : (
        <Typography variant="body1" sx={{ mt: 2 }}>
          No data found.
        </Typography>
      )}

      {/* Modal */}
      <CustomModal
        open={open}
        onClose={handleClose}
        title="Wallet Details"
        sx={{ backgroundColor: theme.palette.background.default }}
      >
        <div className="header-divusernameer" />
        {selectedRow && (
          <>
            <Box display="flex" justifyContent="space-between" mb={2} mt={4}>
              <Typography><strong>Date:</strong></Typography>
              <Typography>{selectedRow.createdAt.slice(0, 10)}</Typography>
            </Box>

            <Box display="flex" justifyContent="space-between" mb={2}>
              <Typography><strong>Username:</strong></Typography>
              <Typography>{selectedRow.userDetails?.[0]?.name}</Typography>
            </Box>
            
            <Box display="flex" justifyContent="space-between" mb={2}>
              <Typography><strong>Email:</strong></Typography>
              <Typography>{selectedRow.userDetails?.[0]?.email}</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" mb={2}>
              <Typography><strong>Coin:</strong></Typography>
              <Typography>{selectedRow.coin?.replace("_TEST","")}</Typography>
            </Box>

            <Box display="flex" justifyContent="space-between" mb={2}>
              <Typography><strong>Status:</strong></Typography>
              <Typography>{selectedRow.status}</Typography>
            </Box>

           <Box display="flex" justifyContent="flex-end" gap={2} >
          <CustomButton onClick={handleClose}>Close</CustomButton>
          </Box>
          </>
        )}
      </CustomModal>
    </Box>
  );
};

export default FirstSection;

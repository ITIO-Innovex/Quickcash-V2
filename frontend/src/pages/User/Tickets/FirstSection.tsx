import api from '@/helpers/apiHelper';
import { jwtDecode } from 'jwt-decode';
import { JwtPayload } from '@/types/jwt';
import { useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import CommonTooltip from '@/components/common/toolTip';
import CustomModal from '../../../components/CustomModal';
import { Box, Button, Typography, useTheme } from '@mui/material';
import GenericTable from '../../../components/common/genericTable';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';

const FirstSection = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any | null>(null);

  const [list,setList] = React.useState<any>([]);
  const url = import.meta.env.VITE_NODE_ENV == "production" ? 'api' : 'api';

  useEffect(() => {
    const accountId = jwtDecode<JwtPayload>(localStorage.getItem('token') as string);
    getTicketList(accountId.data.id);
  },[]);

  const getTicketList = async(id:any) => {
    try {
      const result = await api.get(`/${url}/v1/support/list/${id}`);
      if(result?.status == 201) {
        setList(result?.data?.data);
      }
    } catch (error) {
      console.error("Error fetching ticket list:", error);
    }
  }

  const handleActionClick = (row: any) => {
    setSelectedRow(row);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedRow(null);
  };

  const ticketsData = [
    { date: '2025-04-15', id: '306620906230', type: 'Crypto', amount: -11, balance: 853.16, status: 'Success' },
    { date: '2025-04-11', id: '749333461639', type: 'Crypto', amount: -11, balance: 864.16, status: 'Success' },
  ];

  const columns = [
    { field: 'createdAt', headerName: 'Date' },
    { field: 'ticketId', headerName: 'Ticket Id'},
    { field: 'subject', headerName: 'Subject' },
    { field: 'message', headerName: 'Message'},
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
    <CommonTooltip title="View chat history" arrow>
      <ChatBubbleOutlineIcon
        style={{ cursor: 'pointer' }}
        onClick={() => navigate('/help-center/history')}
      />
    </CommonTooltip>
  )
}
  ];

  return (
    <Box>
      <GenericTable columns={columns} data={list} onActionClick={handleActionClick} />
 
      <CustomModal open={open} onClose={handleClose} title="Ticket Details" sx={{backgroundColor: theme.palette.background.default }}>
        <div className="header-divider" />
        
        <Box sx={{ mt: 2 }}>
           <Box display="flex" justifyContent="space-between" mb={2}>

                <Typography><strong>Date:</strong></Typography>
                <Typography>{selectedRow?.createdAt}</Typography>
                </Box>

                <Box display="flex" justifyContent="space-between" mb={2}>
                <Typography><strong>Transaction ID:</strong></Typography>
                <Typography>{selectedRow?.ticketId}</Typography>
                </Box>

                <Box display="flex" justifyContent="space-between" mb={2}>
                <Typography><strong>Type:</strong></Typography>
                <Typography>{selectedRow?.type}</Typography>
                </Box>

                <Box display="flex" justifyContent="space-between" mb={2}>
                <Typography><strong>Amount:</strong></Typography>
                <Typography>${selectedRow?.amount}</Typography>
                </Box>

                <Box display="flex" justifyContent="space-between" mb={2}>
                <Typography><strong>Balance:</strong></Typography>
                <Typography>${selectedRow?.balance}</Typography>
                </Box>

                <Box display="flex" justifyContent="space-between" mb={2}>
                <Typography><strong>Status:</strong></Typography>
                <Typography>{selectedRow?.status}</Typography>
                </Box>

                <Button
                className="custom-button"
                onClick={handleClose}
                sx={{ mt: 3 }}
                >
                <span className="button-text">Close</span>
                </Button>
        </Box>
        </CustomModal>
    </Box>
  );
};

export default FirstSection;

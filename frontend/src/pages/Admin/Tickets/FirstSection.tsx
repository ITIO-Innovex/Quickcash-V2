import { Filter } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomModal from '@/components/CustomModal';
import CustomButton from '@/components/CustomButton';
import CommonFilter from '@/components/CustomFilter';
import CommonTooltip from '@/components/common/toolTip';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Box, Button, Typography, useTheme } from '@mui/material';
import GenericTable from '../../../components/common/genericTable';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import admin from '@/helpers/adminApiHelper';
import { useAppToast } from '@/utils/toast'; 
const url = import.meta.env.VITE_NODE_ENV === "production" ? 'api' : 'api';
console.log('Environment:', import.meta.env.VITE_NODE_ENV);
console.log('URL:', url);

const FirstSection = () => {
  const theme = useTheme();
  const toast = useAppToast(); 
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState('');
  const [currentTicketRequestStatus, setCurrentTicketRequestStatus] = useState('');
  const [comment, setComment] = useState('');
  const [filterText, setFilterText] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any | null>(null);
  const [list, setList] = useState<any>();

  const handleFilter = () => {
    setShowFilter((prev) => !prev);
  };
  const handleSave = async () => {
    if (!selectedRow?._id || !selectedRow?.user) return;
    await HandleUpdateStatus(selectedRow._id, selectedRow.user);
  };
  const handleCancel = () => {
    setOpen(false);
  };


  const getListData = async () => {
    const statusVal = status === "all" ? '' : status;
    
    try {
      // Try the original endpoint first
      const result = await admin.get(`/${url}/v1/admin/usertickets?status=${statusVal}`);
      if (result.data.status === 201 || result.data.status === "201") {
        setList(result?.data?.data);
        setCurrentData(result?.data?.data);
      } else {
        console.error('API returned non-success status:', result.data.status);
      }
    } catch (error) {
      console.error("Error fetching tickets:", error);
      console.error("Error response:", error.response?.data);
      
      try {
        const fallbackResult = await admin.get(`/${url}/v1/admin/usertickets`);
        if (fallbackResult.data.status === 201 || fallbackResult.data.status === "201") {        
          setList(fallbackResult?.data?.data);
          setCurrentData(fallbackResult?.data?.data);
        }
      } catch (fallbackError) {
        console.error("Fallback request also failed:", fallbackError);
        
        // Try with /api/v1/ pattern as last resort
        try {
          const apiResult = await admin.get(`/api/v1/admin/usertickets?status=${statusVal}`);
          if (apiResult.data.status === 201 || apiResult.data.status === "201") {
            setList(apiResult?.data?.data);
            setCurrentData(apiResult?.data?.data);
          }
        } catch (apiError) {
          console.error("API v1 request also failed:", apiError);
        }
      }
    }
  }
  useEffect(() => {  
    getListData();
  }, [status]);
  const [currentData, setCurrentData] = useState(list);

  const handleActionClick = (row: any) => {
    setSelectedRow(row);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedRow(null);
  };

  const handleGlobalSearch = (text: string) => {
    setFilterText(text);
    if (text.trim() === '') {
      setCurrentData(list);
      return;
    }

    const lower = text.toLowerCase();

    const filtered = list.filter((row) =>
      Object.values(row).some(
        (val) => typeof val === 'string' && val.toLowerCase().includes(lower)
      )
    );

    setCurrentData(filtered.length ? filtered : []);
  };

  const columns = [
    { field: 'ticketId', headerName: 'TicketId' },
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
      field: 'subject',
      headerName: 'Subject',
      render: (row: any) => row.subject || 'N/A',
    },
    {
      field: 'message',
      headerName: 'Message',
      render: (row: any) => row.message ? `${row.message.slice(0, 50)}...` : '',
    },
    {
      field: 'status',
      headerName: 'Status',
      render: (row: any) => {
        const rawStatus = row.status?.toLowerCase?.();
        const normalizedStatus = rawStatus === 'closed' ? 'close' : rawStatus;
        const displayStatus = rawStatus === 'closed' ? 'Close' : row.status;

        return (
          <span className={`status-chip ${normalizedStatus}`}>
            {displayStatus}
          </span>
        );
      }
    },
    {
      field: 'action',
      headerName: 'Action',
      render: (row: any) => (
         <Box display="flex" gap={1}>
           <CommonTooltip title="View chat history" arrow>
      <ChatBubbleOutlineIcon
        style={{ cursor: 'pointer' }}
        onClick={() => {
          console.log('Navigating to chat history with row data:', row);
          // Pass both _id and ticketId to try both
          console.log('_id:', row._id, 'ticketId:', row.ticketId, 'userId:', row.userDetails?.[0]?._id);
          navigate('/admin/help-center/history', { 
            state: { 
              ticketId: row._id, // Use _id as primary
              ticketIdAlt: row.ticketId, // Pass ticketId as alternative
              userId: row.userDetails?.[0]?._id 
            } 
          });
        }}
      />
    </CommonTooltip>
        <VisibilityIcon
          style={{ cursor: 'pointer' }}
          onClick={() => handleActionClick(row)}
        />
        </Box>
      ),
    },
  ];

  const HandleUpdateStatus = async(id:any, userid:any) => {
    await admin.patch(`/${url}/v1/support/updateStatus/${id}`,
    {
      status: currentTicketRequestStatus,
      comment: comment,
      user: userid
    }, 
   )
    .then(result => {
      if(result.data.status == 201) {
        toast.success(result.data.message);
        setOpen(false);
        getListData();
      }
    })
    .catch(error => {
      console.log("error", error);
      toast.error(error.response?.data?.message || "Error updating status");
    })
  }

  return (
    <Box>
      {/* Action Buttons */}
      <Box
        sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center', }}>
        <Button startIcon={<Filter size={20} />} onClick={handleFilter} sx={{ color: theme.palette.navbar.text }} > Filter </Button>
      </Box>

      {/* Filter Input */}
      {showFilter && (
        <CommonFilter
          label="Search any field"
          value={filterText}
          onChange={handleGlobalSearch}
          width="200px"
        />
      )}
      {currentData ? (
        <GenericTable columns={columns} data={currentData} />
      ) : (
        <Typography variant="body1" sx={{ mt: 2 }}>
          No data found.
        </Typography>
      )}

      <CustomModal open={open} onClose={handleCancel} title={'Update Support/Ticket Request'} sx={{backgroundColor:theme.palette.background.default}}>
          <label className="ticket-modal-label">Status</label>
          <select className="ticket-modal-select" value={currentTicketRequestStatus} onChange={e => setCurrentTicketRequestStatus(e.target.value)} style={{backgroundColor:theme.palette.background.default,color:theme.palette.text.primary}}>
            <option value="">Select status</option>
            <option value="open">Open</option>
            <option value="pending">Pending</option>
            <option value="closed">Closed</option>
          </select>

          <label className="ticket-modal-label">Reason</label>
          <textarea className="ticket-modal-textarea" rows={3} value={comment} style={{backgroundColor:theme.palette.background.default,color:theme.palette.text.primary}} onChange={e => setComment(e.target.value)} placeholder="Enter reason..." />
          <div className="ticket-modal-actions">

            <Box display="flex" justifyContent="flex-end" gap={2} >
            <Button className="Custom-button" onClick={handleClose}>Cancel</Button>
            <CustomButton onClick={handleSave}>Save</CustomButton>
            </Box>
          </div>
      </CustomModal>
    </Box>
  );
};

export default FirstSection;

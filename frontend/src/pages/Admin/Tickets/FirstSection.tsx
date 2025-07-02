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
const url = import.meta.env.VITE_NODE_ENV == "production" ? 'api' : 'api';

const FirstSection = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState('');
  const [reason, setReason] = useState('');
  const [filterText, setFilterText] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any | null>(null);
  const [list, setList] = useState<any>();

  const handleFilter = () => {
    setShowFilter((prev) => !prev);
  };
  const handleSave = () => {
  // handle save logic
};
const handleCancel = () => {
  // handle cancel logic (close modal)
};
  const ticketData = [
    {
      ticketId: '174824079065597980',
      date: '2025-05-26',
      username: 'Prashant Bhatnager',
      subject: 'KYC APPROVAL',
      message:
        'I have submitted my documents. kindly approve my kyc so that I could borrow money',
      status: 'Open',
    },
    {
      ticketId: '174762975561695000',
      date: '2025-05-19',
      username: 'Jennilyn Geraldo',
      subject: 'loan application',
      message: 'update',
      status: 'Open',
    },
    {
      ticketId: '174746936016954880',
      date: '2025-05-17',
      username: 'Vishal masih',
      subject: 'from yesterday my amount not yet been credited',
      message: 'kindly to the needful',
      status: 'Open',
    },
    {
      ticketId: '174623379376772000',
      date: '2025-05-03',
      username: 'BrticoLibert',
      subject: 'pueden',
      message: 'verificar mi kyc',
      status: 'Close',
    },
    {
      ticketId: '174542495913819780',
      date: '2025-04-23',
      username: 'Ganesh',
      subject: 'demo',
      message: 'klkokedsjfklvcm,',
      status: 'Close',
    },
  ];


  const getListData = async () => {
    const statusVal = status == "all" ? '' : status;
    await admin.get(`/${url}/v1/admin/usertickets?status=${statusVal}`)
      .then(result => {
        if (result.data.status == 201) {
          setList(result?.data?.data);
          setCurrentData(result?.data?.data);
        }
      })
      .catch(error => {
        console.log("error", error);
      })
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
      field: 'userDetails?.email',
      headerName: 'Type',
      render: (row: any) => row.userDetails?.[0]?.email || 'N/A',
    },
    {
      field: 'message',
      headerName: 'Date',
      render: (row: any) => row.message ? `${row.message.slice(0, 20)}...` : '',
    },
    {
      field: 'status',
      headerName: 'Status',
      render: (row: any) => (
        <span
          className={`status-chip ${row.status === 'Open' ? 'success' : 'pending'}`}
        >
          {row.status}
        </span>
      ),
    },
    {
      field: 'action',
      headerName: 'Action',
      render: (row: any) => (
         <Box display="flex" gap={1}>
           <CommonTooltip title="View chat history" arrow>
      <ChatBubbleOutlineIcon
        style={{ cursor: 'pointer' }}
        onClick={() => navigate('/admin/help-center/history')}
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
          <select className="ticket-modal-select" value={status} onChange={e => setStatus(e.target.value)} style={{backgroundColor:theme.palette.background.default,color:theme.palette.text.primary}}>

            <option value="">Select status</option>
            <option value="open">Open</option>
            <option value="pending">Pending</option>
            <option value="closed">Closed</option>

          </select>

          <label className="ticket-modal-label">Reason</label>
          <textarea className="ticket-modal-textarea" rows={3} value={reason}style={{backgroundColor:theme.palette.background.default,color:theme.palette.text.primary}} onChange={e => setReason(e.target.value)} placeholder="Enter reason..." />
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

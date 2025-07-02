
import api from '@/helpers/apiHelper';
import Menu from '@mui/material/Menu';
import { Filter } from 'lucide-react';
import { useState, useEffect } from 'react';
import admin from '@/helpers/adminApiHelper';
import MenuItem from '@mui/material/MenuItem';
import { useNavigate } from 'react-router-dom';
import CustomModal from '@/components/CustomModal';
import { showToast } from '@/utils/toastContainer';
import CommonFilter from '@/components/CustomFilter';
import CustomButton from '@/components/CustomButton';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Box, Button, Typography, useTheme, } from '@mui/material';
import GenericTable from '../../../components/common/genericTable';
import SessionHistoryModal, { dummySessionData } from './SessionHistoryModal';
import InvoiceGeneratedListModal, { dummyInvoiceData } from './InvoiceListModal';
import AccountListModal, { dummyAccountData } from './AccountListModal';
import RecipientListModal,{dummyRecipientData} from './RecipientListModal';
const url = import.meta.env.VITE_NODE_ENV == "production" ? 'api' : 'api';

const FirstSection = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [menuRow, setMenuRow] = useState<any | null>(null);
  const [sessionModalOpen, setSessionModalOpen] = useState(false);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [recipientModalOpen, setRecipientModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any | null>(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<Element>, row: any) => {
    setMenuAnchorEl(event.currentTarget as HTMLElement);
    setMenuRow(row);
  };
  const handleViewClick = () => {
  handleMenuClose();      // menu close
  navigate('/admin/user/:id');  // redirect
};
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setMenuRow(null);
  };
  const handleFilter = () => {
    setShowFilter((prev) => !prev);
  };

  const handleSessionHistoryOpen = () => {
    setSelectedRow(dummySessionData);
  setSessionModalOpen(true);
  handleMenuClose(); // This will close the menu
};

const handleInvoiceModalOpen = () => {
  setSelectedRow(dummyInvoiceData);   // set invoice data
  setInvoiceModalOpen(true);          // open modal
  handleMenuClose();                  // close menu if needed
};

const handleAccountModalOpen = () => {
  setSelectedRow(dummyAccountData);   // set account data
  setAccountModalOpen(true);          // open modal
  handleMenuClose();                  // close menu if needed
};

const handleRecipientModalOpen = () => {
  setSelectedRow(dummyRecipientData);   // set account data
  setRecipientModalOpen(true);          // open modal
  handleMenuClose();                  // close menu if needed
};
  const userData = [
    {
      date: '2025-05-01',
      username: 'alpha',
      email: 'a@example.com',
      mobile: '1234567890',
      country: 'India',
      currency: 'INR',
      status: true,
      suspend: false,
    },
    {
      date: '2025-05-02',
      username: 'bravo',
      email: 'b@example.com',
      mobile: '9876543210',
      country: 'USA',
      currency: 'USD',
      status: false,
      suspend: false,
    },
    {
      date: '2025-05-03',
      username: 'charlie',
      email: 'c@example.com',
      mobile: '5556667777',
      country: 'UK',
      currency: 'GBP',
      status: false,
      suspend: false,
    },
  ];
  const [fullData, setFullData] = useState<any[]>([]);
  const [currentData, setCurrentData] = useState<any[]>([]);


  // Fetch user list from API
  const getListData = async () => {
    await admin
      .get(`/${url}/v1/admin/userslist`, {
       
      })
      .then((result) => {
        if (result.data.status == 201) {
          setFullData(result.data.data);
          setCurrentData(result.data.data);
        }
      })
      .catch((error) => {
        console.log('error', error);
      });
  };
  useEffect(() => {
    getListData();
  }, []);

  const handleActionClick = (row: any) => {
    setSelectedRow(row);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedRow(null);
  };

  // Filter functionality preserved
  const handleGlobalSearch = (text: string) => {
    setFilterText(text);
    if (text.trim() === '') {
      setCurrentData(fullData);
      return;
    }
    const lower = text.toLowerCase();
    const filtered = fullData.filter((row) =>
      Object.values(row).some(
        (val) => typeof val === 'string' && val.toLowerCase().includes(lower)
      )
    );
    setCurrentData(filtered.length ? filtered : []);
  };

  // Update user status via API
  const handleChange = async (event: React.ChangeEvent<HTMLInputElement> , val:any) => {
    console.log("val", val);
    await admin.patch(`/${url}/v1/user/updateuseradmin`, {
      user: val,
      status: event.target.checked
    },)
    .then(result => {
      if(result.data.status == 201) {
        showToast(result.data.message,"success");
        getListData();
      }
    })    
    .catch(error => {
      console.log("error", error);
      showToast(error.response.data.message,"error");
    })
  };

  // Update user suspend via API
  const handleChangeSuspend = async (
    event: React.ChangeEvent<HTMLInputElement>,
    val: any
  ) => {
    await admin
      .patch(
        `/${url}/v1/user/updateUserSuspend`,
        {
          user: val,
          suspend: event.target.checked,
        },
      )
      .then((result) => {
        if (result.data.status == 201) {
          showToast(result.data.message, 'success');
          getListData();
        }
      })
      .catch((error) => {
        console.log('error', error);
        showToast(error.response.data.message, 'error');
      });
  };

  const columns = [
    {
      field: 'createdAt',
      headerName: 'Date',
      render: (row: any) => row.createdAt ? row.createdAt.slice(0, 10) : '',
    },
    { field: 'name', headerName: 'Username' },
    { field: 'email', headerName: 'Email' },
    { field: 'mobile', headerName: 'Mobile' },
    { field: 'country', headerName: 'Country' },
    { field: 'defaultCurrency', headerName: 'Currency' },
    {
      field: 'status',
      headerName: 'Status',
      render: (row: any) => (
        <label className="switch">
          <input
            type="checkbox"
            checked={row.status}
            onChange={(e) => handleChange(e,row?._id)}
          />
          <span className="slider"></span>
        </label>
      ),
    },
    {
      field: 'suspend',
      headerName: 'Suspend',
      render: (row: any) => (
        <label className="switch">
          <input
            type="checkbox"
            checked={row.suspend}
            onChange={(e) => handleChangeSuspend(e,row?._id)}
          />
          <span className="slider"></span>
        </label>
      ),
    },
   {
  field: 'action',
  headerName: 'Action',
  render: (row: any) => (
    <Box className="action-icons-wrapper">
      <MoreVertIcon
        className="action-icon"
        onClick={(e) => handleMenuOpen(e, row)}
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
        <Button startIcon={<Filter size={20} />} sx={{ color: theme.palette.navbar.text }} > Filter </Button>
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
      {currentData.length ? (
        <GenericTable columns={columns} data={currentData} />
      ) : (
        <Typography variant="body1" sx={{ mt: 2 }}>
          No data found.
        </Typography>
      )}

      {/* Action Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        className="userlist-action-menu"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={handleViewClick}>View Details</MenuItem>
        <MenuItem onClick={handleSessionHistoryOpen}>Login Session History</MenuItem>
        <MenuItem onClick={handleInvoiceModalOpen}>Invoice Generated List</MenuItem>
        <MenuItem onClick={handleAccountModalOpen}>Accounts List</MenuItem>
        <MenuItem onClick={handleRecipientModalOpen}>Recipient List</MenuItem>
      </Menu>

      <SessionHistoryModal open={sessionModalOpen} data={dummySessionData}onClose={() => setSessionModalOpen(false)} />
        
      <InvoiceGeneratedListModal open={invoiceModalOpen} onClose={() => setInvoiceModalOpen(false)} data={dummyInvoiceData}/>

      <AccountListModal open={accountModalOpen} onClose={() => setAccountModalOpen(false)} data={dummyAccountData}/>

      <RecipientListModal open={recipientModalOpen} onClose={() => setRecipientModalOpen(false)} data={dummyRecipientData}/>

        <CustomModal
          open={open}
          onClose={handleClose}
          title="User Details"
        >
        <div className="header-divider" />

        <Box sx={{ mt: 2 }}>
          <Box display="flex" justifyContent="space-between" mb={2}>
            <Typography>
              <strong>Date:</strong>
            </Typography>
            <Typography>{selectedRow?.createdAt?.slice(0, 10)}</Typography>
          </Box>

          <Box display="flex" justifyContent="space-between" mb={2}>
            <Typography>
              <strong>UserName:</strong>
            </Typography>
            <Typography>{selectedRow?.name}</Typography>
          </Box>

          <Box display="flex" justifyContent="space-between" mb={2}>
            <Typography>
              <strong>Email:</strong>
            </Typography>
            <Typography>{selectedRow?.email}</Typography>
          </Box>

          <Box display="flex" justifyContent="space-between" mb={2}>
            <Typography>
              <strong>Mobile:</strong>
            </Typography>
            <Typography>{selectedRow?.mobile}</Typography>
          </Box>

          <Box display="flex" justifyContent="space-between" mb={2}>
            <Typography>
              <strong>Country:</strong>
            </Typography>
            <Typography>{selectedRow?.country}</Typography>
          </Box>

          <Box display="flex" justifyContent="space-between" mb={2}>
            <Typography>
              <strong>Status:</strong>
            </Typography>
            <Typography>
              {selectedRow?.status ? '✅ Active' : '❌ Inactive'}
            </Typography>
          </Box>

          <Box display="flex" justifyContent="space-between" mb={2}>
            <Typography>
              <strong>Suspend:</strong>
            </Typography>
            <Typography>
              {selectedRow?.suspend ? '⛔ Suspended' : '✅ Not Suspended'}
            </Typography>
          </Box>

          <CustomButton onClick={handleClose}>Close</CustomButton>

        </Box>
      </CustomModal>
    </Box>
  );
};

export default FirstSection;

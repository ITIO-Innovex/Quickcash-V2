import api from '@/helpers/apiHelper';
import Menu from '@mui/material/Menu';
import { Filter } from 'lucide-react';
import { useState, useEffect } from 'react';
import admin from '@/helpers/adminApiHelper';
import MenuItem from '@mui/material/MenuItem';
import { useNavigate } from 'react-router-dom';
import CustomModal from '@/components/CustomModal';
import { useAppToast } from '@/utils/toast'; 
import CommonFilter from '@/components/CustomFilter';
import CustomButton from '@/components/CustomButton';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Box, Button, Typography, useTheme, } from '@mui/material';
import GenericTable from '../../../components/common/genericTable';
import SessionHistoryModal, { dummySessionData } from './SessionHistoryModal';
import InvoiceGeneratedListModal from './InvoiceListModal';
import AccountListModal, { dummyAccountData } from './AccountListModal';
import RecipientListModal, { dummyRecipientData } from './RecipientListModal';
import axios from 'axios';
const url = import.meta.env.VITE_NODE_ENV == "production" ? 'api' : 'api';

const FirstSection = () => {
  const theme = useTheme();
  const toast = useAppToast(); 
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
  const [sessionList, setSessionList] = useState<any[]>([]);
  const [accountsList, setAccountList] = useState<any[]>([]);
  const [receipintsList, setReceipintList] = useState<any[]>([]);
  const [invoicesList, setInvoiceList] = useState<any[]>([]);

  const handleMenuOpen = (event: React.MouseEvent<Element>, row: any) => {
    setMenuAnchorEl(event.currentTarget as HTMLElement);
    setMenuRow(row);
  };
  const handleViewClick = () => {
    handleMenuClose();
    if (menuRow?._id) {
      navigate(`/admin/user/${menuRow._id}`);
    }
  };
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setMenuRow(null);
  };
  const handleFilter = () => {
    setShowFilter((prev) => !prev);
  };

  // Fetch session history for the selected user and open modal
  const handleSessionHistoryOpen = async () => {
    if (menuRow?._id) {
      await getUserSessionHistory(menuRow._id);
    } else {
      setSessionList([]);
    }
    setSessionModalOpen(true);
    handleMenuClose();
  };

  // API to fetch session history for a user
  const getUserSessionHistory = async (id: any) => {
    await admin.get(`/${url}/v1/session/getusersession/${id}`)
      .then(result => {
        if (result.data.status == 201) {
          setSessionList(result.data.data);
        } else {
          setSessionList([]);
        }
      })
      .catch(error => {
        console.log("error", error);
        setSessionList([]);
      })
  }

  // Fetch invoice list for the selected user and open modal
  const handleInvoiceModalOpen = async () => {
    if (menuRow?._id) {
      await getInvoiceLists(menuRow._id);
    } else {
      setInvoiceList([]);
    }
    setInvoiceModalOpen(true);
    handleMenuClose();
  };

  // API to fetch invoice list for a user
  const getInvoiceLists = async (moreVal: any) => {
    await admin.get(`/${url}/v1/invoice/adminlist/${moreVal}`)
      .then(result => {
        if (result.data.status == 201) {
          setInvoiceList(result.data.data);
        } else {
          setInvoiceList([]);
        }
      })
      .catch(error => {
        console.log("error", error);
        setInvoiceList([]);
      })
  }

  // Fetch account list for the selected user and open modal
  const handleAccountModalOpen = async () => {
    if (menuRow?._id) {
      await getAccountLists(menuRow._id);
    } else {
      setAccountList([]);
    }
    setAccountModalOpen(true);
    handleMenuClose();
  };

  // API to fetch account list for a user
  const getAccountLists = async (moreVal: any) => {
    await admin.get(`/${url}/v1/account/adminlist/${moreVal}`)
      .then(result => {
        if (result.data.status == 201) {
          setAccountList(result.data.data);
        } else {
          setAccountList([]);
        }
      })
      .catch(error => {
        console.log("error", error);
        setAccountList([]);
      })
  }

  // Fetch recipient list for the selected user and open modal
  const handleRecipientModalOpen = async () => {
    if (menuRow?._id) {
      await getReceipintLists(menuRow._id);
    } else {
      setReceipintList([]);
    }
    setRecipientModalOpen(true);
    handleMenuClose();
  };

  // API to fetch recipient list for a user
  const getReceipintLists = async (moreVal: any) => {
    await admin.get(`/${url}/v1/receipient/adminlist/${moreVal}`)
      .then(result => {
        if (result.data.status == 201) {
          setReceipintList(result.data.data);
        } else {
          setReceipintList([]);
        }
      })
      .catch(error => {
        console.log("error", error);
        setReceipintList([]);
      })
  }
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
  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>, val: any) => {
    console.log("val", val);
    await admin.patch(`/${url}/v1/user/updateuseradmin`, {
      user: val,
      status: event.target.checked
    },)
      .then(result => {
        if (result.data.status == 201) {
          toast.success(result.data.message);
          getListData();
        }
      })
      .catch(error => {
        console.log("error", error);
        toast.error(error.response.data.message);
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
          toast.success(result.data.message);
          getListData();
        }
      })
      .catch((error) => {
        console.log('error', error);
        toast.error(error.response.data.message);
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
    // {
    //   field: 'status',
    //   headerName: 'Status',
    //   render: (row: any) => (
    //     <label className="switch">
    //       <input
    //         type="checkbox"
    //         checked={row.status}
    //         onChange={(e) => handleChange(e, row?._id)}
    //       />
    //       <span className="slider"></span>
    //     </label>
    //   ),
    // },
    {
      field: 'suspend',
      headerName: 'Suspend/Active',
      render: (row: any) => (
        <label className="switch">
          <input
            type="checkbox"
            checked={row.suspend}
            onChange={(e) => handleChangeSuspend(e, row?._id)}            
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

      <SessionHistoryModal open={sessionModalOpen} data={sessionList} onClose={() => setSessionModalOpen(false)} />

      <InvoiceGeneratedListModal open={invoiceModalOpen} onClose={() => setInvoiceModalOpen(false)} data={invoicesList} />

      <AccountListModal open={accountModalOpen} onClose={() => setAccountModalOpen(false)} data={accountsList} />

      <RecipientListModal open={recipientModalOpen} onClose={() => setRecipientModalOpen(false)} data={receipintsList} />

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

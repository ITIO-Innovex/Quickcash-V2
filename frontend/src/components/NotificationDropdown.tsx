import React, {
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
  useRef,
} from 'react';
import {
  Box,
  Typography,
  IconButton,
  Popover,
  Button,
  useTheme,
  Badge,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import NotificationItem from './NotificationItem';
import { jwtDecode } from 'jwt-decode';
import admin from '@/helpers/adminApiHelper';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment';

const url = import.meta.env.VITE_NODE_ENV === 'production' ? 'api' : 'api';
interface Notification {
  id: string;
  title: string;
  timestamp: string;
  isRead: boolean;
}


interface JwtPayload {
  sub: string;
  role: string;
  iat: number;
  exp: number;
  data: {
    defaultcurr: string;
    email: string;
    id: string;
    name: string;
    type: string;
  };
}

const NotificationDropdown = forwardRef((_, ref) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [popoverKey, setPopoverKey] = useState(0);
  const iconButtonRef = useRef<HTMLButtonElement>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [status] = useState<any>(''); // adjust or remove if unnecessary
  const [unReadNotification, setUnReadNotification] = useState<any[]>([]);
  const [notifyBell, setNotifyBell] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const open = Boolean(anchorEl);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

const handleClick = (event?: React.MouseEvent<HTMLButtonElement>) => {
  setAnchorEl(event?.currentTarget || iconButtonRef.current);
  setPopoverKey((prev) => prev + 1); // 👈 force re-render
};

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, isRead: true }))
    );
  };

 useImperativeHandle(ref, () => ({
  click: () => {
    handleClick(); // Call handleClick directly, it will use iconButtonRef
  },
}));
  // const handleNotificationClick = (id: string) => {
  //   setNotifications((prev) =>
  //     prev.map((n) =>
  //       n.id === id ? { ...n, isRead: true } : n
  //     )
  //   );
  // };
  const getListData = async (status: any) => {
    try {
      const token = localStorage.getItem('admin');
      if (!token) return;

      const accountId = jwtDecode<JwtPayload>(token);
      const userId = accountId?.data?.id;

      const res = await admin.get(`/${url}/v1/admin/notification/list/${userId}`);
      if (res.data.status === 201 && Array.isArray(res.data.data)) {
        const limited = res.data.data
          .reverse()
          .slice(0, 4) // only take recent 4
          .map((item: any) => ({
            id: item._id,
            title: item.title,
            timestamp: new Date(item.createdAt).toLocaleString('en-IN', {
              dateStyle: 'medium',
              timeStyle: 'short',
            }),
            isRead: item.readBy.includes(userId),
          }));

        setNotifications(limited);
      }
    } catch (error) {
      console.log('error', error);
    }
  };

  const getAllUnreadNotification = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    let user: JwtPayload | null = null;
    try {
      user = jwtDecode<JwtPayload>(token);
      setCurrentUserId(user?.data?.id || null);
    } catch (e) {
      user = null;
      setCurrentUserId(null);
    }

    await axios.get(`/${url}/v1/admin/notification/unread`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(result => {
      if(result?.data?.status == 201) {
        // Only show notifications for this user or notifyType 'all'
        const filtered = (result?.data?.data || []).filter((item: any) =>
          (item?.user === user?.data?.id) || item?.notifyType === 'all'
        ).slice(0, 4);
        setUnReadNotification(filtered);
        if(filtered.length > 0) {
          if(result?.data?.usersGroup && user && result?.data?.usersGroup.includes(user?.data?.id)) {
            setNotifyBell(true);
          }
          filtered.forEach((item: any) => {
            if(user && item?.user == user?.data?.id) setNotifyBell(true);
            if(user && item?.user == user?.data?.id && item?.read == false) setNotifyBell(true);
          });
        }
      }
    })
    .catch(error => {
      console.log("error", error);
    });
  };

  const updateUnReadAllMessage = async () => {
    if (!currentUserId || unReadNotification.length === 0) return;
    const token = localStorage.getItem('token');
    if (!token) return;
    await axios.patch(`/${url}/v1/admin/notification/update-unread`, {
      user: currentUserId
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(result => {
      if(result?.data?.status == 200) {
        getAllUnreadNotification();
      }
    })
    .catch(error => {
      console.log('error', error);
    });
  };

  useEffect(() => {
    const adminToken = localStorage.getItem('admin');
    const userToken = localStorage.getItem('token');
    if (adminToken) {
      setIsAdmin(true);
      getListData(status); // fetch admin notifications only
      setUnReadNotification([]); // clear user notifications
      setNotifyBell(false);
    } else if (userToken) {
      setIsAdmin(false);
      setNotifications([]); // clear admin notifications
      getAllUnreadNotification(); // fetch user notifications only
    } else {
      setIsAdmin(false);
      setNotifications([]);
      setUnReadNotification([]);
      setNotifyBell(false);
    }
  }, [status]);

  return (
    <>
     <IconButton
        ref={iconButtonRef}
        onClick={handleClick}
        sx={{
          color: theme.palette.text.primary,
          '&:hover': {
            backgroundColor: theme.palette.action.hover,
          },
        }}
      >
              <Badge badgeContent={isAdmin ? unreadCount : unReadNotification.length} color="error" variant={notifyBell && !isAdmin ? "dot" : "standard"}>
          <NotificationsIcon />
        </Badge>
      </IconButton>
      {open && (
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{
          mt: 1,
          '& .MuiPaper-root': {
            backgroundColor: theme.palette.background.paper,
            boxShadow: theme.shadows[8],
            borderRadius: 2,
            width: {
              xs: '90vw',
              sm: '400px',
            },
            maxWidth: '400px',
            maxHeight: '500px',
          },
        }}
      >
        <Box>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              p: 2,
              borderBottom: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Notifications
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                size="small"
                onClick={() => {
                  handleClose();
                  if (isAdmin) {
                    navigate('/admin/notifications');
                  } else {
                    navigate('/notifications');
                  }
                }}
                sx={{
                  color: theme.palette.primary.main,
                  fontSize: '0.75rem',
                  textTransform: 'none',
                  minWidth: 'auto',
                  p: 0.5,
                }}
              >
                View All
              </Button>
              <Button
               size="small"
                  onClick={() => {
                    if (isAdmin) {
                      handleMarkAllRead();
                    } else {
                      updateUnReadAllMessage();
                    }
                    setTimeout(() => handleClose(), 100); // 👈 this helps avoid popover freeze
                  }}
                sx={{
                  color: theme.palette.primary.main,
                  fontSize: '0.75rem',
                  textTransform: 'none',
                  minWidth: 'auto',
                  p: 0.5,
                }}
              >
                Mark All Read
              </Button>
            </Box>
          </Box>

          <Box sx={{ maxHeight: '400px', overflowY: 'auto' }}>
            {isAdmin ? (
              notifications.length > 0 ? (
                notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    title={notification.title}
                    timestamp={notification.timestamp}
                    isRead={notification.isRead}
                    // onClick={() => handleNotificationClick(notification.id)}
                  />
                ))
              ) : (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                    No notifications
                  </Typography>
                </Box>
              )
            ) : (
              unReadNotification.length > 0 ? (
                unReadNotification.map((notification: any) => (
                  <NotificationItem
                    key={notification._id}
                    title={notification.title}
                    timestamp={moment(notification.createdAt).format('MMM D, YYYY, h:mm A')}
                    isRead={notification.read}
                    onClick={() => {}}
                  />
                ))
              ) : (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                    No notifications
                  </Typography>
                </Box>
              )
            )}
          </Box>
        </Box>
      </Popover>
      )}
    </>
  );
});

export default NotificationDropdown;

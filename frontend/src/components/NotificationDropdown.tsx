import React, { useEffect, useState } from 'react';
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

const NotificationDropdown: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [status] = useState<any>(''); // adjust or remove if unnecessary

  const open = Boolean(anchorEl);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, isRead: true }))
    );
  };

  const handleNotificationClick = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      )
    );
  };
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


  useEffect(() => {
    getListData(status);
  }, [status]);

  return (
    <>
      <IconButton
        onClick={handleClick}
        sx={{
          color: theme.palette.text.primary,
          '&:hover': {
            backgroundColor: theme.palette.action.hover,
          },
        }}
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

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
                  navigate('/admin/notifications');
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
                onClick={handleMarkAllRead}
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
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  title={notification.title}
                  timestamp={notification.timestamp}
                  isRead={notification.isRead}
                  onClick={() => handleNotificationClick(notification.id)}
                />
              ))
            ) : (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                  No notifications
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Popover>
    </>
  );
};

export default NotificationDropdown;

import { FormControlLabel, Switch } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import LogoutIcon from '@mui/icons-material/Logout';
import { useSettings } from '@/contexts/SettingsContext';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import { Grid, Box, Typography, IconButton } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import NotificationDropdown from '../NotificationDropdown';
import { useRef, useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useAuth } from '@/contexts/authContext';

interface HeaderProps {
  drawerWidth: number;
  collapsed: boolean;
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ collapsed }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const notifRef = useRef(null);
  const { themeMode, toggleTheme } = useSettings();
 
  const [isBusiness, setIsBusiness] = useState(false);

  const handleToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsBusiness(event.target.checked);
  };
  const updateLoginSession = async () => {
    await axios
      .patch(`/myapp/v1/session/update`, {
        user: localStorage.getItem('usersessionid'),
        isActiveNow: 0,
      })
      .then((result) => {
        if (result.status == 200) {
        }
      })
      .catch((error) => {
        console.log('Login api error', error);
      });
  };
  const { logout, adminLogout, isAuthenticated, isAdminAuthenticated } = useAuth();
 
  const handleLogout = () => {
    updateLoginSession();
    if (isAdminAuthenticated) {
      adminLogout();
      navigate('/login-admin');
    } else if (isAuthenticated) {
      logout();
      navigate('/login');
    }
    toast.success('Logout Successfully!!!');
  };

  return (
    <>
      <Box
        className="custom-header"
        sx={{
          backgroundColor: theme.palette.background.default,
          color: theme.palette.text.primary,
          marginLeft: { xs: '60px', sm: collapsed ? '80px' : '240px' },
          width: {
            xs: 'calc(100% - 60px)',
            sm: collapsed ? 'calc(100% - 80px)' : 'calc(100% - 240px)',
          },
        }}
      >
        <Grid container alignItems="center" justifyContent="space-between">
          {/* Left Container */}
          <Grid item>
            <Box className="header-left"></Box>
          </Grid>

          {/* Right Container */}
          <Grid item>
            <Box
              className="header-right"
              sx={{
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: { xs: 1, sm: 2 },
                justifyContent: { xs: 'center', sm: 'flex-end' },
                px: { xs: 1, sm: 2 },
                py: 2,
              }}
            >
              {/* KYC Switch */}
              <Box
                className="icon-group"
                sx={{ display: 'flex', alignItems: 'center' }}
              >
                <FormControlLabel
                  control={
                    <Switch
                      checked={isBusiness}
                      onChange={handleToggle}
                      sx={{
                        '& .MuiSwitch-switchBase': {
                          color: 'black', // default thumb color
                        },
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: '#483594', // thumb color when checked
                        },
                        '& .MuiSwitch-thumb': {
                          backgroundColor: 'black', // force thumb to always be black
                        },
                        '& .MuiSwitch-track': {
                          backgroundColor: '#ccc',
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track':
                          {
                            backgroundColor: '#483594',
                          },
                      }}
                      size="small"
                    />
                  }
                  label={
                    <Typography
                      variant="body2"
                      sx={(theme) => ({
                        fontWeight: 400,
                        color: theme.palette.text.primary,
                        minWidth: 80,
                      })}
                    >
                      {isBusiness ? 'Business' : 'Individual'}
                    </Typography>
                  }
                  labelPlacement="start"
                  // sx={{ mr: 1 }}
                />
              </Box>

              {/* Notifications */}
              <Box
                className="icon-group"
                onClick={() => {
                  notifRef.current?.click();
                }}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                  '&:hover': {
                    opacity: 0.8,
                  },
                }}
              >
                <span ref={notifRef}>
                  <NotificationDropdown />
                </span>
                <Typography variant="body2">Notifications</Typography>
              </Box>

              {/* Support */}
              <Box
                className="icon-group"
                onClick={() => {
                  if (isAdminAuthenticated) {
                    navigate('/admin/help-center');
                  } else {
                    navigate('/help-center');
                  }
                }}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                  '&:hover': {
                    opacity: 0.8,
                  },
                }}
              >
                <SupportAgentIcon />
                <Typography variant="body2">Ticket Support</Typography>
              </Box>

              {/* Mode Toggle */}
              <Box
                className="icon-group"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                  '&:hover': {
                    opacity: 0.8,
                  },
                }}
                onClick={toggleTheme}
              >
                {themeMode === 'dark' ? (
                  <Brightness7Icon />
                ) : (
                  <Brightness4Icon />
                )}
                <Typography variant="body2">Mode</Typography>
              </Box>

              {/* Logout */}
              <Box
                className="icon-group"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                  '&:hover': {
                    opacity: 0.8,
                  },
                }}
                onClick={handleLogout}
              >
                <LogoutIcon />
                <Typography variant="body2">Logout</Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default Header;

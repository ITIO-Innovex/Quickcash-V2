import {
  Menu as MenuIcon,
} from 'lucide-react';
import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  IconButton,
  useTheme,
  Popper,
  Paper,
  ClickAwayListener,
  ListItemButton,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { jwtDecode } from 'jwt-decode';
import api from '@/helpers/apiHelper';

type SidebarProps = {
  isOpen: boolean;
  toggleSidebar: () => void;
};
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
const Sidebar = ({ isOpen, toggleSidebar }: SidebarProps) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [hoveredItem, setHoveredItem] = useState<any>(null);
  const handleCardTabClick = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const accountId = jwtDecode<JwtPayload>(token)?.data?.id;
      if (!accountId) return;
      const result = await api.get(`/api/v1/card/list/${accountId}`);
      if (result.data.status === 201 && result.data.data.length > 0) {
        navigate('/card-details');
      } else {
        navigate('/cards');
      }
    } catch (error) {
      console.error("Card tab navigation failed:", error);
      navigate('/cards'); 
    }
  };
  const menuItems = [
    {
      name: 'Dashboard',
      icon: 'dashboard',
      path: '/dashboard',

    },
    { name: 'Cards', icon: 'credit_card', onClick: handleCardTabClick },
    { name: 'Transaction', icon: 'receipt', path: '/transactions' },
    { name: 'Statement', icon: 'assignment', path: '/statements' },
    {
      name: 'Crypto',
      icon: 'account_balance_wallet',
      hasDropdown: true,
      subItems: [
        { name: 'Dashboard', path: '/crypto-dashboard' },
        { name: 'Wallet', path: '/wallet' },
        { name: 'Spot', path: '/spot' },
        { name: 'Buy / Sell / Swap', path: '/buysellswap' }
      ]
    },
    { name: 'User Profile', icon: 'person', path: '/user-profile' },
    { name: 'Business', icon: 'person', path: '/register-business' },
    { name: 'Tickets', icon: 'confirmation_number', path: '/help-center' },
    { name: 'Refer & Earn', icon: 'card_giftcard', path: '/refer-earn' },
    {
      name: 'Digital Signature',
      icon: 'draw',
      hasDropdown: true,
      subItems: [
        { name: 'Dashboard', path: '/digital-signature', icon: 'dashboard' },
        // { name: 'Sign YourSelf', path: '/digital-signature/sign-yourself-form', icon: 'draw' },
        { name: 'Request Signature', path: '/digital-signature/request-signature', icon: 'send' },
        { name: 'Templates', path: '/digital-signature/templates', icon: 'library_books' },
        { name: 'Analytic-Data', path: '/digital-signature/analytic-data', icon: 'task_alt' }
        // { name: 'In Progress', path: '/digital-signature/inprogress-lists', icon: 'pending_actions' },
        // { name: 'Draft', path: '/digital-signature/draft-lists', icon: 'edit_note' },
        // { name: 'Completed', path: '/digital-signature/completed-lists', icon: 'task_alt' }
      ]
    },
    {
      name: 'Invoices',
      icon: 'description',
      hasDropdown: true,
      subItems: [
        { name: 'Dashboard', path: '/invoice-dashboard' },
        { name: 'Template Settings', path: '/template-settings' },
        { name: 'Clients', path: '/clients' },
        { name: 'Transactions', path: '/invoice-transactions' },
        { name: 'Category', path: '/invoice-category' },
        { name: 'Products', path: '/invoice-products' },
        { name: 'Quotes', path: '/invoice-quotes' },
        { name: 'Invoice Section', path: '/invoice-section' },
        { name: 'Manual Invoice Payment', path: '/manual-payment' },
        { name: 'Settings', path: '/settings' },
      ]
    },
  ];

  const handleMouseEnter = (event: React.MouseEvent<HTMLElement>, item: any) => {
    if (!isOpen && item.subItems) {
      setAnchorEl(event.currentTarget);
      setHoveredItem(item);
    }
  };

  const handleMouseLeave = () => {
    setAnchorEl(null);
    setHoveredItem(null);
  };

  return (
    <Box
      className={`user-sidebar ${isOpen ? 'open' : 'closed'}`}
      sx={{
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.primary,
        boxShadow: theme.shadows[2],
        width: isOpen ? 200 : 60,
        overflow: 'visible',
        position: 'relative',
        zIndex: 1201,
      }}
    >
      {/* Header */}
      <Box className={`user-sidebar-header ${isOpen ? 'open' : 'closed'}`} sx={{ p: 2 }}>
        {isOpen && (
          <Box className='header-comp'>
            <img
              className='logo-img'
              src="../logo.png"
              alt="Logo"
            />
            <Typography
              variant="h6"
              sx={{ color: theme.palette.text.primary }}
            >
              QUICK CASH
            </Typography>
          </Box>
        )}
        <IconButton onClick={toggleSidebar} size="small">
          <MenuIcon />
        </IconButton>
      </Box>

      <List sx={{ p: 1 }}>
        {menuItems.map((item) => {
          const isHovered = hoveredItem?.name === item.name;

          return (
            <Box
              key={item.name}
              onMouseEnter={(e) => handleMouseEnter(e, item)}
              onMouseLeave={handleMouseLeave}
              sx={{ position: 'relative' }}
            >
              <ListItem
                button
                className={clsx('menu-item', { 'active': location.pathname === item.path })}
                onClick={() => {
                  if (item.onClick) {
                    item.onClick();
                  } else if (item.hasDropdown) {
                    if (isOpen) {
                      setOpenDropdown(openDropdown === item.name ? null : item.name);
                    }
                  } else if (item.path) {
                    navigate(item.path);
                  }
                }}
              >
                <ListItemIcon className='menu-list-item'>
                  <span className="material-icons" style={{ color: theme.palette.text.primary, }}>{item.icon}</span>
                </ListItemIcon>

                {isOpen && (
                  <>
                    <ListItemText
                      className="menu-items-text"
                      primary={item.name}
                      classes={{ primary: 'menu-items-text-root' }}
                    />
                    {item.hasDropdown && (
                      <ExpandMoreIcon
                        className={clsx('expand-more-icon', {
                          expanded: openDropdown === item.name,
                        })}
                      />
                    )}
                  </>
                )}
              </ListItem>

              {/* Expanded mode dropdown */}
              {isOpen && openDropdown === item.name && item.subItems && (
                <List className="submenu">
                  {item.subItems.map((sub: any) => (
                    <ListItemButton
                      key={sub.name || sub}
                      className={clsx('submenu-item', {
                        'active': location.pathname === sub.path
                      })}
                      onClick={() => {
                        if (sub.path) {
                          navigate(sub.path);
                          // setOpenDropdown(null);
                        }
                      }}
                    >
                      <ListItemText
                        primary={sub.name || sub}
                        className="submenu-text"
                      />
                    </ListItemButton>
                  ))}
                </List>
              )}

              {/* Tooltip for collapsed sidebar (on hover) */}
              {!isOpen && isHovered && item.subItems && (
                <Popper
                  open={true}
                  anchorEl={anchorEl}
                  placement="right-start"
                  modifiers={[{ name: 'offset', options: { offset: [0, 4] } }]}
                  style={{ zIndex: 2000 }}
                >
                  <Paper
                    className='tooltip-paper'
                    sx={{ pointerEvents: 'auto' }}
                  >
                    <Typography>{item.name}</Typography>
                    <ul className="tooltip-submenu">
                      {item.subItems.map((sub: any) => (
                        <li
                          key={sub.name || sub}
                          className="tooltip-submenu-item"
                          style={{ cursor: 'pointer' }}
                          onClick={() => {
                            if (sub.path) {
                              navigate(sub.path);
                              handleMouseLeave();
                            }
                          }}
                        >
                          {typeof sub === 'string' ? sub : sub.name}
                        </li>
                      ))}
                    </ul>
                  </Paper>
                </Popper>
              )}
            </Box>
          );
        })}
      </List>

    </Box>
  );
};

export default Sidebar;

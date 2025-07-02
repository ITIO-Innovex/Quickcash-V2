import clsx from 'clsx';
import { useState } from 'react';
import { Menu as MenuIcon} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {Box, List, ListItem, ListItemIcon, ListItemText, Typography, IconButton, useTheme, Popper, Paper, ClickAwayListener, ListItemButton,} from '@mui/material';

type SidebarProps = {
  isOpen: boolean;
  toggleSidebar: () => void;
};

const Sidebar = ({ isOpen, toggleSidebar }: SidebarProps) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [hoveredItem, setHoveredItem] = useState<any>(null);

  const menuItems = [
    {
      name: 'Dashboard',
      icon: 'dashboard',
      path: '/admin/dashboard',
      subItems: ['Credit', 'Debit', 'Investing', 'Earning']
    },
     { name: 'UserList', icon: 'person', path: '/admin/user-list' },
   {
      name: 'Fiat',
      icon: 'confirmation_number',
      hasDropdown: true,
      subItems: [
        { name: 'Total Transactions', path: '/admin/transaction-list' },
        { name: 'Pending Transactions', path: '/admin/pending-transactions' },
      ]
    },
    {
      name: 'Crypto',
      icon: 'account_balance_wallet',
      hasDropdown: true,
      subItems: [
        { name: 'Wallet Request', path: '/admin/wallet-request' },
        { name: 'Crypto Transfer Request', path: '/admin/crypto-transfer' },
        { name: 'Coin List', path: '/admin/coin-list' },
      ]
    },
     {
      name: 'Admin',
      icon: 'person',
      hasDropdown: true,
      subItems: [
        { name: 'profile', path: '/admin/profile' },
        { name: 'Users', path: '/admin/subadmin' },
        { name: 'Revenue', path: '/admin/revenue' },
      ]
    },
    { name: 'Fee Details', icon: 'receipt', path: '/admin/fee-details' },
    { name: 'Tickets', icon: 'confirmation_number', path: '/admin/help-center' },
    { name: 'Notification', icon: 'assignment', path: '/admin/notifications' },
    { name: 'Invoice', icon: 'person', path: '/admin/invoices' },
    { name: 'Currency List', icon: 'card_giftcard', path: '/admin/currency-list' },
    {
      name: 'Kyc',
      icon: 'description',
      hasDropdown: true,
      subItems: [
        { name: 'User KYC', path: '/admin/user-kyc-details' },
        { name: 'Business KYC', path: '/admin/business-kyc-details' },
        { name: 'Mode', path: '/admin/kyc-mode' }
      ]
    },
  ];

  const handleMouseEnter = (event: React.MouseEvent<HTMLElement>, item: any) => {
    setAnchorEl(event.currentTarget);
    setHoveredItem(item);
  };

  const handleMouseLeave = () => {
    setAnchorEl(null);
    setHoveredItem(null);
  };

  return (
    <Box
      className={`user-sidebar ${isOpen ? 'open' : 'closed'}`}
      sx={{ backgroundColor: theme.palette.background.default, color: theme.palette.text.primary, boxShadow: theme.shadows[2], width: isOpen ? 200 : 60, overflow: 'visible', position: 'relative', zIndex: 1201,}}
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
        {menuItems.map((item) => (
          <Box key={item.name}>
            <ListItem
              button
              className={clsx('menu-item', { 'active': location.pathname === item.path })}
              onClick={() => {
                if (item.hasDropdown) {
                  setOpenDropdown(openDropdown === item.name ? null : item.name);
                } else if (item.path) {
                  navigate(item.path);
                }
              }}
              onMouseEnter={(e) => {
                if (!isOpen) handleMouseEnter(e, item);
              }}
              onMouseLeave={handleMouseLeave}
            >
              <ListItemIcon className='menu-list-item'>
                <span className="material-icons">{item.icon}</span>
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

            {/* Dropdown content */}
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
          </Box>
        ))}
      </List>

      {/* Tooltip Popper for collapsed sidebar */}
      <Popper
        open={!!hoveredItem}
        anchorEl={anchorEl}
        placement="right-start"
        modifiers={[{ name: 'offset', options: { offset: [0, 4] } }]}
        style={{ zIndex: 2000 }}
      >
        <ClickAwayListener onClickAway={handleMouseLeave}>
          <Paper className='tooltip-paper'>
            <Typography>{hoveredItem?.name}</Typography>
            {hoveredItem?.subItems && (
              <ul className="tooltip-submenu">
                {hoveredItem.subItems.map((sub: any) => (
                  <li key={sub.name || sub} className="tooltip-submenu-item">
                    {typeof sub === 'string' ? sub : sub.name}
                  </li>
                ))}
              </ul>
            )}
          </Paper>
        </ClickAwayListener>
      </Popper>
    </Box>
  );
};

export default Sidebar;

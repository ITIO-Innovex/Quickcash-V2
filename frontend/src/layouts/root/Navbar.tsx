import { Link, useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import MenuIcon from '@mui/icons-material/Menu';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { Box, IconButton, Button, useTheme, } from '@mui/material';
import CustomButton from '@/components/CustomButton';

 interface NavbarProps {
  toggleColorMode: () => void;
  mode: 'light' | 'dark';
}
const Navbar: React.FC<NavbarProps> = ({ toggleColorMode, mode }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const navbarBg = theme.palette.navbar?.background; 
  const navbarText = theme.palette.navbar?.text;
  const [menuOpen, setMenuOpen] = useState(false);

  const signup = () =>{
    navigate('/register');
  }
  const login = () =>{
    navigate('/login');
  }
  return (
    <Box component="nav" className="navbar"
    sx={{ backgroundColor: navbarBg ,color: navbarText,}}>
      {/* Logo */}
       <Link to="/" className="navbar-logo">
          <img src="/logo.png" alt="Quick Cash Logo" className="logo-img" />
        </Link>

      {/* Mobile menu icon */}
      <IconButton
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
        className="menu-toggle"
      >
        <MenuIcon />
      </IconButton>

      {/* Nav links */}
      <Box
        component="ul"
        className={`navbar-links ${menuOpen ? 'open' : ''}`}
        sx={{
          backgroundColor: navbarBg,
          color: navbarText,
          padding: 2,
          '& a, & button': {
            color: navbarText,
          },
        }}
      >
        <Box component="li"  >
          <Button href="#" color="inherit">Blog</Button>
        </Box>
       <Box component="li" >
        <Button color="inherit" component={Link} to="/contact">
          Contact Us
        </Button>
      </Box>
        {/* Auth links */}
        <Box component="li" className="auth-links">
            <Button href="#" color="inherit" onClick={login} >Login</Button>
          </Box>
          <Box component="li">
            <CustomButton  color="inherit" variant="contained" className="cta" onClick={signup}>
              CREATE FREE ACCOUNT
            </CustomButton>
        </Box>
         <IconButton sx={{ ml: 1 }} onClick={toggleColorMode} color="inherit">
             {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
      </Box>
    </Box>
  );
};

export default Navbar;


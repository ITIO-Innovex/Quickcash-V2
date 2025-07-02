import { Box, Typography, Link, IconButton } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';

const Footer = () => {
  return (
    <Box className="footer">
      <Box className="footer-content">
        <Typography variant="h5" className="footer-logo">
          Quick Cash
        </Typography>

        <Box className="footer-links">
          <Link href="#" underline="none" className="footer-link">
            Login
          </Link>
          <Link href="#" underline="none" className="footer-link">
            Get Started
          </Link>
          <Link href="#" underline="none" className="footer-link">
            Privacy Policy
          </Link>
        </Box>

        <Box className="footer-socials">
          <IconButton>
            <FacebookIcon />
          </IconButton>
          <IconButton>
            <TwitterIcon />
          </IconButton>
          <IconButton>
            <InstagramIcon />
          </IconButton>
        </Box>
      </Box>

      <Typography variant="body2" className="footer-bottom">
        Copyright © 2025 Quick Cash. All rights reserved.
      </Typography>
    </Box>
  );
};

export default Footer;

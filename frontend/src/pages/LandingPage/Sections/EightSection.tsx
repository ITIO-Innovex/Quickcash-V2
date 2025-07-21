import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const EightSection = () => {
  const navigate = useNavigate();
   const login = () => {
    navigate('/login');
  }
  return (
    <Box className="eight-section">
      <img src="/firstImage.svg" alt="Left" className="corner-image left" />
      <img src="/secondImage.svg" alt="Right" className="corner-image right" />

      <Box className="content-wrapper">
        <Typography variant="h4" className="eight-text">
          Empower Your Business with Quick Cash
        </Typography>
        <Button className="btn btn-primary" onClick={login}>Get Started</Button>
      </Box>
    </Box>
  );
};

export default EightSection;

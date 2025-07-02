import { Box, Typography, Button } from '@mui/material';

const EightSection = () => {
  return (
    <Box className="eight-section">
      <img src="/firstImage.svg" alt="Left" className="corner-image left" />
      <img src="/secondImage.svg" alt="Right" className="corner-image right" />

      <Box className="content-wrapper">
        <Typography variant="h4" className="eight-text">
          Empower Your Business with Quick Cash
        </Typography>
        <Button className="btn btn-primary">Get Started</Button>
      </Box>
    </Box>
  );
};

export default EightSection;

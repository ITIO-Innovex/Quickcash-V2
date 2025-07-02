import { Typography, Box} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants';
import React from 'react';
import CustomButton from '@/components/CustomButton';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        fontFamily: "Fira Sans, serif !important"
      }}
    >
      <Typography variant="h1" gutterBottom>
        404
      </Typography>
      <Typography variant="h5" gutterBottom>
        Page Not Found
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        The page you are looking for doesn't exist or has been moved.
      </Typography>
      <CustomButton variant="contained" onClick={() => navigate(ROUTES.HOME)}>
        Go to Home
      </CustomButton>
    </Box>
  );
};

export default NotFound;

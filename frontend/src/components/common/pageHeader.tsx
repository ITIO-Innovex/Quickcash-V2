import React from 'react';
import { Box, Typography, IconButton, useTheme } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import CustomButton from '../CustomButton';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  title: string;
  buttonText?: string;
  onButtonClick?: () => void;
  showBackButton?: boolean; // optional flag
}

const PageHeader: React.FC<HeaderProps> = ({
  title,
  buttonText,
  onButtonClick,
  showBackButton = true,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1); // goes one step back in history
  };

  return (
    <Box className="header-container">
      <Box className="header-top" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box className="arrow-wrapper"sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {showBackButton && (
            <IconButton onClick={handleBack} sx={{ color: theme.palette.text.primary }}>
              <ArrowBackIcon />
            </IconButton>
          )}
          <Typography
            variant="h5"
            component="h1"
            className="stat-heading"
            sx={{ color: theme.palette.text.primary }}
          >
            {title}
          </Typography>
        </Box>

        {buttonText && (
          <CustomButton
            className="custom-button"
            onClick={onButtonClick}
            disabled={!onButtonClick}
          >
            <AddIcon className="icon-size" />
            <span className="button-text">{buttonText}</span>
          </CustomButton>
        )}
      </Box>

      <div className="header-divider" />
    </Box>
  );
};

export default PageHeader;


import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';

interface NotificationItemProps {
  title: string;
  timestamp: string;
  isRead?: boolean;
  onClick?: () => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  title,
  timestamp,
  isRead = false,
  onClick,
}) => {
  const theme = useTheme();

  return (
    <Box
      onClick={onClick}
      sx={{
        p: 2,
        borderBottom: `1px solid ${theme.palette.divider}`,
        cursor: 'pointer',
        backgroundColor: isRead 
          ? 'transparent' 
          : theme.palette.action.hover,
        '&:hover': {
          backgroundColor: theme.palette.action.selected,
        },
        '&:last-child': {
          borderBottom: 'none',
        },
      }}
    >
      <Typography
        variant="body2"
        sx={{
          color: theme.palette.primary.main,
          fontWeight: isRead ? 400 : 600,
          mb: 0.5,
          lineHeight: 1.4,
        }}
      >
        {title}
      </Typography>
      <Typography
        variant="caption"
        sx={{
          color: theme.palette.text.secondary,
          fontSize: '0.75rem',
        }}
      >
        {timestamp}
      </Typography>
    </Box>
  );
};

export default NotificationItem;

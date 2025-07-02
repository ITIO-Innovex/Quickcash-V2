import React from 'react';
import { Paper, Box, Typography, Avatar, IconButton } from '@mui/material';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

const QuickActionCard = ({ icon, title, description, color = '#483594', selected = false, onClick }) => {
  return (
    <Paper
      elevation={0}
      onClick={onClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        p: 3,
        borderRadius: 2,
        border: selected ? '2px solid #483594' : '1px solid #e5e7eb',
        background: selected ? 'linear-gradient(90deg, #eaf1fb 0%, #f6faff 100%)' : '#fff',
        boxShadow: selected ? 2 : 0,
        cursor: 'pointer',
        transition: 'box-shadow 0.2s, border 0.2s, background 0.2s',
        minHeight: 120,
        '&:hover': {
          boxShadow: 4,
          border: '2px solid #483594',
          background: 'linear-gradient(90deg, #eaf1fb 0%, #f6faff 100%)',
        },
      }}
    >
      <Avatar sx={{ bgcolor: color, width: 48, height: 48 }}>
        {icon}
      </Avatar>
      <Box sx={{ flex: 1 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: selected ? '#2563eb' : '#222' }}>{title}</Typography>
        <Typography variant="body2" sx={{ color: selected ? '#2563eb' : '#555', mt: 0.5 }}>{description}</Typography>
      </Box>
      <IconButton disableRipple sx={{ color: selected ? '#2563eb' : '#bdbdbd', background: 'transparent', ml: 1 }}>
        <ArrowForwardIosIcon />
      </IconButton>
    </Paper>
  );
};

export default QuickActionCard; 
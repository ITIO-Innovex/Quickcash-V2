import React from 'react';
import { Grid, Paper, Typography, Box, Stack, Avatar } from '@mui/material';

const StatsRow = ({ stats, spacing = 2, containerSx = {}, itemSx = {} }) => {
  return (
    <Grid container spacing={spacing} sx={{ mb: 2, ...containerSx }}>
      {stats.map((stat, idx) => (
        <Grid item xs={12} sm={6} md={3} key={idx} sx={itemSx}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2, 
              borderRadius: 1, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'flex-start', 
              gap: 1,
              border: '1px solid #e5e7eb',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                boxShadow: 2,
                transform: 'translateY(-2px)',
              }
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              <Avatar sx={{ bgcolor: '#eaf1fb', width: 48, height: 48 }}>
                {stat.icon}
              </Avatar>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  {stat.label}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {stat.value}
                </Typography>
              </Box>
            </Stack>
            {stat.change && (
              <Typography 
                variant="caption" 
                sx={{ 
                  color: stat.changeColor || 'success.main', 
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5
                }}
              >
                {stat.change}
              </Typography>
            )}
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
};

export default StatsRow; 
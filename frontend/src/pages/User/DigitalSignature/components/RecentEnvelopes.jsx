import React from 'react';
import { Box, Typography, Paper, Stack, Chip, LinearProgress, Button } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';

const statusStyles = {
  Completed: { label: 'Completed', color: '#111827', bg: '#F3F4F6' },
  Pending: { label: 'Pending', color: '#374151', bg: '#F3F4F6' },
  'In Progress': { label: 'In Progress', color: '#374151', bg: '#F3F4F6' },
};

const progressColors = {
  Completed: '#22c55e', // green
  Pending: '#3b82f6',   // blue
  'In Progress': '#f59e42', // orange
};

const RecentEnvelopes = ({ envelopes = [], onViewAll }) => {
  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>Recent Documents</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Your latest document activity</Typography>
      <Stack spacing={2}>
        {envelopes.map((env, idx) => {
          const status = statusStyles[env.status] || statusStyles['Pending'];
          const progressColor = progressColors[env.status] || '#3b82f6';
          return (
            <Paper
              key={env.id || idx}
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 3,
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 2px rgba(16,30,54,0.04)',
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
              }}
            >
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{env.title}</Typography>
                <Chip
                  label={status.label}
                  size="small"
                  sx={{
                    fontWeight: 600,
                    fontSize: 13,
                    color: status.color,
                    background: '#F3F4F6',
                    borderRadius: 2,
                    px: 1.5,
                  }}
                />
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {env.id} • {env.signers} signers • {env.date}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={env.progress}
                sx={{
                  height: 7,
                  borderRadius: 5,
                  background: '#E5E7EB',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: progressColor,
                    borderRadius: 5,
                  },
                  mb: 0.5,
                }}
              />
              <Typography variant="caption" sx={{ color: '#374151', fontWeight: 500 }}>
                {env.progress}% complete
              </Typography>
            </Paper>
          );
        })}
      </Stack>
      <Button
        fullWidth
        variant="outlined"
        startIcon={<VisibilityIcon />}
        sx={{
          mt: 3,
          borderRadius: 2,
          fontWeight: 600,
          fontSize: 16,
          py: 1.2,
          textTransform: 'none',
          borderColor: '#e5e7eb',
          color: '#222',
          background: '#fff',
          '&:hover': {
            background: '#f3f4f6',
            borderColor: '#d1d5db',
          },
        }}
        onClick={onViewAll}
      >
        View All Envelopes
      </Button>
    </Box>
  );
};

export default RecentEnvelopes; 
import React from 'react';
import { Box, Typography, Stack } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { CircularProgressbarWithChildren, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const CompletionRateChart = ({ completed = 25, pending = 75 }) => {
  const total = completed + pending;
  const completedPercent = total ? (completed / total) * 100 : 0;

  return (
    <Box sx={{ width: 270, p: 2, mx: 'auto' }}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <CheckCircleIcon sx={{ color: '#22c55e', fontSize: 28 }} />
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Completion Rate
        </Typography>
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, ml: 4 }}>
        Document signing success
      </Typography>
      <Box sx={{ width: 180, height: 180, mx: 'auto', mb: 2 }}>
        <CircularProgressbarWithChildren
          value={completedPercent}
          strokeWidth={10}
          styles={buildStyles({
            pathColor: '#22c55e',
            trailColor: '#fbbf24',
            strokeLinecap: 'butt',
          })}
        >
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#222' }}>
            {Math.round(completedPercent)}%
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            Success Rate
          </Typography>
        </CircularProgressbarWithChildren>
      </Box>
      <Stack direction="row" spacing={3} justifyContent="center">
        <Stack direction="row" alignItems="center" spacing={1}>
          <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: '#22c55e' }} />
          <Typography variant="body2">Completed</Typography>
        </Stack>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: '#fbbf24' }} />
          <Typography variant="body2">Pending</Typography>
        </Stack>
      </Stack>
    </Box>
  );
};

export default CompletionRateChart; 
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, LinearProgress } from '@mui/material';

interface CountdownTimerProps {
  duration?: number; 
  onTimeout?: () => void; 
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ duration = 600, onTimeout }) => {
  const [secondsLeft, setSecondsLeft] = useState(duration);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (onTimeout) {
            onTimeout();
          } else {
            navigate(-1); 
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate, onTimeout]);

  const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const seconds = String(secondsLeft % 60).padStart(2, '0');
  const progress = ((duration - secondsLeft) / duration) * 100;

  return (
    <>
      <Typography
        variant="body2"
        sx={{ color: '#666', textAlign: 'center' }}
      >
        Time Remaining: {minutes}:{seconds}
      </Typography>

      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{
          mt: 1,
          height: 8,
          borderRadius: 5,
          backgroundColor: '#e0e0e0',
          '& .MuiLinearProgress-bar': {
            backgroundColor: '#483594'
          }
        }}
      />
    </>
  );
};

export default CountdownTimer;

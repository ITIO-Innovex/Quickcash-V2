import { Box, Grid, Typography, Skeleton } from '@mui/material';
import { User, Banknote, Wallet } from 'lucide-react';

interface SecondRightSectionProps {
  summary: any;
  loaderResult: boolean;
}

const SecondRightSection = ({ summary, loaderResult }: SecondRightSectionProps) => {
  const stats = [
    {
      label: 'Total Users',
      value: summary?.totalUsers ?? 0,
      icon: <User className="stat-icon" />,
      className: 'card-green',
    },
    // {
    //   label: 'New Users',
    //   value: (summary?.totalUsers ?? 0) - (summary?.pendingUsers ?? 0),
    //   icon: <Banknote className="stat-icon" />,
    //   className: 'card-teal',
    // },
    {
      label: 'Pending Users',
      value: summary?.pendingUsers ?? 0,
      icon: <Wallet className="stat-icon" />,
      className: 'card-blue',
    },
  ];

  return (
    <Box className="dashboard-box">
      <Grid container spacing={2}>
        {stats.map((stat) => (
          <Grid item xs={12} sm={4} key={stat.label}>
            <Box className={`stat-card ${stat.className}`}>
              <Box className="stat-content">
                <Box className="stat-text">
                  <Typography variant="h6" className="stat-value">
                    {loaderResult ? <Skeleton width={40} /> : stat.value}
                  </Typography>
                  <Typography className="stat-label">
                    {loaderResult ? <Skeleton width={60} /> : stat.label}
                  </Typography>
                </Box>
                <Box className="stat-icon-box">{stat.icon}</Box>
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default SecondRightSection;

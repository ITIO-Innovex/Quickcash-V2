import { DollarSign } from 'lucide-react';
import 'react-circular-progressbar/dist/styles.css';
import { Box, Typography, Grid, Paper, useTheme, Skeleton } from '@mui/material';
import { ArrowUpward, ArrowDownward } from '@mui/icons-material';
import { CircularProgressbarWithChildren, buildStyles } from 'react-circular-progressbar';

interface FirstRightSectionProps {
  summary: any;
  loaderResult: boolean;
}

const FirstRightSection = ({ summary, loaderResult }: FirstRightSectionProps) => {
  const theme = useTheme();

  // Calculate total for percent calculation
  const credit = Number(summary?.credit ?? 0);
  const debit = Number(summary?.debit ?? 0);
  const total = credit + debit || 1; // avoid division by zero

  const stats = [
    {
      label: 'Credit',
      value: credit,
      percent: ((credit / total) * 100),
      color: '#2dd4bf',
      icon: <ArrowUpward sx={{ fontSize: 32, color: '#2dd4bf' }} />,
    },
    {
      label: 'Debit',
      value: debit,
      percent: ((debit / total) * 100),
      color: '#f97316',
      icon: <ArrowDownward sx={{ fontSize: 32, color: '#f97316' }} />,
    },
    {
      label: 'Revenue',
      value: Number(summary?.totalRevenue ?? 0),
      percent: 100,
      color: '#4d7c0f',
      icon: <DollarSign size={32} color="#4d7c0f" />,
    },
  ];

  return (
    <Box className="dashboard-box">
      <Grid container spacing={10}>
        {stats.map((stat) => (
          <Grid item xs={12} sm={4} key={stat.label}>
            <Paper className="top-charts" sx={{ backgroundColor: theme.palette.background.default }}>
              <Box className="chart-start">
                <div className={`progressbar-wrapper ${stat.color}`}>
                  {loaderResult ? (
                    <Skeleton variant="circular" width={120} height={120} />
                  ) : (
                    <CircularProgressbarWithChildren
                      value={stat.percent}
                      strokeWidth={10}
                      styles={buildStyles({
                        pathColor: stat.color,
                        trailColor: '#e5e7eb',
                      })}
                    >
                      <Box className="progress-content">
                        {stat.icon}
                        <Typography variant="subtitle2" fontWeight="bold">
                          {stat.label}
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                          ${stat.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </Typography>
                      </Box>
                    </CircularProgressbarWithChildren>
                  )}
                </div>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default FirstRightSection;

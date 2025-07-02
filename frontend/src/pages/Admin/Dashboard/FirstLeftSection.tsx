import PersonIcon from '@mui/icons-material/Person';
import { Box, Grid, Typography, Skeleton } from '@mui/material';
import BarChartIcon from '@mui/icons-material/BarChart';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';

interface FirstLeftSectionProps {
  summary: any;
  loaderResult: boolean;
}

const FirstLeftSection = ({ summary, loaderResult }: FirstLeftSectionProps) => {

  const cardData = [
    { icon: <PersonIcon fontSize="large" />, value: summary?.totalAccount ?? 0, label: 'Total Account' },
    { icon: <HourglassEmptyIcon fontSize="large" />, value: summary?.wallet ?? 0, label: 'Total Wallet' },
    {
      icon: <BarChartIcon fontSize="large" />, value: summary?.transactionsallTotal !== undefined && summary?.transactionsallTotal !== null
        ? summary.transactionsallTotal.toFixed(2)
        : '0.00',
      label: 'Total Transactions'
    },
  ];

  return (
    <Box className="dashboard-box left-section">
      <Grid container spacing={2}>
        {cardData.map((card, idx) => (
          <Grid item xs={12} sm={6} md={12} key={idx}>
            <Box className="metric-card">
              <div className="metric-icon">{card.icon}</div>
              <div className="metric-info">
                {loaderResult ? (
                  <Skeleton variant="text" width={60} height={40} />
                ) : (
                  <Typography className="metric-value">{card.value}</Typography>
                )}
                <Typography className="metric-label">{card.label}</Typography>
              </div>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default FirstLeftSection;

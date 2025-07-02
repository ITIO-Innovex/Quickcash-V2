import { Grid, Box, Skeleton } from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

const COLORS = ['#58aa91', '#1e88e5', '#aa58a7', '#9858aa', '#3d5afe'];

interface ThirdLeftSectionProps {
  walletItems: Record<string, number> | undefined;
  loaderResult: boolean;
}

const ThirdLeftSection = ({ walletItems, loaderResult }: ThirdLeftSectionProps) => {
  const data = walletItems
    ? Object.entries(walletItems).map(([name, value]) => ({
      name,
      value,
    }))
    : [];

  return (
    <Grid className="wallet-card">
      <Box className='wallet-detail'>Wallet Overview</Box>
      <Grid className="wallet-chart-container">
        {loaderResult ? (
          <Skeleton variant="rectangular" width="100%" height={280} />
        ) : (
          <ResponsiveContainer height={280}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
                label={({ percent }) => `${(percent * 100).toFixed(2)}%`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: '10px',
                  backgroundColor: '#fff',
                  border: '1px solid #ccc',
                  padding: '10px',
                  boxShadow: '0px 4px 12px rgba(0,0,0,0.1)',
                }}
                formatter={(value, name) => [value, name]}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </Grid>
    </Grid>
  );
};

export default ThirdLeftSection;

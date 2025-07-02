import { Box, Grid, MenuItem, Select, Typography } from '@mui/material';
import { useEffect, useState } from 'react';

const coinOptions = [
  'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'XRPUSDT', 'SOLUSDT',
  'ADAUSDT', 'DOGEUSDT', 'DOTUSDT', 'MATICUSDT', 'LTCUSDT', 'USDTUSDT',
];

type FirstSectionProps = {
  selectedCoin: string;
  onCoinChange: (coin: string) => void;
};

const FirstSection = ({ selectedCoin, onCoinChange }: FirstSectionProps) => {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${selectedCoin}`);
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error('Failed to fetch stats', err);
      }
    };

    if (selectedCoin) fetchStats();
  }, [selectedCoin]);

  return (
    <Box className="spot-container">
      {stats && (
        <Box className="stats-wrapper">
          <Select
            value={selectedCoin}
            onChange={(e) => onCoinChange(e.target.value)}
            size="small"
            className="coin-select"
          >
            {coinOptions.map((coin) => (
              <MenuItem key={coin} value={coin}>
                <Box className="select-item">
                  <img
                    className="coin-icon"
                    src={`https://assets.coincap.io/assets/icons/${coin.toLowerCase().replace(/usdt$/i, '')}@2x.png`}
                    alt="coin"
                  />
                  <span>{coin.replace('USDT', '')}</span>
                </Box>
              </MenuItem>
            ))}
          </Select>

          <Grid className="stat-box">
            <Typography className="stat-label">24h Change</Typography>
            <Typography
              className={`stat-value ${parseFloat(stats.priceChangePercent) >= 0 ? 'positive' : 'negative'}`}
            >
              {parseFloat(stats.priceChange).toFixed(2)} ({parseFloat(stats.priceChangePercent).toFixed(2)}%)
            </Typography>
          </Grid>

          <Grid className="stat-box">
            <Typography className="stat-label">24h High</Typography>
            <Typography className="stat-value">{parseFloat(stats.highPrice).toLocaleString()}</Typography>
          </Grid>

          <Grid className="stat-box">
            <Typography className="stat-label">24h Low</Typography>
            <Typography className="stat-value">{parseFloat(stats.lowPrice).toLocaleString()}</Typography>
          </Grid>

          <Grid className="stat-box">
            <Typography className="stat-label">24h Volume (BTC)</Typography>
            <Typography className="stat-value">{parseFloat(stats.volume).toLocaleString()}</Typography>
          </Grid>

          <Grid className="stat-box">
            <Typography className="stat-label">24h Volume (USDT)</Typography>
            <Typography className="stat-value">{parseFloat(stats.quoteVolume).toLocaleString()}</Typography>
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default FirstSection;

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Card, Typography } from '@mui/material';

interface CoinData {
  symbol: string;
  lastPrice: string;
  priceChangePercent: string;
}

const MarqueeSection = () => {
  const [coinData, setCoinData] = useState<CoinData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          'https://api.binance.com/api/v3/ticker?symbols=[%22BTCUSDT%22,%22BNBUSDT%22,%22SOLUSDT%22,%22SHIBUSDT%22,%22ETHUSDT%22,%22DOGEUSDT%22,%22USDCUSDT%22,%22ADAUSDT%22,%22XRPUSDT%22]'
        );
        setCoinData(response.data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, []);

  const getCoinName = (symbol: string) => symbol.replace('USDT', '');
  const getCoinIconUrl = (symbol: string) =>
    `https://assets.coincap.io/assets/icons/${symbol.replace('USDT', '').toLowerCase()}@2x.png`;

  return (

      <Box className="crypto-section">
        <Box className="marquee-box">
          {[...coinData, ...coinData].map((item, index) => (
            <Card className="crypto-scroll-card" key={`${item.symbol}-${index}`}>
              <img
                className="coin-icon"
                src={getCoinIconUrl(item.symbol)}
                alt={item.symbol}
                style={{ width: '24px', height: '24px', marginBottom: '4px' }}
              />
              <Typography sx={{ fontWeight: 600, color: '#1f2937' }}>
                {getCoinName(item.symbol)}
              </Typography>
              <Typography sx={{ color: '#374151' }}>
                ${Number(item.lastPrice).toLocaleString()}
              </Typography>
              <Typography sx={{ color: '#ef4444', fontSize: '0.875rem' }}>
                {Number(item.priceChangePercent).toFixed(2)}%
              </Typography>
            </Card>
          ))}
        </Box>
      </Box>
  );
};

export default MarqueeSection;

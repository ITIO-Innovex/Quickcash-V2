import React, { useEffect, useState } from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import FormPage from './FormPage';

type PriceData = {
  price: string;
  change: string;
};
const coins = ['btcusdt', 'ethusdt', 'xrpusdt', 'bnbusdt', 'trxusdt', 'solusdt'];

const CryptoRatesSection = () => {
  const theme = useTheme();
  const [prices, setPrices] = useState<Record<string, PriceData>>({});
  const [usdtToInr, setUsdtToInr] = useState<number>(0);

  // Fetch INR conversion
  useEffect(() => {
    fetch('https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=inr')
      .then((res) => res.json())
      .then((data) => setUsdtToInr(data.tether.inr));
  }, []);

  // Binance WS
useEffect(() => {
  const streamUrl = `wss://stream.binance.com:9443/stream?streams=${coins
    .map((coin) => `${coin}@ticker`)
    .join('/')}`;

  console.log('Connecting to WebSocket:', streamUrl); // ✅ debug URL

  const ws = new WebSocket(streamUrl);

  ws.onopen = () => {
    console.log('WebSocket connection established ✅');
  };

  ws.onerror = (err) => {
    console.error('WebSocket error ❌', err);
  };

  ws.onclose = (e) => {
    console.warn('WebSocket closed ⚠️', e);
  };

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    const coinSymbol = data.data.s.toLowerCase();

    const priceInINR = parseFloat(data.data.c) * usdtToInr;

    setPrices((prev) => ({
      ...prev,
      [coinSymbol]: {
        price: priceInINR.toLocaleString('en-IN', {
          style: 'currency',
          currency: 'INR',
        }),
        change: parseFloat(data.data.P).toFixed(2),
      },
    }));
  };

  return () => ws.close();
}, [usdtToInr]);


  return (
 <Box className="buy-sell-swap-container">
  <Box className="crypto-box left" sx={{backgroundColor:theme.palette.background.default}}>
    <Typography className="Left-heading" variant="h5" sx={{color:theme.palette.text.primary,mb:'3rem'}}>
      Hot Cryptos
    </Typography>
    <Box className="crypto-list">
      {coins.map((coin) => {
        const data = prices[coin];
        const coinName = coin.replace('usdt', '').toUpperCase();

        return (
          <Box key={coin} className="crypto-card">
            <Box className="coin-left">
              <img
                src={`https://assets.coincap.io/assets/icons/${coinName.toLowerCase()}@2x.png`}
                alt={coinName}
                className="coin-icon"
              />
              <span className="coin-name">{coinName}</span>
            </Box>
            {data ? (
              <Box className="coin-right">
                <span className="coin-price">{data.price}</span>
                <span
                  className={`coin-change ${
                    parseFloat(data.change) >= 0 ? 'positive' : 'negative'
                  }`}
                >
                  {parseFloat(data.change) >= 0 ? '+' : ''}
                  {data.change}%
                </span>
              </Box>
            ) : (
              <span className="coin-loading">Loading...</span>
            )}
          </Box>
        );
      })}
    </Box>
  </Box>

  <Box className="crypto-box right">
    <FormPage/>
  </Box>
</Box>


  );
};

export default CryptoRatesSection;

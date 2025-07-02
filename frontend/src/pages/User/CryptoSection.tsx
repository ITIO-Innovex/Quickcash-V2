import { Box, Card, Typography } from '@mui/material';

const CryptoSection = () => {
  const cryptoRates = [
    { name: 'BTC', value: '850000000', change: '-6.52%', icon: '₿' },
    { name: 'ADA', value: '$97.85', change: '-6.52%', icon: '₳' },
    { name: 'DOGE', value: '$97850000000', change: '-6.52%', icon: 'Ð' },
    { name: 'SOL', value: '$97850000000', change: '-6.52%', icon: '◎' },
    { name: 'SHIB', value: '$97.85', change: '-6.52%', icon: '🐕' },
  ];

  return (
    <Box sx={{ mb: 4 }}>
      <Typography sx={{ fontWeight: 'bold',  mb: 2 }}>
        Crypto exchange rate overview
      </Typography>

      <Box className='crypto-section' >
       
        <Box className='marquee-box'>
          {[...cryptoRates, ...cryptoRates].map((crypto, index) => (
            <Card className='crypto-scroll-card'
              key={`${crypto.name}-${index}`}
             >
              <Typography sx={{ fontWeight: 'bold', color: '#4f46e5' }}>
                {crypto.icon}
              </Typography>
              <Typography sx={{ fontWeight: 600, color: '#1f2937' }}>
                {crypto.name}
              </Typography>
              <Typography sx={{ color: '#374151' }}>{crypto.value}</Typography>
              <Typography sx={{ color: '#ef4444', fontSize: '0.875rem' }}>
                {crypto.change}
              </Typography>
            </Card>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default CryptoSection;

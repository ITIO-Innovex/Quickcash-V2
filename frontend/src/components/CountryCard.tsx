import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import Flag from 'react-world-flags';

interface CountryCardProps {
  countryCode: string;
  currencyCode: string;
  id: string;
  selected?: boolean;
  onClick: () => void;
  className?: string;
  balance?: string;
  currencySymbol?: string;
}

// Map for custom flag images (add your EU flag image to public folder as /eu-flag.png)
const customFlags: Record<string, string> = {
  EU: '/eu-flag.png', // Place your EU flag image in the public folder
  // Add more custom flags if needed
};

const CountryCard: React.FC<CountryCardProps> = ({
  countryCode,
  currencyCode,
  id,
  selected = false,
  onClick,
  className = '',
  balance,
  currencySymbol,
}) => {
  const theme = useTheme();
  const flagSrc = customFlags[countryCode];

  return (
    <Box
      onClick={onClick}
      className={`country-card ${selected ? 'selected' : ''} ${className}`}
      sx={{
        background: '#fff',
        borderRadius: '16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        border: selected ? '2px solid #7c3aed' : '2px solid #eee',
        cursor: 'pointer',
        p: 3,
        textAlign: 'center',
        minHeight: 220,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        transition: 'border 0.2s',
        '&:hover': {
          border: '2px solid #7c3aed',
        },
      }}
    >
      <Box
        sx={{
          width: 80,
          height: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 2,
          borderRadius: '8px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
          overflow: 'hidden',
        }}
      >
        {flagSrc ? (
          <img src={flagSrc} alt={countryCode} style={{ width: 80, height: 56, objectFit: 'cover' }} />
        ) : (
          <Flag code={countryCode} height="56" />
        )}
      </Box>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5, color: theme.palette.text.primary }}>
        {countryCode}
      </Typography>
      <Typography variant="subtitle2" color="text.secondary" fontWeight={600} sx={{ color: theme.palette.text.gray }}>
        {currencyCode}
      </Typography>
      {balance && (
        <Typography variant="body2" className="country-balance" sx={{ color: theme.palette.success.main, fontWeight: 'bold', mt: 1 }}>
          {currencySymbol || ''}{balance}
        </Typography>
      )}
    </Box>
  );
};

export default CountryCard;

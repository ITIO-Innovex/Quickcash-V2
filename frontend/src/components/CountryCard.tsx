
import React from 'react';
import { Card, CardContent, Typography, Box, useTheme } from '@mui/material';
import Flag from 'react-world-flags';

interface CountryCardProps {
  countryCode: string;
  currencyCode: string;
  id: string;
  selected?: boolean;
  onClick: () => void;
  className?: string;
}

const CountryCard: React.FC<CountryCardProps> = ({
  countryCode,
  currencyCode,
  id,
  selected = false,
  onClick,
  className = '',
}) => {

  const theme = useTheme();
  return (
    <Card
      className={`country-card ${selected ? 'selected' : ''} ${className}`}
      onClick={onClick}
      sx={{ cursor: 'pointer', height: '100%' }}
    >
      <CardContent className="country-card-content" >
        <Box className="country-flag" sx={{ mb: 2 }}>
          <Flag code={countryCode} height="40" />
        </Box>
        <Typography variant="h6" className="country-code" sx={{color:theme.palette.text.primary}}>
          {countryCode}
        </Typography>
        <Typography variant="body2" className="country-currency" sx={{color:theme.palette.text.gray}}>
          {currencyCode}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default CountryCard;

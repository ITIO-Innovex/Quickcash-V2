import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  useTheme,
} from '@mui/material';
import { getRecommendedTransferMethod, getAvailableTransferMethods } from '@/utils/transferMethodUtils';

const TransferMethodTest: React.FC = () => {
  const theme = useTheme();
  const [selectedCountry, setSelectedCountry] = useState('DE');
  const [selectedCurrency, setSelectedCurrency] = useState('EUR');
  const [result, setResult] = useState<any>(null);

  const testCountries = [
    { code: 'DE', name: 'Germany', currency: 'EUR' },
    { code: 'FR', name: 'France', currency: 'EUR' },
    { code: 'US', name: 'United States', currency: 'USD' },
    { code: 'IN', name: 'India', currency: 'INR' },
    { code: 'GB', name: 'United Kingdom', currency: 'GBP' },
  ];

  const handleTest = () => {
    const recommended = getRecommendedTransferMethod(selectedCountry, selectedCurrency);
    const available = getAvailableTransferMethods(selectedCountry, selectedCurrency);
    
    setResult({
      recommended,
      available,
      country: selectedCountry,
      currency: selectedCurrency
    });
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" sx={{ mb: 3, color: theme.palette.text.primary }}>
        Transfer Method Selection Test
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Test Parameters
          </Typography>
          
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={6}>
              <Typography variant="subtitle2">Country:</Typography>
              <select 
                value={selectedCountry} 
                onChange={(e) => setSelectedCountry(e.target.value)}
                style={{ width: '100%', padding: '8px', marginTop: '4px' }}
              >
                {testCountries.map(country => (
                  <option key={country.code} value={country.code}>
                    {country.name} ({country.code})
                  </option>
                ))}
              </select>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle2">Currency:</Typography>
              <select 
                value={selectedCurrency} 
                onChange={(e) => setSelectedCurrency(e.target.value)}
                style={{ width: '100%', padding: '8px', marginTop: '4px' }}
              >
                <option value="EUR">EUR - Euro</option>
                <option value="USD">USD - US Dollar</option>
                <option value="INR">INR - Indian Rupee</option>
                <option value="GBP">GBP - British Pound</option>
              </select>
            </Grid>
          </Grid>

          <Button 
            variant="contained" 
            onClick={handleTest}
            sx={{ bgcolor: theme.palette.primary.main }}
          >
            Test Transfer Method Selection
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Results for {result.country} ({result.currency})
            </Typography>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                Recommended Method:
              </Typography>
              <Card sx={{ bgcolor: 'success.light', color: 'white' }}>
                <CardContent sx={{ py: 1 }}>
                  <Typography variant="body1">
                    {result.recommended.title} - {result.recommended.description}
                  </Typography>
                  <Typography variant="body2">
                    Fee: ${result.recommended.fee} • Time: {result.recommended.time}
                  </Typography>
                </CardContent>
              </Card>
            </Box>

            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                Available Methods:
              </Typography>
              <Grid container spacing={2}>
                {result.available.map((method: any, index: number) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Card sx={{ 
                      border: method.methodId === result.recommended.methodId ? '2px solid green' : '1px solid #ddd'
                    }}>
                      <CardContent>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {method.title}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {method.description}
                        </Typography>
                        <Typography variant="caption">
                          Fee: ${method.fee} • Time: {method.time}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default TransferMethodTest; 
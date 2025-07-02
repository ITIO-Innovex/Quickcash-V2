import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ReactCountryFlag from "react-country-flag";

const BeneficiaryAccountsList = () => {
  const theme = useTheme();

  // ✅ Static dummy data
  const [accounts] = useState([
    {
      currency: 'USD',
      code: 'US',
      balance: '1200.00',
      iban: 'US64SVBKUS6S3300958879',
      bic: 'SVBKUS6S',
    },
    {
      currency: 'INR',
      code: 'IN',
      balance: '56000.00',
      iban: 'IN12HDFC000123456789',
      bic: 'HDFCINBB',
    },
    {
      currency: 'EUR',
      code: 'FR',
      balance: '3100.55',
      iban: 'FR1420041010050500013M02606',
      bic: 'PSSTFRPP',
    },
  ]);

  return (
    <Box sx={{ backgroundColor: theme.palette.background.default, color: theme.palette.text.primary }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Beneficiary Accounts List
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {accounts.map((account, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              p: 2,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 1,
              color: theme.palette.text.primary,
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ReactCountryFlag
                countryCode={account.code}
                svg
                style={{
                  width: '2em',
                  height: '2em',
                  borderRadius: '50%',
                  objectFit: 'cover',
                }}
                title={account.currency}
              />
            </Box>

            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography variant="caption">
                  CURRENCY: <strong>{account.currency}</strong>
                </Typography>
                <Typography variant="caption">
                  IBAN / ROUTING / ACCOUNT NUMBER: <strong>{account.iban}</strong>
                </Typography>
                <Typography variant="caption">
                  BIC / IFSC: <strong>{account.bic}</strong>
                </Typography>
                <Typography variant="caption">
                  BALANCE: <strong>{account.balance}</strong>
                </Typography>
              </Box>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default BeneficiaryAccountsList;

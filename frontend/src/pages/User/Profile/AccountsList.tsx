import { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { jwtDecode } from 'jwt-decode';
import ReactCountryFlag from "react-country-flag";
import api from '@/helpers/apiHelper';
const url = import.meta.env.VITE_NODE_ENV === "production" ? "api" : "api";

interface JwtPayload {
  sub: string;
  role: string;
  iat: number;
  exp: number;
  data: {
    defaultcurr: string;
    email: string;
    id: string;
    name: string;
    type: string;
  };
}

const AccountsList = () => {
  const theme = useTheme();
  const [accounts, setAccounts] = useState<any[]>([]);

  const getBeneficiaryDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const decoded = jwtDecode<JwtPayload>(token as string);

      const response = await api.get(`/${url}/v1/account/list/${decoded?.data?.id}`);

      if (response?.data?.status === 201) {
        const fetchedAccounts = response.data.data;

        const mappedAccounts = fetchedAccounts.map((item: any) => ({
          currency: item.currency,
          code: getCountryCode(item.country),
          balance: item.amount,
          iban: item.iban,
          bic: item.bic_code,
        }));

        setAccounts(mappedAccounts);
      }
    } catch (error: any) {
      console.log('error', error);
      alert(error?.response?.data?.message || 'Something went wrong');
    }
  };

  useEffect(() => {
    getBeneficiaryDetails();
  }, []);

  // Optional fallback for mapping country name to ISO code (if your backend gives full names)
  const getCountryCode = (countryName: string) => {
    if (!countryName) return 'IN'; // default
    const nameToCode: Record<string, string> = {
      Afghanistan: 'AF',
      Andorra: 'AD',
      India: 'IN',
      // add more as needed
    };
    return nameToCode[countryName] || 'IN';
  };

  return (
    <Box sx={{ backgroundColor: theme.palette.background.default }}>
      <Typography
        variant="h6"
        sx={{ mb: 2, fontWeight: 600, color: theme.palette.text.primary }}
      >
        Accounts List
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
                countryCode={account.currency.slice(0,2)}
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

export default AccountsList;

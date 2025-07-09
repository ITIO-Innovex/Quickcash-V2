import React from 'react';
import { Box, Button, useTheme } from '@mui/material';
import CustomButton from '@/components/CustomButton';
import ReactCountryFlag from 'react-country-flag';

interface Account {
  id: string;
  currency: string;
  balance: string;
  country: string;
  isDefault?: boolean;
  accountNumber?: string;
  ifscCode?: string;
  accountHolding?: string;
  name?: string;
}

interface AccountCardProps {
  account: Account;
  onViewAccount: (account: Account) => void;
}

const AccountCard: React.FC<AccountCardProps> = ({ account, onViewAccount }) => {
  const theme = useTheme();
  return (
    <Box className="account-card" sx={{ backgroundColor: theme.palette.background.default }}>
      <Box className="account-card-header">
        <Box className="account-card-info">
          <ReactCountryFlag
            countryCode={account.country}
            svg
            style={{ width: 24, height: 24, borderRadius: 50, objectFit: 'cover' }}
            title={account.country}
          />
          <Box>
            <h3 className="account-title" style={{ color: theme.palette.text.primary }}>
              {account.currency} account
              {account.isDefault && (
                <span className="account-default-badge">DEFAULT</span>
              )}
            </h3>
          </Box>
        </Box>
      </Box>
      <Box className="account-balance" >
        <p style={{ color: theme.palette.text.gray }}>{account.balance}</p>
      </Box>
      <CustomButton
        onClick={() => onViewAccount(account)}
      >
        View Account
      </CustomButton>
    </Box>
  );
};

export default AccountCard;

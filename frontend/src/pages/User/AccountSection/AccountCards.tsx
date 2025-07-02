import React from 'react';
import { Box, Button, useTheme } from '@mui/material';
import CustomButton from '@/components/CustomButton';

interface Account {
  id: string;
  currency: string;
  balance: string;
  flag: string;
  isDefault?: boolean;
}

interface AccountCardProps {
  account: Account;
  onViewAccount: (account: Account) => void;
}

const AccountCard: React.FC<AccountCardProps> = ({ account, onViewAccount }) => {
  const theme = useTheme();
  return (
    <Box className="account-card" sx={{backgroundColor:theme.palette.background.default}}>
      <Box className="account-card-header">
        <Box className="account-card-info">
          <Box
            className='img-round'
            component="img"
            src={account.flag}
            alt={`${account.currency} flag`}
            sx={{ width: 24, height: 16, borderRadius: 1, objectFit: 'cover' }}
          />

          <Box>
            <h3 className="account-title" style={{color:theme.palette.text.primary}}>
              {account.currency} account
              {account.isDefault && (
                <span className="account-default-badge">DEFAULT</span>
              )}
            </h3>
          </Box>
        </Box>
      </Box>

      <Box className="account-balance" >
        <p style={{color:theme.palette.text.gray}}>{account.balance}</p>
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

import React from 'react';
import { ChevronLeft, Search } from 'lucide-react';
import { Button, InputBase, Paper, Typography, Box, Grid } from '@mui/material';

interface Account {
  id: string;
  name: string;
  isDefault: boolean;
  amount: string;
  currency: string;
  flag: string;
}

const accounts: Account[] = [
  {
    id: 'usd',
    name: 'USD account',
    isDefault: true,
    amount: '$4552.83',
    currency: 'USD',
    flag: '🇺🇸',
  },
  {
    id: 'inr',
    name: 'INR account',
    isDefault: false,
    amount: '₹85861.63',
    currency: 'INR',
    flag: '🇮🇳',
  },
  {
    id: 'eur',
    name: 'EUR account',
    isDefault: false,
    amount: '€468.00',
    currency: 'EUR',
    flag: '🇪🇺',
  },
  {
    id: 'gbp',
    name: 'GBP account',
    isDefault: false,
    amount: '£3189.76',
    currency: 'GBP',
    flag: '🇬🇧',
  },
  {
    id: 'awg',
    name: 'AWG account',
    isDefault: false,
    amount: 'ƒ0.00',
    currency: 'AWG',
    flag: '🇦🇼',
  },
  {
    id: 'aud',
    name: 'AUD account',
    isDefault: false,
    amount: '$0.00',
    currency: 'AUD',
    flag: '🇦🇺',
  },
];

const AccountCard: React.FC<{ account: Account }> = ({ account }) => {
  return (
    <Paper elevation={1} className="account-card">
      <Box className="account-card-header">
        <Box>
          <Box className="account-name-default">
            <Typography variant="h6" component="h2" className="account-name">
              {account.name}
            </Typography>
            {account.isDefault && (
              <Typography component="span" className="default-badge">
                DEFAULT
              </Typography>
            )}
          </Box>
          <Typography variant="h4" className="account-amount">
            {account.amount}
          </Typography>
        </Box>
        <Typography className="account-flag">{account.flag}</Typography>
      </Box>
      <Button variant="outlined" fullWidth className="view-account-btn">
        View Account
      </Button>
    </Paper>
  );
};

const AllAcounts: React.FC = () => {
  return (
    <Box className="app-root">
      <Box className="header">
        <Box className="header-left">
          <ChevronLeft className="chevron-icon" />
          <Typography variant="h4" className="header-title">
            All Accounts
          </Typography>
        </Box>
        <Button variant="contained" color="success" className="add-new-btn">
          <span className="plus-sign">+</span> Add New
        </Button>
      </Box>

      <Box className="search-container" component="form" noValidate autoComplete="off">
        <InputBase
          placeholder="Search by Account Name"
          className="search-input"
          inputProps={{ 'aria-label': 'search by account name' }}
        />
        <Search className="search-icon" />
      </Box>

      <Grid container spacing={3} className="accounts-grid">
        {accounts.map(account => (
          <Grid item xs={12} md={6} key={account.id}>
            <AccountCard account={account} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default AllAcounts;

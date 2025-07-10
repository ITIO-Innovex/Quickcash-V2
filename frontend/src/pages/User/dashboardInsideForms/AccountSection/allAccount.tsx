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

interface AllAccountsProps {
  accounts: Account[];
  onAddNew: () => void;
}

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

const AllAccounts: React.FC<AllAccountsProps> = ({ accounts, onAddNew }) => {
  return (
    <Box className="app-root">
      <Box className="header">
        <Box className="header-left">
          <ChevronLeft className="chevron-icon" />
          <Typography variant="h4" className="header-title">
            All Accounts
          </Typography>
        </Box>
        <Button variant="contained" color="success" className="add-new-btn" onClick={onAddNew}>
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

export default AllAccounts;

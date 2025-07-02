import React, { useState } from 'react';
import {
  Box,
  Button,
  Grid,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { ChevronLeft, Plus, Search } from 'lucide-react';
import AccountCard from './AccountCards';
import AddAccountModal from './AddAccount';
import AccountDetailsModal from './AccountDetail';
import { useNavigate } from 'react-router-dom';

interface Account {
  id: string;
  currency: string;
  balance: string;
  flag: string;
  isDefault?: boolean;
  accountNumber?: string;
  ifscCode?: string;
  accountHolding?: string;
}

// 💡 Move currencyFlags OUTSIDE of component or at top level inside the component
const currencyFlags: { [key: string]: string } = {
  USD: '/flags/usa.png',
  INR: '/flags/india.png',
  EUR: '/flags/eu.png',
  GBP: '/flags/uk.png',
  AWG: '/flags/aruba.png',
  AUD: '/flags/australia.png',
};

const currencySymbols: { [key: string]: string } = {
  USD: '$',
  INR: '₹',
  EUR: '€',
  GBP: '£',
  AWG: 'ƒ',
  AUD: '$',
};

const AllAccounts: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  const [accounts, setAccounts] = useState<Account[]>([
    {
      id: '1',
      currency: 'USD',
      balance: '$4552.83',
      flag: currencyFlags['USD'],
      isDefault: true,
      accountNumber: 'US1000000014',
      ifscCode: '200014',
      accountHolding: 'Currency Exchange',
    },
    {
      id: '2',
      currency: 'INR',
      balance: '₹85861.63',
      flag: currencyFlags['INR'],
      accountNumber: 'IN1000000015',
      ifscCode: '200015',
      accountHolding: 'Currency Exchange',
    },
    {
      id: '3',
      currency: 'EUR',
      balance: '€468.00',
      flag: currencyFlags['USD'],
      accountNumber: 'EU1000000016',
      ifscCode: '200016',
      accountHolding: 'Currency Exchange',
    },
    {
      id: '4',
      currency: 'GBP',
      balance: '£3189.76',
      flag: currencyFlags['INR'],
      accountNumber: 'GB1000000017',
      ifscCode: '200017',
      accountHolding: 'Currency Exchange',
    },
    {
      id: '5',
      currency: 'AWG',
      balance: 'ƒ0.00',
      flag: currencyFlags['USD'],
      accountNumber: 'AW1000000018',
      ifscCode: '200018',
      accountHolding: 'Currency Exchange',
    },
    {
      id: '6',
      currency: 'AUD',
      balance: '$0.00',
      flag: currencyFlags['INR'],
      accountNumber: 'AU1000000019',
      ifscCode: '200019',
      accountHolding: 'Currency Exchange',
    },
  ]);

  const filteredAccounts = accounts.filter(account =>
    account.currency.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddAccount = (currency: string) => {
    const newAccount: Account = {
      id: Date.now().toString(),
      currency,
      balance: `${currencySymbols[currency] || '$'}0.00`,
      flag: currencyFlags[currency] || '/flags/default.png',
      accountNumber: `${currency}${Math.floor(Math.random() * 1000000000)}`,
      ifscCode: `2000${Math.floor(Math.random() * 100)}`,
      accountHolding: 'Currency Exchange',
    };

    setAccounts([...accounts, newAccount]);
  };

  const handleViewAccount = (account: Account) => {
    setSelectedAccount(account);
    setIsDetailsModalOpen(true);
  };
const handleBack = () => {
    navigate("/dashboard");
  };

  return (
    <Box p={3}>
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <IconButton size="small" onClick={handleBack}>
            <ChevronLeft />
          </IconButton>
          <Typography variant="h5">All Accounts</Typography>
        </Stack>
        <Button
          className='custom-button'
          startIcon={<Plus />}
          onClick={() => setIsAddModalOpen(true)}
        >
          Add New
        </Button>
      </Stack>

      {/* Search Bar */}
      <Box mb={3}>
        <TextField
          fullWidth
          placeholder="Search by Account Name"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={18} />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Accounts Grid */}
      <Grid container spacing={2}>
        {filteredAccounts.map((account) => (
          <Grid item xs={12} sm={6} md={6} lg={6} key={account.id}>
            <AccountCard account={account} onViewAccount={handleViewAccount} />
          </Grid>
        ))}
      </Grid>

      {/* Empty State */}
      {filteredAccounts.length === 0 && (
        <Box mt={4} textAlign="center">
          <Typography variant="body1" color="text.secondary">
            No accounts found matching your search.
          </Typography>
        </Box>
      )}

      {/* Modals */}
      <AddAccountModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddAccount}
      />

      <AccountDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        account={selectedAccount}
      />
    </Box>
  );
};

export default AllAccounts;

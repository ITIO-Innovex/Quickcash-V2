import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Grid,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import { ChevronLeft, Plus, Search } from 'lucide-react';
import AccountCard from './AccountCards';
import AddAccountModal from './AddAccount';
import AccountDetailsModal from './AccountDetail';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import api from '@/helpers/apiHelper';

interface Account {
  _id: string;
  currency: string;
  amount: string;
  country: string;
  name: string;
  iban: string;
  bic_code: string;
  isDefault?: boolean;
  accountHolding?: string;
}

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
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [defaultAccountId, setDefaultAccountId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  // Get user id from JWT
  const getUserId = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const decoded: any = jwtDecode(token);
      return decoded?.data?.id;
    } catch {
      return null;
    }
  };

  const fetchAccounts = async (search = '') => {
    setLoading(true);
    setError(null);
    const userId = getUserId();
    if (!userId) {
      setError('User not authenticated');
      setLoading(false);
      return;
    }
    try {
      const url = import.meta.env.VITE_NODE_ENV === 'production' ? 'api' : 'api';
      const res = await api.get(`/${url}/v1/account/list/${userId}?title=${search}`);
      if (res.data.status === 201) {
        setAccounts(res.data.data);
        fetchDefaultAccount(userId);
      } else {
        setAccounts([]);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to fetch accounts');
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDefaultAccount = async (userId: string) => {
    try {
      const url = import.meta.env.VITE_NODE_ENV === 'production' ? 'api' : 'api';
      const res = await api.get(`/${url}/v1/account/default/${userId}`);
      if (res.data.status === 201 && res.data.data[0]?.accountDetails?._id) {
        setDefaultAccountId(res.data.data[0].accountDetails._id);
      } else {
        setDefaultAccountId(null);
      }
    } catch {
      setDefaultAccountId(null);
    }
  };

  useEffect(() => {
    fetchAccounts();
    // eslint-disable-next-line
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    fetchAccounts(e.target.value);
  };

  const handleAddAccount = async (currency: string, onSuccess?: () => void) => {
    const url = import.meta.env.VITE_NODE_ENV === 'production' ? 'api' : 'api';
    const accountId = jwtDecode<any>(localStorage.getItem('token') as string);
    try {
      const result = await api.post(
        `/${url}/v1/account/add`,
        {
          user: accountId?.data?.id,
          currency,
          amount: 0,
        }
      );
      if (result.data.status == 201) {
        await fetchAccounts(); // Wait for accounts to refresh
        setSuccess('Account added successfully!');
      } else {
        setError('Failed to add account');
      }
    } catch (error: any) {
      setError(error?.response?.data?.message || 'Failed to add account');
    } finally {
      if (onSuccess) onSuccess(); // Always close modal after attempt
    }
  };

  const handleViewAccount = (account: Account) => {
    setSelectedAccount(account);
    setIsDetailsModalOpen(true);
  };
  const handleBack = () => {
    navigate('/dashboard');
  };

  const mapApiAccountToUi = (account: any, defaultAccountId: string | null) => ({
    id: account._id,
    currency: account.currency,
    balance: `${currencySymbols[account.currency] || ''}${parseFloat(account.amount).toFixed(2)}`,
    country: account.country,
    isDefault: account._id === defaultAccountId,
    accountNumber: account.iban,
    ifscCode: account.bic_code,
    accountHolding: 'Currency Exchange',
    name: account.name,
  });

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
          onChange={handleSearch}
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
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={2}>
          {accounts.map((account) => (
            <Grid item xs={12} sm={6} md={6} lg={6} key={account._id}>
              <AccountCard
                account={mapApiAccountToUi(account, defaultAccountId)}
                onViewAccount={() => handleViewAccount(account)}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Empty State */}
      {!loading && accounts.length === 0 && (
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
        onSubmit={(currency) => handleAddAccount(currency, () => setIsAddModalOpen(false))}
      />

      <AccountDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        account={selectedAccount ? mapApiAccountToUi(selectedAccount, defaultAccountId) : undefined}
      />

      <Snackbar open={!!error} autoHideDuration={4000} onClose={() => setError(null)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
      <Snackbar open={!!success} autoHideDuration={3000} onClose={() => setSuccess(null)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={() => setSuccess(null)} severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AllAccounts;

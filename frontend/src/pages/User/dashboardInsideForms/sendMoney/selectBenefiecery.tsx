import React, { useEffect, useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import CustomButton from '@/components/CustomButton';
import BeneficiaryModal from './beneficeryDetailModal';
import PageHeader from '@/components/common/pageHeader';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, TextField, InputAdornment, List, ListItem, ListItemAvatar, Avatar, ListItemText, IconButton, } from '@mui/material';
import { jwtDecode } from 'jwt-decode';
import { JwtPayload } from '@/types/jwt';
import api from '@/helpers/apiHelper';
import { useAppToast } from '@/utils/toast';
const url = import.meta.env.VITE_NODE_ENV === "production" ? "api" : "api";




// Bank account interface
interface BankAccount {
  id: string;
  label: string;
  balance: number;
  currency: string;
}

// At the top, define a type for beneficiary if not already present:
type Beneficiary = {
  _id: string;
  id: string;
  name: string;
  accountNumber: string;
  country: string;
  currency: string;
  iban?: string;
  bicCode?: string;
  // add other fields as needed
};

// Beneficiary Selection Form Component - Allows users to select existing beneficiaries
const BeneficiarySelectionForm: React.FC = () => {

  const [amount, setAmount] = useState('20');
  const [searchTerm, setSearchTerm] = useState('');
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [currentBeneficiary, setCurrentBeneficiary] = useState<Beneficiary | undefined>(undefined);
  const [selectedBeneficiaryId, setSelectedBeneficiaryId] = useState<string | null>(null);
  const [fee, setFee] = useState<number>(0);
  const [convertedValue, setConvertedValue] = useState<number>(0);
  const [rate, setRate] = useState<number>(1);
  const [exchangeError, setExchangeError] = useState<string>('');
  const [currentBalance, setCurrentBalance] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  const navigate = useNavigate();
  const location = useLocation();
  const returnToSendMoney = location.state?.returnToSendMoney;
  const toast = useAppToast();
  useEffect(() => {
    const accountId = jwtDecode<JwtPayload>(localStorage.getItem('token') as string);
    getReceipientList(accountId.data.id);
    // getAllAccountsList(accountId.data.id);
  }, []);


  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string>('');

  // Fetch accounts dynamically on mount
  useEffect(() => {
    const fetchAccounts = async () => {
      const token = localStorage.getItem('token');
      const decoded = jwtDecode<JwtPayload>(token as string);
      const userId = decoded.data.id;
      const res = await api.get(`/${url}/v1/account/list/${userId}`);
      if (res.data.status === 201) {
        setAccounts(res.data.data.map((acc: any) => ({
          id: acc._id,
          label: `${acc.name} - ${acc.iban}`,
          balance: acc.amount,
          currency: acc.currency,
        })));
      }
    };
    fetchAccounts();
  }, []);

  // Set default selectedAccount when accounts are loaded
  useEffect(() => {
    if (accounts.length > 0 && !selectedAccount) {
      setSelectedAccount(accounts[0].id);
    }
  }, [accounts]);


  const getReceipientList = async (accountId: string) => {
    try {
      const result = await api.get(`/${url}/v1/receipient/list/${accountId}`);
      if (result.data.status == 201) {
        setBeneficiaries(result.data.data);
      }
    } catch (error) {
      console.error('Error fetching recipient list:', error);
    }
  }

  // Filter beneficiaries based on search term (name or account number)
  const filteredBeneficiaries = beneficiaries.filter(beneficiary =>
    beneficiary.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    beneficiary.accountNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (beneficiary.iban && beneficiary.iban.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleBeneficiarySelect = (id: string) => {
    const beneficiary = beneficiaries.find(b => b._id === id);
    if (beneficiary && returnToSendMoney) {
      // Navigate back to send money with selected beneficiary and currency stored
      navigate("/send-money", {
        state: {
          selectedBeneficiary: {
            id: beneficiary.id,
            name: beneficiary.name,
            accountNumber: beneficiary.accountNumber,
            country: beneficiary.country,
            currency: beneficiary.currency
          }
        }
      });
    } else {
      // Open modal for other operations
      setSelectedBeneficiaryId(id);
      setCurrentBeneficiary(beneficiary || null);
      setOpenModal(true);
    }
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  // Calculate fee and conversion on relevant changes
  useEffect(() => {
    const fetchData = async () => {
      const account = accounts.find(acc => acc.id === selectedAccount);
      setCurrentBalance(account?.balance || 0);
      // --- Fee Calculation (replace with your real API if needed) ---
      // For demo, let's use 1% fee, min 1
      let calculatedFee = 0;
      if (amount) {
        calculatedFee = Math.max(Number(amount) * 0.01, 1);
      }
      setFee(calculatedFee);
      // --- Currency Conversion ---
      if (account && currentBeneficiary && account.currency !== currentBeneficiary.currency && amount) {
        setExchangeError('');
        try {
          setRate(1);
          setConvertedValue(0);
          // Call currency converter API
          const res = await fetch('https://currency-converter18.p.rapidapi.com/api/v1/convert?from=' + account.currency + '&to=' + currentBeneficiary.currency + '&amount=1', {
            method: 'GET',
            headers: {
              'X-RapidAPI-Key': import.meta.env.VITE_RAPID_API_KEY,
              'X-RapidAPI-Host': import.meta.env.VITE_RAPID_API_HOST
            }
          });
          const data = await res.json();
          if (data.success) {
            setRate(Number(data.result.convertedAmount));
            setConvertedValue(Number(amount) * Number(data.result.convertedAmount));
          } else {
            setExchangeError(data.validationMessage?.[0] || 'Currency conversion failed');
          }
        } catch (err) {
          setExchangeError('Currency conversion failed');
        }
      } else {
        setRate(1);
        setConvertedValue(Number(amount));
        setExchangeError('');
      }
    };
    fetchData();
  }, [selectedAccount, amount, currentBeneficiary, accounts]);

  const handleSubmit = async () => {
    if (!currentBeneficiary || !amount || !selectedAccount) {
      toast.error('Please fill all fields');
      return;
    }
    if (Number(amount) + fee > currentBalance) {
      toast.error('Insufficient balance');
      return;
    }
    if (exchangeError) {
      toast.error(exchangeError);
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const decoded = jwtDecode<JwtPayload>(token as string);
      const userId = decoded.data.id;
      const account = accounts.find(acc => acc.id === selectedAccount);
      if (!account) {
        toast.error('Invalid account selected');
        setLoading(false);
        return;
      }
      const payload = {
        user: userId,
        source_account: selectedAccount,
        info: '',
        country: currentBeneficiary.country,
        from_currency: account.currency,
        to_currency: currentBeneficiary.currency,
        amount: amount,
        amountText: amount,
        conversionAmount: account.currency !== currentBeneficiary.currency ? convertedValue : undefined,
        conversionRate: account.currency !== currentBeneficiary.currency ? rate : undefined,
        fee: fee,
      };
      const res = await api.post(`/${url}/v1/transaction/addsend`, payload);
      if (res.data.status === 201 || res.data.status === '201') {
        toast.success('Money sent successfully!');
        setOpenModal(false);
        setAmount('');
        setSelectedAccount(accounts[0]?.id || '');
        setCurrentBeneficiary(undefined);
        setSelectedBeneficiaryId(null);
      } else {
        toast.error(res.data.message || 'Failed to send money');
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Error sending money');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (returnToSendMoney) {
      navigate("/send-money");
    } else {
      navigate("/dashboard");
    }
  };

  const handleAddNew = () => {
    navigate("/add-beneficiary");
  };

  return (
    <Box className="recipient-container">
      {/* Header Section - Back button, title, and add new button */}
      <PageHeader title='Select Beneficiary' buttonText='new' onButtonClick={handleAddNew} />

      {/* Search Bar - Filter beneficiaries by name, account number, or IBAN */}
      <Box className="bene-search-bar" mb={2}>
        <IconButton onClick={handleBack}>
          <ArrowBackIcon />
        </IconButton>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search by Account Name, Iban.."
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Recipients List - Display filtered beneficiaries */}
      <Box className="recipient-list-box">
        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
          Recipients ({filteredBeneficiaries.length} found)
        </Typography>
        <List disablePadding>
          {filteredBeneficiaries.map((b) => {
            const isSelected = selectedBeneficiaryId === b._id;
            return (
              <ListItem
                key={b.id}
                onClick={() => handleBeneficiarySelect(b._id)}
                className={`acoount-list-item ${isSelected ? 'selected' : ''}`}
                sx={{ cursor: 'pointer', '&:hover': { backgroundColor: ' #5e5d5d' } }}
              >
                <ListItemAvatar>
                  <Avatar>{b.name.charAt(0).toUpperCase()}</Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={b.name}
                  secondary={`${b.iban} • ${b.country} • ${b.currency}`}
                  primaryTypographyProps={{ fontWeight: "bold" }}
                  secondaryTypographyProps={{ color: 'text.gray' }}
                />
              </ListItem>
            );
          })}
          {filteredBeneficiaries.length === 0 && (
            <ListItem>
              <ListItemText
                primary="No beneficiaries found"
                secondary="Try adjusting your search or add a new beneficiary"
              />
            </ListItem>
          )}
        </List>
      </Box>

      {/* Beneficiary Details Modal - Shows when a beneficiary is selected */}
      <BeneficiaryModal
        open={openModal}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        beneficiary={currentBeneficiary}
        amount={amount}
        fee={fee}
        total={Number(amount) + fee}
        youGet={convertedValue}
        selectedAccount={selectedAccount}
        bankAccounts={accounts}
        onAmountChange={setAmount}
        onAccountChange={setSelectedAccount}
      />
      {openModal && (
        <>
          <Typography>Fee: {fee}</Typography>
          <Typography>Recipient gets: {convertedValue} {currentBeneficiary?.currency}</Typography>
          {exchangeError && <Typography color="error">{exchangeError}</Typography>}
        </>
      )}
    </Box>
  );
};

export default BeneficiarySelectionForm;

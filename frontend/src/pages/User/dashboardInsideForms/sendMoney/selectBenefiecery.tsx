import React, { useEffect, useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import CustomButton from '@/components/CustomButton';
import BeneficiaryModal from './beneficeryDetailModal';
import PageHeader from '@/components/common/pageHeader';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, TextField, InputAdornment, List, ListItem, ListItemAvatar, Avatar, ListItemText, IconButton,} from '@mui/material';
import { jwtDecode } from 'jwt-decode';
import { JwtPayload } from '@/types/jwt';
import api from '@/helpers/apiHelper';
const url = import.meta.env.VITE_NODE_ENV === "production" ? "api" : "api";




// Bank account interface
interface BankAccount {
  id: string;
  label: string;
  balance: number;
  currency: string;
}



const bankAccounts: BankAccount[] = [
  { id: 'acc1', label: 'USD Account - US1000000014', balance: 5000, currency: 'USD' },
  { id: 'acc2', label: 'EUR Account - EU1234567890', balance: 3000, currency: 'EUR' },
];

// Beneficiary Selection Form Component - Allows users to select existing beneficiaries
const BeneficiarySelectionForm: React.FC = () => {

const [amount, setAmount] = useState('20');
  const [searchTerm, setSearchTerm] = useState('');
  const [beneficiaries,setBeneficiaries ] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(bankAccounts[0].id);
  const [currentBeneficiary, setCurrentBeneficiary] = useState();
  const [selectedBeneficiaryId, setSelectedBeneficiaryId] = useState<string | null>(null);

  const fee = 23;
  const total = parseInt(amount || '0') + fee;
  const youGet = 0;

  const navigate = useNavigate();
  const location = useLocation();
  const returnToSendMoney = location.state?.returnToSendMoney;
  useEffect(() => {
    const accountId = jwtDecode<JwtPayload>(localStorage.getItem('token') as string);
    getReceipientList(accountId.data.id);
    // getAllAccountsList(accountId.data.id);
  },[]);

  const getReceipientList = async(accountId: string) => {
    try {
      const result = await api.get(`/${url}/v1/receipient/list/${accountId}`);
      if(result.data.status == 201) {
        setBeneficiaries(result.data.data);
      }
    }catch (error) {
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

  const handleSubmit = () => {
    console.log('Submitted', { currentBeneficiary, amount, selectedAccount, fee, total, youGet });
    setOpenModal(false);
    if (returnToSendMoney) {
      navigate("/send-money");
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
      <PageHeader title='Select Beneficiary' buttonText='new' onButtonClick={handleAddNew}/>

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
                sx={{ cursor: 'pointer', '&:hover': { backgroundColor:' #5e5d5d' } }}
              >
                <ListItemAvatar>
                  <Avatar>{b.name.charAt(0).toUpperCase()}</Avatar>
                </ListItemAvatar>
                <ListItemText 
                  primary={b.name} 
                  secondary={`${b.iban} • ${b.country} • ${b.currency}`}
                   primaryTypographyProps={{ fontWeight: "bold" }}
                secondaryTypographyProps={{color:'text.gray'}}
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
        total={total}
        youGet={youGet}
        selectedAccount={selectedAccount}
        bankAccounts={bankAccounts}
        onAmountChange={setAmount}
        onAccountChange={setSelectedAccount}
      />
    </Box>
  );
};

export default BeneficiarySelectionForm;

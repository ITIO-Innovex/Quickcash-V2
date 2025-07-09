import React, { useState, useEffect } from 'react';
import { Button, Card, Typography, Box, Stack, useTheme } from '@mui/material';
import CustomModal from '@/components/CustomModal';
import GetCardForm from './getCardForm';
import { useAccount } from './useAccount';
import { jwtDecode } from 'jwt-decode';
import CustomButton from '@/components/CustomButton';
import api from '@/helpers/apiHelper';
import CardList from './cardList';

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
  USD: "$",
  EUR: "€",
  GBP: "£",
  INR: "₹",
  JPY: "¥",
  AUD: "A$",
  CAD: "C$",
  CHF: "Fr",
  CNY: "¥",
  SGD: "S$",
  NZD: "NZ$",
};
interface Account {
  _id: string;
  currency: string;
}
const token = localStorage.getItem("token");
let accountId: JwtPayload | null = null;

if (token && typeof token === "string") {
  accountId = jwtDecode<JwtPayload>(token);
}

interface CardBalanceProps {
  card: any;
  loading?: boolean;
  onRefreshCards?: () => void;
}

const CardBalance: React.FC<CardBalanceProps> = ({ card, onRefreshCards }) => {

  const theme = useTheme();
  const url: string =
    import.meta.env.VITE_NODE_ENV === "production" ? "api" : "api";


  const { list: accounts } = useAccount(accountId?.data?.id);
  const [cardList, setCardList] = useState([]);
  const [loading, setLoading] = useState(false);

  const [cardType, setCardType] = useState<'virtual' | 'physical'>('virtual');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currencyOptions, setCurrencyOptions] = useState<string[]>([]);

  useEffect(() => {
    if (accounts && accounts.length > 0) {
      const uniqueCurrencies = Array.from(
        new Set(accounts.map((acc: Account) => acc.currency))
      ) as string[];
      setCurrencyOptions(uniqueCurrencies);
    }
  }, [accounts]);

  const fetchCardList = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    if (!token) return;
    const decoded = jwtDecode<JwtPayload>(token);
    const accountId = decoded.data.id;
    const res = await api.get(`/api/v1/card/list/${accountId}`);
    if (res.data.status === 201) {
      setCardList(res.data.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCardList();
  }, []);

  const handleGetCardClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleCardCreated = () => {
    fetchCardList(); // refresh list after card is added
    if (onRefreshCards) onRefreshCards();
  };
  const formatDecimalValue = (value: number): string => {
    return value.toFixed(2);
  };
  const renderCurrencyAmount = (loading, value, currency) => {
    if (loading) return 'Loading...';
    const symbol = currencySymbols[currency] || currency || '₹';
    
    let numericValue = 0;
    if (typeof value === 'number') {
      numericValue = value;
    } else if (typeof value === 'object' && value && '$numberDecimal' in value) {
      numericValue = parseFloat(value.$numberDecimal);
    } else if (typeof value === 'string') {
      numericValue = parseFloat(value) || 0;
    }
    
    const formatted = formatDecimalValue(numericValue);
    return `${symbol} ${formatted}`;
  };

  return (
    <>
      <Stack spacing={3}>
        <Box className="toggle-container" sx={{ display: 'flex', gap: 1 }}>
          <CustomButton
            fullWidth
            variant={cardType === 'virtual' ? 'contained' : 'outlined'}
            onClick={() => setCardType('virtual')}
            className={`card-toggle-btn ${cardType === 'virtual' ? 'active virtual' : ''}`}
          >
            Virtual Card
          </CustomButton>
          <Button
            fullWidth
            variant={cardType === 'physical' ? 'contained' : 'outlined'}
            onClick={() => setCardType('physical')}
            className={`card-toggle-btn ${cardType === 'physical' ? 'active physical' : ''}`}
          >
            Physical Card
          </Button>
        </Box>

        <Card className={`card-info ${cardType}`} sx={{ p: 3 }} style={{ backgroundColor: theme.palette.background.default }}>
          <Stack spacing={2}>
            <Typography variant="h6" className={`card-title ${cardType}`}>
              {cardType === 'virtual' ? 'Virtual Card' : 'Physical Card'}
            </Typography>
            <Typography variant="body2" className="card-description" sx={{ color: theme.palette.text.gray }}>
              {cardType === 'virtual'
                ? 'A virtual card that exists only online. It provides secure online commerce, transfers, and payments without issuing a physical card.'
                : 'Access your funds globally without all the costs and time. Your Physical card will arrive anywhere from 3-5 business days.'}
            </Typography>

            <Stack spacing={1}>
              <CustomButton
                fullWidth
                variant="contained"
                className={`get-card-btn ${cardType}`}
                onClick={handleGetCardClick}
              >
                GET CARD
              </CustomButton>
            </Stack>
          </Stack>
        </Card>
        <Card className="balance-card" sx={{ p: 3 }} style={{ backgroundColor: theme.palette.background.default }}>
          <Stack spacing={2}>
            <Box className="balance-row" sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography className="balance-label">Card Balance</Typography>
              <Typography variant="h6" color="success.main">
                {renderCurrencyAmount(loading, card?.cardBalance || card?.amount, card?.currency)}


              </Typography>
            </Box>
            <Box className="balance-row" sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography className="balance-label">Daily Limit</Typography>
              <Typography>{renderCurrencyAmount(loading, card?.dailyLimit, card?.currency)}
              </Typography>
            </Box>
            <Box className="balance-row" sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography className="balance-label">Monthly Limit</Typography>
              <Typography>{renderCurrencyAmount(loading, card?.monthlyLimit, card?.currency)}
              </Typography>
            </Box>
          </Stack>
        </Card>

      </Stack>

      <CustomModal
        open={isModalOpen}
        onClose={handleCloseModal}
        title={cardType === 'virtual' ? 'Virtual Card' : 'Physical Card'}
        maxWidth="sm"
        sx={{ backgroundColor: theme.palette.background.default }}
      >
        <GetCardForm 
          onClose={handleCloseModal} 
          currencyOptions={currencyOptions} 
          onCardCreated={handleCardCreated}
          cardType={cardType}
        />
      </CustomModal>
    </>
  );
};

export default CardBalance;

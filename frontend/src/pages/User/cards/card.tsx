import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Avatar,
  useTheme,
} from '@mui/material';
import {
  CreditCard,
  AccountBalance,
  CheckCircle,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/common/pageHeader';

const Cards: React.FC = () => {
  const theme = useTheme();
  const [selectedCardType, setSelectedCardType] = useState<'virtual' | 'physical'>('virtual');
const navigate = useNavigate();

    const handleNavigate = () => {
        navigate("/card-details");
    };
  const cardTypes = [
    {
      id: 'virtual',
      title: 'Virtual Card',
      icon: CreditCard,
      description: 'Digital card for online payments',
    },
    {
      id: 'physical',
      title: 'Physical Card',
      icon: AccountBalance,
      description: 'Physical card for in-store purchases',
    },
  ];

  const physicalCardBenefits   = [
    { title: 'Shop Anywhere', icon: CheckCircle },
    { title: 'ATM Access', icon: CheckCircle },
    { title: 'Secure & Widely Accepted', icon: CheckCircle },
    { title: 'Backup Option', icon: CheckCircle },
    { title: 'Contactless payment enabled', icon: CheckCircle },
  ];

  const virtualCardBenefits= [
    { title: 'Make Secure Online Purchases', icon: CheckCircle },
    { title: 'Control Your Spending', icon: CheckCircle },
    { title: 'No Physical Card Needed', icon: CheckCircle },
    { title: 'Instant Access', icon: CheckCircle },
    { title: 'Disposable card numbers', icon: CheckCircle },
  ];

  const currentBenefits = selectedCardType === 'virtual' ? virtualCardBenefits : physicalCardBenefits;

  return (
    // <Container className="container-cards">
     <Box 
      className="dashboard-container " maxWidth="xl" 
      sx={{ backgroundColor: theme.palette.background.default }}
    >
      <PageHeader title="Cards" />

      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Box>
            {cardTypes.map((cardType, index) => (
              <Box
                key={cardType.id}
                onClick={() => setSelectedCardType(cardType.id as 'virtual' | 'physical')}
                className={`card-type-box ${selectedCardType === cardType.id ? 'selected' : ''}`}
              >
                <Avatar className="card-avatar">
                  <cardType.icon />
                </Avatar>
                <Box>
                  <Typography variant="h6">{cardType.title}</Typography>
                  <Typography variant="body2" color="text.gray">
                    {cardType.description}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card className={selectedCardType === 'virtual' ? 'virtual-card' : 'physical-card'}>
            <Avatar className="card-icon">
              {selectedCardType === 'virtual' ? <CreditCard sx={{ fontSize: 40 }} /> : <AccountBalance sx={{ fontSize: 40 }} />}
            </Avatar>
            <Typography variant="h4" gutterBottom>
              {selectedCardType === 'virtual' ? 'Virtual Card' : 'Physical Card'}
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              {selectedCardType === 'virtual'
                ? 'Get free virtual cards instantly, and try disposable for extra security online'
                : 'Choose your card design or personalise it, and get it delivered'}
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Box sx={{backgroundColor:theme.palette.background.default}}>
            <List>
              {currentBenefits.map((benefit, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <benefit.icon sx={{ color: 'success.main' }} />
                  </ListItemIcon>
                  <ListItemText primary={benefit.title} />
                </ListItem>
              ))}
            </List>
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Box className="bottom-section">
            <Box className="bottom-avatar">
              {selectedCardType === 'virtual' ? (
                <CreditCard className="bottom-avatar-icon" />
              ) : (
                <AccountBalance className="bottom-avatar-icon" />
              )}
              <Box className="close-badge">
                <Typography variant="body2" className="close-badge-text">
                  ✕
                </Typography>
              </Box>
            </Box>

            <Typography variant="h5" gutterBottom className="notice-text">
              YOU DON'T HAVE ANY {selectedCardType.toUpperCase()} CARD YET !
            </Typography>

            <Button onClick={handleNavigate}
              variant="contained"
              size="large"
              className="custom-button"
              endIcon={<Box sx={{ ml: 1 }}>›</Box>}
            >
              APPLY NOW
            </Button>
          </Box>
        </Grid>
      </Grid>
      </Box>
    // </Container>
  );
};

export default Cards;

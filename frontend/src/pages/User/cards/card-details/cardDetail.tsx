import React, { useState, useEffect } from 'react';
import { Box, Container, Grid } from '@mui/material';
import CardBalance from './cardBalance';
import CardList from './cardList';
import CardDisplay from './cardDisplay';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import api from '@/helpers/apiHelper';
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

const CardDetail = () => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [cardsDetails, setCardsDetails] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch cards here in parent
  useEffect(() => {
    const fetchCards = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const accountId = jwtDecode<JwtPayload>(token)?.data?.id;
        if (!accountId) return;

        const result = await api.get(`/api/v1/card/list/${accountId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (result.data.status === 201) {
          setCardsDetails(result.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCards();
  }, []);

  // Current active card
  const currentCard = cardsDetails[currentCardIndex] ?? null;

  // Handlers to change active card
  const nextCard = () => {
    setCurrentCardIndex((prev) => (cardsDetails.length ? (prev + 1) % cardsDetails.length : 0));
  };

  const prevCard = () => {
    setCurrentCardIndex((prev) => (cardsDetails.length ? (prev - 1 + cardsDetails.length) % cardsDetails.length : 0));
  };

  return (
    <Box sx={{ minHeight: '100vh', py: 6 }}>
      <Container maxWidth="lg">
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} lg={6}>
            <CardDisplay
              currentCardIndex={currentCardIndex}
              cardsDetails={cardsDetails}
              prevCard={prevCard}
              nextCard={nextCard}
              setCurrentCardIndex={setCurrentCardIndex}
            />


          </Grid>
          <Grid item xs={12} lg={6}>
            <CardBalance card={currentCard} />
          </Grid>
        </Grid>
        <CardList />
      </Container>
    </Box>
  );
};

export default CardDetail;

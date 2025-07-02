
import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Box, Typography } from "@mui/material";
import cardOneImg from "../../../../public/Card1.png";
import cardTwoImg from "../../../../public/Card2.png";
import cardThreeImg from "../../../../public/Card3.png";

const SecondSection = () => {
  const location = useLocation();
  const activeTab = location.state?.type || 'buy'; 

  // Log when SecondSection receives new activeTab with more detail
  useEffect(() => {
    // console.log('SecondSection - Active Tab Changed:', activeTab);
    // console.log('SecondSection - Location State:', location.state);
    // console.log('SecondSection - Timestamp:', location.state?.timestamp);
    // console.log('SecondSection - Full Location:', location);
  }, [activeTab, location.state, location]);

  // Additional useEffect to track any location changes
  useEffect(() => {
    // console.log('SecondSection - Location object changed');
    // console.log('SecondSection - New activeTab from location:', activeTab);
  }, [location]);

  const getCardContent = () => {
    // console.log('SecondSection - getCardContent called with activeTab:', activeTab);
    
    switch (activeTab) {
      case 'sell':
        // console.log('SecondSection - Returning SELL content');
        return [
          {
            img: cardOneImg,
            title: '1. Select Crypto & Enter Amount',
            text: 'Choose the crypto you want to sell and enter the amount.',
          },
          {
            img: cardTwoImg,
            title: '2. Confirm Sale Details',
            text: 'Review transaction fees and confirm order details.',
          },
          {
            img: cardThreeImg,
            title: '3. Receive Fiat',
            text: 'Fiat will be credited to your linked bank or wallet after successful sale.',
          },
        ];
      case 'swap':
        console.log('SecondSection - Returning SWAP content');
        return [
          {
            img: cardOneImg,
            title: '1. Choose Crypto Pair',
            text: 'Select the crypto you want to swap and the one you want to receive.',
          },
          {
            img: cardTwoImg,
            title: '2. Review Exchange Rate',
            text: 'Check real-time exchange rates and network fees.',
          },
          {
            img: cardThreeImg,
            title: '3. Swap Instantly',
            text: 'Receive swapped crypto instantly into your wallet.',
          },
        ];
      case 'buy':
      default:
        console.log('SecondSection - Returning BUY content');
        return [
          {
            img: cardOneImg,
            title: '1. Enter Amount & Select Payment',
            text: 'Enter the amount, select the available payment method, and choose the payment account or bind the payment card.',
          },
          {
            img: cardTwoImg,
            title: '2. Confirm Order',
            text: 'Confirmation of transaction detail information, including trading pair quotes, fees, and other explanatory tips.',
          },
          {
            img: cardThreeImg,
            title: '3. Receive Crypto',
            text: 'After successful payment, the purchased crypto will be deposited into your Spot or Funding Wallet.',
          },
        ];
    }
  };

  const cards = getCardContent();
  // console.log('SecondSection - Generated cards for activeTab:', activeTab, cards);
  
  return (
    <Box className="second-section-outer">
      <Typography variant="h4" className="section-title">
        {activeTab === 'buy'
          ? 'How to Buy Crypto'
          : activeTab === 'sell'
          ? 'How to Sell Crypto'
          : 'How to Swap Crypto'}
      </Typography>

      <Box className="second-section-wrapper">
        {cards.map((card, index) => (
          <Box className="card" key={`${activeTab}-${index}`}>
            <img src={card.img} alt={`Step ${index + 1}`} className="card-img" />
            <Typography variant="h6" className="card-heading">
              {card.title}
            </Typography>
            <Typography className="card-text">{card.text}</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default SecondSection;

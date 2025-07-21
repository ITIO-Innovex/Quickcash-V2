import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Box, Button, Card, IconButton, Typography, useTheme } from "@mui/material";
import CustomModal from "@/components/CustomModal";
import LoadCardForm from "./loadCardForm";
import TransactionForm from "./transactionForm";
import SetPinForm from "./setPin";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAppToast } from '@/utils/toast';
import api from "@/helpers/apiHelper";
import ReactCountryFlag from "react-country-flag";

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
interface CardDisplayProps {
  currentCardIndex: number;
  cardsDetails: any[];
  prevCard: () => void;
  nextCard: () => void;
  setCurrentCardIndex: (index: number) => void;
  onRefreshCards?: () => void;
}
interface CardDetails {
  _id: string;
  name: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
  currency: string;
  country: string;
  pin: string;
  dailyLimit: number | { $numberDecimal: string };
  monthlyLimit: number | { $numberDecimal: string };
  cardBalance: number | { $numberDecimal: string };
  isFrozen?: boolean;
  amount: number;
}

const CardDisplay: React.FC<CardDisplayProps> = ({
  currentCardIndex,
  cardsDetails,
  prevCard,
  nextCard,
  setCurrentCardIndex,
  onRefreshCards,
}) => {

  const theme = useTheme();
  const toast = useAppToast();
  const url: string =
    import.meta.env.VITE_NODE_ENV === "production" ? "api" : "api";
  const navigate = useNavigate();

  const [flippedCard, setFlippedCard] = useState<string | null>(null);
  const [frozenCards, setFrozenCards] = React.useState<string[]>([]);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [viewCrd, setViewCrd] = React.useState<CardDetails | null>(null);

  const [transactionCardDetails, setTransactionCardDetails] =
    React.useState<CardDetails | null>(null);
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
  const cardGradients = [
    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "linear-gradient(135deg, #f6d365 0%, #fda085 100%)",
    "linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)",
    "linear-gradient(135deg, #ff9a9e 0%, #fad0c4 99%, #fad0c4 100%)",
    "linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)",
    "linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)",
    // add more gradients if you have more cards
  ];
  const getFrozenCardStyle = () => ({
    background: "linear-gradient(135deg, #9e9e9e 0%, #757575 100%)",
    border: "1px solid #757575",
    // opacity: 0.7,
    filter: "grayscale(100%)",
  });



  // Update frozen cards when cardsDetails changes
  useEffect(() => {
    if (cardsDetails && cardsDetails.length > 0) {
      const frozenIds = cardsDetails.filter(c => c.isFrozen).map(c => c._id);
      setFrozenCards(frozenIds);
    }
  }, [cardsDetails]);

  // const nextCard = () => {
  //   setCurrentCard((prev) => (cardsDetails.length ? (prev + 1) % cardsDetails.length : 0));
  // };

  // const prevCard = () => {
  //   setCurrentCard((prev) => (cardsDetails.length ? (prev - 1 + cardsDetails.length) % cardsDetails.length : 0));
  // };
  const [isHovered, setIsHovered] = useState(false);
  const maskCardNumber = (cardNumber: string): string => {
    const digitsOnly = cardNumber.replace(/\D/g, '');
    const length = digitsOnly.length;
    if (length <= 4) return digitsOnly;
    const maskedSection = '*'.repeat(length - 4);
    const visibleSection = digitsOnly.slice(length - 4);
    const combined = maskedSection + visibleSection;
    return combined.replace(/(.{4})/g, '$1 ').trim();
  };
  const accountId = jwtDecode<JwtPayload>(
    localStorage.getItem("token") as string
  );
  const getCardsList = async () => {
    if (onRefreshCards) {
      onRefreshCards();
    }
  };
  const handleFreezeCard = async () => {
    const activeCard = cardsDetails[currentCardIndex] as CardDetails | undefined;

    if (!activeCard) {
      toast.error("Please select a card to freeze");
      return;
    }

    if (isCardFrozen(activeCard._id)) {
      toast.error("Card is already frozen");
      return;
    }

    try {
      const response = await api.patch(
        `/${url}/v1/card/toggle-freeze-card/${activeCard._id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.status === 200 || response.data.status === 201) {
        const { isFrozen } = response.data.data;

        if (isFrozen) {
          setFrozenCards((prev) => [...prev, activeCard._id]);
          toast.success("Card has been frozen successfully");
        } else {
          toast.error("Failed to freeze card");
        }

        getCardsList(); // always refresh data
      }
    } catch (error) {
      console.error("Error freezing card:", error);
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.data.status === 403) {
          localStorage.clear();
          navigate("/");
        } else {
          toast.error(error.response.data.message);
        }
      }
    }
  };
  const handleUnfreezeCard = async () => {
    const activeCard = cardsDetails[currentCardIndex] as CardDetails | undefined;

    if (!activeCard) {
      toast.error("Please select a card to unfreeze");
      return;
    }

    if (!isCardFrozen(activeCard._id)) {
      toast.error("Card is not frozen");
      return;
    }

    try {
      const response = await api.patch(
        `/${url}/v1/card/toggle-freeze-card/${activeCard._id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.status === 200 || response.data.status === 201) {
        const { isFrozen } = response.data.data;

        if (!isFrozen) {
          setFrozenCards((prev) =>
            prev.filter((cardId) => cardId !== activeCard._id)
          );
          toast.success("Card has been unfrozen successfully");
        } else {
          toast.error("Failed to unfreeze card");
        }

        getCardsList(); // always refresh data
      }
    } catch (error) {
      console.error("Error unfreezing card:", error);
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.data.status === 403) {
          localStorage.clear();
          navigate("/");
        } else {
          toast.error(error.response.data.message);
        }
      }
    }
  };


  const isCardFrozen = (cardId: string): boolean => {
    return frozenCards.includes(cardId);
  };

  const [isLoadCardModalOpen, setIsLoadCardModalOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isSetPinModalOpen, setIsSetPinModalOpen] = useState(false);
  const [isFreezeConfirmOpen, setIsFreezeConfirmOpen] = useState(false);

  const [loadCardDetails, setLoadCardDetails] =
    React.useState<CardDetails | null>(null);

  const handleLoadCardClick = () => {
    const activeCard = cardsDetails[currentCardIndex];
    if (activeCard) {
      /* setting current card balance  */
      setCurrentBalance(activeCard.amount || 0);

      setLoadCardDetails(activeCard);
      setIsLoadCardModalOpen(true);
    } else {
      toast.error("No active card selected");
    }
  };
  const handleCloseLoadCard = () => {
    setIsLoadCardModalOpen(false);
    setLoadCardDetails(null);
  };
  const cardId = cardsDetails[currentCardIndex]?._id || '';
  const isFrozen = isCardFrozen(cardId);

  const handleTransactionLimitClick = () => {
    const activeCard = cardsDetails[currentCardIndex];
    if (activeCard) {
      setTransactionCardDetails(activeCard);
      setIsTransactionModalOpen(true);
    } else {
      toast.error("No active card selected");
    }
  };
  interface HandleUpdateTransactionLimitProp {
    dailyLimit: number | string | undefined;
    monthlyLimit: number | string | undefined;
  }
  const handleUpdateTransactionLimit = async (
    data: HandleUpdateTransactionLimitProp
  ) => {
    if (!transactionCardDetails) return;

    try {
      const response = await api.put(
        `/${url}/v1/card/limit/${transactionCardDetails._id}`,
        {
          dailyLimit: data?.dailyLimit || 0,
          monthlyLimit: data?.monthlyLimit || 0,
        },
      );

      if (response.data.status) {
        // Update the card details with the new limits
        setTransactionCardDetails((prev) => ({
          ...prev!,
          dailyLimit: response.data.data.dailyLimit,
          monthlyLimit: response.data.data.monthlyLimit,
        }));

        toast.success("Card limits updated successfully");
        getCardsList();
      }
    } catch (error) {
      console.error("Error updating transaction limits:", error);
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.data.status === 403) {
          localStorage.clear();
          navigate("/");
        } else {
          toast.error(error.response.data.message);
        }
      }
    }
  };
  const handleCloseTransactionLimit = () => {
    setIsTransactionModalOpen(false);
    setTransactionCardDetails(null);
  };
  const HandleChangePin = async (cardId: string, pin: string) => {
    try {
      const response = await api.patch(
        `/${url}/v1/card/change-pin`,
        {
          pin,
          cardId: cardId,
        },

      );

      if (response.data.status === 201) {
        toast.success("Card Pin has been updated Successfully");
        setIsSetPinModalOpen(false);
      }
    } catch (error) {
      console.error("Error changing pin:", error);
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.message);
      }
    }
  }

  const handleClickOpenPin = (val: string) => {
    setIsSetPinModalOpen(true);
    HandleViewCard(val);
  };

  const handleCloseCardPin = () => {
    setIsSetPinModalOpen(false);
  };
  const HandleViewCard = async (val: string) => {
    try {
      const response = await api.get(`/${url}/v1/card/${val}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.data.status === 201) {
        setViewCrd(response.data.data);
      }
    } catch (error) {
      console.error("Error viewing card:", error);
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.data.status === 403) {
          localStorage.clear();
          navigate("/");
        } else {
          toast.error(error.response.data.message);
        }
      }
    }
  };
  return (
    <>
      <Box className="card-display-root" sx={{ backgroundColor: theme.palette.background.default }}>
        <Box className="card-display-carousel">
          <IconButton onClick={prevCard} className="nav-button left">
            <ChevronLeft />
          </IconButton>

          <Box className="card-container">
            {cardsDetails.map((card, index) => {
              const offset = index - currentCardIndex;
              const isVisible = Math.abs(offset) <= 1;
              const isFlipped = flippedCard === card._id;

              return (
                <Box
                  key={card._id}
                  className="card-wrapper"
                  style={{
                    opacity: isVisible ? 1 : 0,
                    transform: `translateX(${offset * 30}px) scale(${1 - Math.abs(offset) * 0.1})`,
                    zIndex: 10 - Math.abs(offset),
                    perspective: "1000px",
                  }}
                  onClick={() => setFlippedCard(isFlipped ? null : card._id)}
                >
                  <Box
                    className="flip-card"
                    style={{
                      width: 'auto',
                      transition: "transform 0.6s",
                      transformStyle: "preserve-3d",
                      transform: isFlipped ? "rotateX(180deg)" : "rotateX(0deg)",
                    }}
                  >
                    {/* Front Side */}
                    <Card
                      className="flip-card-front"
                      style={
                        isCardFrozen(card._id)
                          ? getFrozenCardStyle()
                          : { background: cardGradients[index % cardGradients.length] }
                      }
                    >

                      <Box
                        className="card-top"
                        display="flex"
                        justifyContent="space-between"
                      >
                        <Box className="chip" />
                        <Box className="flag">  <ReactCountryFlag
                          countryCode={card.currency.slice(0, 2)}
                          svg
                          style={{
                            width: "1.5em",
                            height: "1.5em",
                            borderRadius: "50%",
                          }}
                          cdnUrl="https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.4.3/flags/1x1/"
                          cdnSuffix="svg"
                          title={card.currency}
                        /></Box>
                      </Box>

                      <Box mt={2}>
                        <Box
                          className="card-number"
                          onMouseEnter={() => setIsHovered(true)}
                          onMouseLeave={() => setIsHovered(false)}
                          sx={{ cursor: 'pointer' }}
                        >
                          {isHovered ? card.cardNumber.replace(/(.{4})/g, '$1 ').trim() : maskCardNumber(card.cardNumber)}
                        </Box>

                        <Box
                          className="card-bottom"
                          display="flex"
                          justifyContent="space-between"
                          mt={1}
                        >
                          <Box>
                            <Box className="label">Valid thru</Box>
                            <Box className="bold">{card.expiry}</Box>
                          </Box>
                          <Box className="text-right">
                            <Box className="bold">{card.name}</Box>
                            <Box className="label">{card.currency}</Box>
                          </Box>
                        </Box>
                      </Box>
                    </Card>

                    {/* Back Side */}
                    <Card
                      className="flip-card-back"
                      style={
                        isCardFrozen(card._id)
                          ? {
                            ...getFrozenCardStyle(),
                            transform: "rotateX(180deg)",
                          }
                          : {
                            transform: "rotateX(180deg)",
                            backgroundColor: "#1976d2",
                          }
                      }
                    >
                      <Box className="strip" />

                      <Box className="magnetic-strip">{card.cvv}</Box>
                      <Button
                        className="custom-button"
                        sx={{ alignSelf: "center", mt: 2 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClickOpenPin(card._id);
                        }} disabled={isFrozen}
                      >
                        Set Pin
                      </Button>
                    </Card>
                  </Box>
                </Box>
              );
            })}
          </Box>

          <IconButton onClick={nextCard} className="nav-button right">
            <ChevronRight />
          </IconButton>
        </Box>

        <Box className="indicator-wrapper">
          {cardsDetails.map((_, index) => (
            <Box
              key={index}
              className={`indicator ${index === currentCardIndex ? "active" : ""}`}
              onClick={() => setCurrentCardIndex(index)}
            />
          ))}
        </Box>

        <Box className="card-action-buttons">
          <Button className="action-button" onClick={handleLoadCardClick} sx={{textTransform: 'none'}} disabled={isFrozen}>
            Load Card
          </Button>
          <Button sx={{textTransform: 'none'}}
            onClick={() => {
              const cardId = cardsDetails[currentCardIndex]?._id;
              if (!cardId) return;

              if (isCardFrozen(cardId)) {
                handleUnfreezeCard(); // Unfreeze directly
              } else {
                setIsFreezeConfirmOpen(true); // Ask confirmation before freezing
              }
            }}
            className={`freeze-button ${isCardFrozen(cardsDetails[currentCardIndex]?._id || '') ? 'frozen' : 'active'
              }`}
          >
            {isCardFrozen(cardsDetails[currentCardIndex]?._id || '')
              ? "Unfreeze Card"
              : "Freeze Card"}
          </Button>



          <Button className="action-button" onClick={handleTransactionLimitClick} sx={{textTransform: 'none'}} disabled={isFrozen}>
            Transaction Limit
          </Button>
          <Button className="action-button" disabled={isFrozen} sx={{textTransform: 'none'}}>Manage Card</Button>
        </Box>
      </Box>

      <CustomModal
        open={isLoadCardModalOpen}
        onClose={handleCloseLoadCard}
        title="Add Card Balance"
        maxWidth="sm"
        sx={{ backgroundColor: theme.palette.background.default }}
      >
        <LoadCardForm
          loadCardDetails={loadCardDetails}
          accountId={accountId}
          url={url}
          setLoadCardDetails={setLoadCardDetails}
          onRefreshCards={onRefreshCards}
          onClose={handleCloseLoadCard}
          alertnotify={toast}
          currencySymbols={currencySymbols}
        />
      </CustomModal>


      <CustomModal open={isTransactionModalOpen} onClose={handleCloseTransactionLimit} title="Transaction Limit" maxWidth="sm" sx={{ backgroundColor: theme.palette.background.default }}>
        <TransactionForm
          transactionCardDetails={transactionCardDetails}
          currency={transactionCardDetails?.currency}
          onSubmit={handleUpdateTransactionLimit}
          onClose={handleCloseTransactionLimit}

        />
      </CustomModal>


      <CustomModal
        open={isSetPinModalOpen} onClose={handleCloseCardPin}
        title="Set Card PIN"
        maxWidth="xs"
      >
        <SetPinForm
          cardNumber={
            cardsDetails[currentCardIndex]?.cardNumber || "1234 5678 9012 3456"
          }
          cardHolder={cardsDetails[currentCardIndex]?.name || "John Doe"}
          expiryDate={cardsDetails[currentCardIndex]?.expiry || "12/25"}
          onSubmit={(pin) => {
            HandleChangePin(cardsDetails[currentCardIndex]?._id || '', pin);
          }}
        />
      </CustomModal>
      <CustomModal
        open={isFreezeConfirmOpen}
        onClose={() => setIsFreezeConfirmOpen(false)}
        title="Freeze Card?"
        maxWidth="xs"
      >
        <Box display="flex" flexDirection="column" gap={2}>
          <Typography>
            Are you sure you want to freeze this card? You won’t be able to use it until it’s unfrozen.
          </Typography>

          <Box display="flex" justifyContent="flex-end" gap={1} mt={2}>
            <Button
              onClick={() => setIsFreezeConfirmOpen(false)}
              variant="outlined"
              color="primary"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                handleFreezeCard();
                setIsFreezeConfirmOpen(false);
              }}
              className="action-button"
            >
              Yes, Freeze
            </Button>
          </Box>
        </Box>
      </CustomModal>


    </>
  );
};

export default CardDisplay;

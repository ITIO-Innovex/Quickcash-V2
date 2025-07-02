import { useEffect, useState } from "react";
import { Box, Card, CardContent, Typography, IconButton, useTheme } from "@mui/material";
import { ArrowBackIos, ArrowForwardIos, NorthEast } from "@mui/icons-material";
import Slider from "react-slick";
import axios from "axios";

const PrevArrow = (props: any) => {
  const { onClick } = props;
  return (
    <IconButton className="custom-arrow left" onClick={onClick}>
      <ArrowBackIos fontSize="small" />
    </IconButton>
  );
};

const NextArrow = (props: any) => {
  const { onClick } = props;
  return (
    <IconButton className="custom-arrow right" onClick={onClick}>
      <ArrowForwardIos fontSize="small" />
    </IconButton>
  );
};

const CardSlider = () => {
  const theme = useTheme();
  const [cryptoData, setCryptoData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `https://api.binance.com/api/v3/ticker/24hr?symbols=[%22BTCUSDT%22,%22ETHUSDT%22,%22BNBUSDT%22,%22LTCUSDT%22,%22ADAUSDT%22,%22SOLUSDT%22,%22DOGEUSDT%22,%22SHIBUSDT%22]`
        );
        const transformed = response.data.map((coin: any) => {
          const baseSymbol = coin.symbol.replace("USDT", "");
          return {
            symbol: baseSymbol,
            price: `$${parseFloat(coin.lastPrice).toFixed(2)}`,
            change: `${parseFloat(coin.priceChangePercent).toFixed(6)}%`,
          };
        });
        setCryptoData(transformed);
      } catch (err) {
        console.error("Error fetching crypto data:", err);
      }
    };

    fetchData();
  }, []);

  const settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      { breakpoint: 1200, settings: { slidesToShow: 3 } },
      { breakpoint: 900, settings: { slidesToShow: 2 } },
      { breakpoint: 600, settings: { slidesToShow: 1 } },
    ],
  };

  return (
    <Box className="card-slider-wrapper">
      {cryptoData.length > 0 ? (
     <Slider {...settings}>
          {cryptoData.map((coin, index) => (
            <Box key={index} className="card-slide">
              <Card className="slider-card" elevation={0}  sx={{ backgroundColor: theme.palette.background.default }}>
                  <CardContent className="cards-content">
                    {/* Top row: Icon + Symbol */}
                    <Box className="top-row">
                      <img
                        className="crypto-icon"
                        src={`https://assets.coincap.io/assets/icons/${coin.symbol.toLowerCase()}@2x.png`}
                        alt={coin.symbol}
                      />
                      <Typography className="symbol">{coin.symbol}</Typography>
                    </Box>

                    {/* Bottom row: Price + Change */}
                    <Box className="bottom-row">
                      <Typography className="price">{coin.price}</Typography>
                      <Box className="change-chip" sx={{ color: theme.palette.navbar.text }}>
                        <NorthEast fontSize="small" className="arrow-icon" />
                        <Typography className="change-text" sx={{ color: theme.palette.text.gray }}>{coin.change}</Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>

            </Box>
          ))}
        </Slider>
        ) : (
           <Typography>Loading...</Typography>
        )}    
    </Box>
  );
};

export default CardSlider;

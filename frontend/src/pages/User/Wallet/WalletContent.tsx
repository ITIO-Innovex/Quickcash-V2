import api from '@/helpers/apiHelper';
import { jwtDecode } from 'jwt-decode';
import { JwtPayload } from '@/types/jwt';
import { useParams } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
const url = import.meta.env.VITE_NODE_ENV === 'production' ? 'api' : 'api';
import { Box, Card, CardContent, Typography, Button, Grid, useTheme,} from '@mui/material'; 

import CustomModal from '../../../components/CustomModal';
import CustomButton from '@/components/CustomButton';
import CommonTooltip from '@/components/common/toolTip';

const coinNames = {
  BTCUSDT: 'Bitcoin',
  ETHUSDT: 'Ethereum',
  BNBUSDT: 'Binance Coin',
  SOLUSDT: 'Solana',
  DOGEUSDT: 'Dogecoin',
  XRPUSDT: 'XRP',
  ADAUSDT: 'Cardano',
};

const WalletContent = () => {
  const theme = useTheme();
  const params = useParams();
  const [list, setList] = React.useState<any>('');
  // API call to fetch wallet data
  useEffect(() => {
    const accountId = jwtDecode<JwtPayload>(
      localStorage.getItem('token') as string
    );
    getList(accountId.data.id);
  }, [params.id]);

  const getList = async (id: any) => {
    try {
      const result = await api.get(
        `/${url}/v1/walletaddressrequest/list/${id}`
      );
      if (result.data.status === 201) {
        console.log(result.data);
        setList(result.data.data);
      } else {
        setList([]);
        console.error(
          'Failed to fetch wallet address requests:',
          result.data.message
        );
      }
    } catch (error) {
      console.error('Error fetching wallet address requests:', error);
    }
  };

  const [prices, setPrices] = useState<{ [key: string]: number }>({});
  const [openModal, setOpenModal] = useState(false);
  const [selectedCoin, setSelectedCoin] = useState<{
    name: string;
    address: string;
  } | null>(null);

  // WebSocket to fetch real-time prices
  useEffect(() => {
    if (!Array.isArray(list) || list.length === 0) return;

    const symbols = list
      .map((w) => w.coin?.replace(/_TEST$/i, '').toLowerCase())
      .map((c) => `${c}usdt@ticker`);

    const wsUrl = `wss://stream.binance.com:9443/stream?streams=${symbols.join('/')}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('[WebSocket] Connected:', wsUrl);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const symbol = data?.data?.s?.toUpperCase();
        const price = parseFloat(data?.data?.c);
        if (symbol && !isNaN(price)) {
          setPrices((prev) => ({ ...prev, [symbol]: price }));
        }
      } catch (err) {
        console.error('[WebSocket] Error:', err);
      }
    };

    ws.onclose = () => console.log('[WebSocket] Closed');
    ws.onerror = (err) => console.error('[WebSocket] Error:', err);

    return () => ws.close();
  }, [list]);

  const handleOpenModal = (coin: string, address: string) => {
    setSelectedCoin({
      name: coinNames[coin as keyof typeof coinNames],
      address,
    });
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedCoin(null);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {Array.isArray(list) && list.length !== 0 ? (
          list.map((wallet: any, index: any) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                sx={{ border: '1px solid #ccc', borderRadius: '8px', boxShadow: 'none', padding: '16px', minHeight: '140px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', backgroundColor: theme.palette.background.default, }}>

                <CardContent sx={{ padding: '0 !important' }}>
                  <Box
                    sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }} >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography
                        sx={{fontSize: '16px',fontWeight: 'bold', color: theme.palette.text.primary,  }}>
                        {wallet.coin.replace(/_TEST$/i, '')}
                      </Typography>
                    </Box>

                    <img
                      src={`https://assets.coincap.io/assets/icons/${wallet.coin.split('_')[0].toLowerCase()}@2x.png`}
                      alt={wallet.coin}
                      style={{ width:40,height: 40 }}
                    />
                      </Box>

                  <Typography
                    sx={{ fontSize: '24px', fontWeight: 'bold', mb: 3, color: theme.palette.text.primary, }} >
                    {wallet.noOfCoins}
                  </Typography>
                  <Grid
                    className="change-chip"
                    sx={{mb: 2 }}
                     >
                      <Typography className='change-text'> 1 {wallet.coin.replace(/_TEST$/i, '')} ≈ $
                    {prices[
                      wallet.coin.replace(/_TEST$/i, '') + 'USDT'
                    ]?.toFixed(6) || '0.000000'}</Typography>
                   
                  </Grid>

                  <Button
                    fullWidth 
                    onClick={() => handleOpenModal( wallet.coin.replace(/_TEST$/i, ''),   wallet.walletAddress ) }
                    sx={{ textTransform: 'none',backgroundColor: theme.palette.navbar.background, color: theme.palette.text.primary,fontSize: '14px', padding: '10px 16px', borderRadius: '6px', border: 'none',fontWeight: '500',
                      '&:hover': {
                        backgroundColor:
                          theme.palette.mode === 'dark' ? '#555' : '#e8e8e8',
                      },
                      
                    }}
                  >
                    View Address
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          <Box sx={{ flexGrow: 1, padding: '10px' }}>No data found</Box>
        )}
      </Grid>

      {selectedCoin && (
        <CustomModal
          open={openModal}
          onClose={handleCloseModal}
          title='Wallet Address'
          maxWidth="sm"
          sx={{ backgroundColor: theme.palette.background.default }}
        >
          <Box>
            <Typography variant="body1" sx={{ wordBreak: 'break-all', mb: 4 }}>
              Address: {selectedCoin.address}
            </Typography>
            {/* You can add a QR code here if needed */}
            <CommonTooltip title="Click to copy the wallet address.">
              <CustomButton
                onClick={() =>
                  navigator.clipboard.writeText(selectedCoin.address)
                }
              >
                Copy Address
              </CustomButton>
            </CommonTooltip>
          </Box>
        </CustomModal>
      )}
    </Box>
  );
};

export default WalletContent;

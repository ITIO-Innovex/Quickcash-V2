import { jwtDecode } from "jwt-decode";
import api from '@/helpers/apiHelper';
import { useAppToast } from "@/utils/toast"; 
import { useEffect, useState } from 'react';
import CustomButton from '@/components/CustomButton';
import CustomTextField from '@/components/CustomTextField';
import { Avatar, MenuItem, Box, Button,Typography } from '@mui/material';
const url = import.meta.env.VITE_NODE_ENV === 'production' ? 'api' : 'api';

interface Props {
  onClose: () => void;
  onWalletAdded: () => void; 
}
interface DecodedToken {
  data: {
    id: string;
    email: string;
  };
}

const CreateWalletForm: React.FC<Props> = ({ onClose, onWalletAdded }) => {
  const toast = useAppToast();
  const [loading, setLoading] = useState(true);
  const [coins, setCoins] = useState<any[]>([]);
  const [selectedCoin, setSelectedCoin] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [walletSubmit, setWalletSubmit] = useState(false);
  
useEffect(() => {
  const fetchCoins = async () => {
    try {
      const res = await api.get(`/api/v1/wallet/fetchcoins`);
      console.log('API RESPONSE:', res.data);
      if (res.data?.data?.length > 0) {
        setCoins(res.data.data);
        setSelectedCoin(res.data.data[0]?.coin || '');
      }
    } catch (error) {
      console.error('Error fetching coins:', error);
    } finally {
      setLoading(false); 
    }
  };

  fetchCoins();
}, []);

const getCoinLogo = (coin: string) => {
  const baseCoin = coin.split('_')[0].toLowerCase(); // "USDT_BSC_TEST" → "usdt"
  return `https://assets.coincap.io/assets/icons/${baseCoin}@2x.png`;
};

// add wallet address 
const HandleRequestWalletAddress = async () => {
  setWalletSubmit(true);

  const token = localStorage.getItem("token");
  if (!token) {
    console.error("[Wallet] No token found in localStorage");
    toast.error("Authentication token missing");
    setWalletSubmit(false);
    return;
  }

  let accountData: DecodedToken["data"];
  try {
   const decoded = jwtDecode<DecodedToken>(token);
  console.log(decoded.data.id, decoded.data.email);
    accountData = decoded.data;
  } catch (error) {
    console.error("[Wallet] Token decoding failed:", error);
    toast.error("Invalid token");    
    setWalletSubmit(false);
    return;
  }

  // Find selected coin from coins list
  const selected = coins.find((c) => c.coin === selectedCoin); 

  if (!selected) {
    console.warn("[Wallet] Coin not found in list:", coins);
    toast.warning("Please select a valid coin");
    setWalletSubmit(false);
    return;
  }

  const payload = {
    user: accountData.id,
    coin: `${selected.coin}_TEST`,
    walletAddress: walletAddress.trim(),
    status: "pending",
    email: accountData.email,
  };

  try {
  const response = await api.post(
  `/api/v1/walletaddressrequest/add`, 
  payload);

    // console.log("[Wallet] API Response:", response.data);

if (response && response.data && response.data.status === 201) {
    toast.success(response.data.message);
    setWalletAddress('');
    setSelectedCoin(coins[0]?.coin || '');
    onClose();
    onWalletAdded();
  } else {
    // Fallback if status is not 201
    toast.error(response?.data?.message || "Something went wrong!");
  }

} catch (error: any) {
  console.error("API error:", error);

  const statusCode = error?.response?.status;

  if (statusCode === 400) {
    toast.error("Asset is deprecated. Use a different asset.");
  } else {
    toast.error("Something went wrong. Please try again.");
  }
}finally {
  setWalletSubmit(false);
  setLoading(false);
}
};

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
    <CustomTextField label="Select Coin" select fullWidth value={selectedCoin} onChange={(e) => setSelectedCoin(e.target.value)} sx={{backgroundColor:'background.default'}}>
      {coins.map((coinObj) => (
        <MenuItem key={coinObj._id} value={coinObj.coin} sx={{backgroundColor:'background.default'}}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              src={getCoinLogo(coinObj.coin)}
              alt={coinObj.coin}
              sx={{ width: 32, height: 32 }}
            />
            <Box>
              <Typography variant="subtitle2" fontWeight={600}>
                {coinObj.coin}
              </Typography>
              <Typography variant="caption"  className='change-chip'color="text.gray">
                Network: {coinObj.name}
              </Typography>
            </Box>
          </Box>
        </MenuItem>
      ))}
    </CustomTextField>

      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
        <CustomButton
          variant="contained"
          onClick={HandleRequestWalletAddress}
        >
          Add Wallet
        </CustomButton>
        <Button variant="outlined" onClick={onClose}>
          Cancel
        </Button>
      </Box>
    </Box>
  );
};
export default CreateWalletForm;


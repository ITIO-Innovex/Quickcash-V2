import { useEffect, useState } from 'react';
import { Box, MenuItem, Typography } from '@mui/material';
import CustomInput from '@/components/CustomInputField';
import CustomButton from '../CustomButton';
import admin from '@/helpers/adminApiHelper';

interface Props {
  onClose: () => void;
  onAdded?: () => void;
}

interface Coin {
  id: string;
  assetId?: string;
  type?: string;
  coin: string;
  name: string;
  network: string;
  logo?: string;
  _id?: string;
  logoName: string;
  isDefault?: boolean;
}

const url = import.meta.env.VITE_NODE_ENV === "production" ? 'api' : 'api';

const CreateCoinForm: React.FC<Props> = ({ onClose, onAdded }) => {
  const [coinsAPI1, setCoinsAPI1] = useState<Coin[]>([]);
  const [selectedCoinId, setSelectedCoinId] = useState<string>("");

  useEffect(() => {
    fetchCoins();
  }, []);

  const fetchCoins = async () => {
    try {
      const token = localStorage.getItem("admin");
      if (!token) return;

      const response = await admin.get(`/${url}/v1/admin/coin/list`);

      if (response.data.success && Array.isArray(response.data.data)) {
        setCoinsAPI1(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching coins from API 1:", error);
    }
  };

  const handleSubmit = async () => {
    const selectedCoin = coinsAPI1.find((coin) => coin.assetId === selectedCoinId);

    if (!selectedCoin) {
      alert("Please select a coin.");
      return;
    }

    try {
      const response = await admin.post(
        `/${url}/v1/admin/coin/add`,
        { id: selectedCoin.assetId },

      );

      if (response.data.success) {
        alert(`Coin added successfully: ${response.data.data.name}`);
      onAdded?.();
        onClose();
      } else {
        alert(`Failed to add coin: ${response.data.message}`);
      }
    } catch (error) {
      console.error("Error adding coin:", error);
      alert("Something went wrong while adding the coin.");
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h6" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
        Select a Coin to Add
      </Typography>

      <CustomInput
        select
        label="Select a Coin"
        fullWidth
        value={selectedCoinId}
        onChange={(e) => setSelectedCoinId(e.target.value)}
      >
        {coinsAPI1.map((coin) => (
          <MenuItem key={coin.assetId} value={coin.assetId}>
            <Box>
              <Box>{coin.name}</Box>
              <Box sx={{ fontSize: '0.75rem', color: 'gray' }}>{coin.network}</Box>
            </Box>
          </MenuItem>
        ))}
      </CustomInput>

      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
        <CustomButton onClick={handleSubmit}>Ok</CustomButton>
        <CustomButton onClick={onClose}>Close</CustomButton>
      </Box>
    </Box>
  );
};

export default CreateCoinForm;

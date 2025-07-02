import { useState } from 'react';
import { fetchCoins } from '@/api/buy.api';

// Optional: Define the shape of a coin object (if known)
interface Coin {
  coin: string;
  name: string;
  // Add more fields if needed
}

export const useBuy = () => {
  const [loading, setLoading] = useState(false);
  const [coins, setCoins] = useState<Coin[]>([]); // ✅ Typed state

  const loadCoins = async () => {
    setLoading(true);
    try {
      const response = await fetchCoins();     // 🔁 API call
      setCoins(response.data);                 // ✅ Safe assumption: response.data is array
      return response.data;
    } catch (err) {
      console.error("❌ Error loading coins:", err);
      setCoins([]);
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    coins,
    loadCoins,
  };
};

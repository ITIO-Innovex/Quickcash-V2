import { fetchSellCalculation, fetchSellNoOfCoins } from '@/api/sell.api';
import { fetchCoins as fetchSellCoins } from '@/api/buy.api';
import { useState } from 'react';

interface Coin {
  coin: string;
  name: string;
}

export const useSell = () => {
  const [sellLoading, setSellLoading] = useState(false);
  const [sellCoins, setSellCoins] = useState<Coin[]>([]);
  const [availableCoins, setAvailableCoins] = useState<number>(0);
  const [sellCalculationData, setSellCalculationData] = useState<any>(null);

  const loadSellCoinAmount = async (coin: string) => {
    setSellLoading(true);
    try {
      const res = await fetchSellNoOfCoins(coin);
      if (res.status === 201) {
        setAvailableCoins(res.data);
        return res.data;
      } else {
        setAvailableCoins(0);
        return 0;
      }
    } catch (err) {
      console.error('❌ Failed to load sell coin amount:', err);
      setAvailableCoins(0);
      return 0;
    } finally {
      setSellLoading(false);
    }
  };

  const loadSellCoinsList = async () => {
    try {
      const data = await fetchSellCoins();
      setSellCoins(data.data);
    } catch (err) {
      console.error('❌ Error loading sell coin list:', err);
      setSellCoins([]);
    }
  };

  const calculateSellValues = async (
    coin: string,
    currency: string,
    noOfCoins: string
  ) => {
    setSellLoading(true);
    try {
      const result = await fetchSellCalculation(coin, currency, noOfCoins);
      if (result.status === 201) {
        setSellCalculationData(result.data);
        localStorage.setItem('sellCalculation', JSON.stringify(result.data));
        console.log('✅ Saved sellCalculation:', result.data);
        return result.data;
      } else {
        setSellCalculationData(null);
        return null;
      }
    } catch (error) {
      console.error('❌ Error in sell calculation:', error);
      setSellCalculationData(null);
      return null;
    } finally {
      setSellLoading(false);
    }
  };

  return {
    sellLoading,
    availableCoins,
    sellCoins,
    sellCalculationData,
    loadSellCoinAmount,
    loadSellCoinsList,
    calculateSellValues, // ✅ export this too
  };
};

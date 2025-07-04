import api from '@/helpers/apiHelper';

export const fetchCoins = async () => {
  try {
     const res = await api.get(`/api/v1/wallet/fetchcoins`);
      // console.log('API RESPONSE:', res.data);
    return res.data;
  } catch (error) {
    console.error('❌ Error in fetchCoins:', error);
    throw error;
  }
};

export const fetchCalculation = async (
  coin: string,
  currency: string,
  amount: string,
  side: string // 'buy' or 'sell'
) => {
  try {
    const res = await api.post(`/api/v1/crypto/fetch-calculation`, {
      coin,
      currency,
      amount,
      side,
    });
    console.log("✅ fetchCalculation Response:", res.data);
    return res.data;
  } catch (error) {
    console.error("❌ fetchCalculation error:", error);
    throw error;
  }
};

import api from '@/helpers/apiHelper';


export const fetchSellNoOfCoins = async (coin: string) => {
  try {
    const response = await api.get(`/api/v1/crypto/fetch-coins/${coin + "_TEST"}`);
    // console.log("API Response sell", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching sell coin amount:", error);
    return { status: 500, data: 0 };
  }
};

export const fetchSellCalculation = async (
  coin: string,
  currency: string,
  noOfCoins: string
) => {
  try {
    const response = await api.post(`/api/v1/crypto/fetch-symbolprice`, {
      coin,
      currency,
      noOfCoins,
    });

    // console.log("✅ Sell Calculation API Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error in fetchSellCalculation:", error);
    return { status: 500, data: null };
  }
};

import axios from 'axios';
import {useState,useEffect} from 'react';

export const useCurrency = () => {
  const [currencyList, setCurrencyList] = useState<any>([]);
  const url = import.meta.env.VITE_NODE_ENV == "production" ? 'api' : 'api';

  useEffect(() => {
    
    const getList = async () => {
      try {
        const result = await axios.get(`/${url}/v1/currency/list`);

        if (result.data.status === 201) {
          setCurrencyList(result?.data?.data);
          // console.log('[✅ Currency List Set]', result?.data?.data);
        } else {
          console.warn('[⚠️ Currency List Unexpected Status]', result.data.status);
        }
      } catch (error) {
        console.log("❌ Currency List Hook API Error", error);
      }
    };

    getList();
  }, []);

  return { currencyList };
};

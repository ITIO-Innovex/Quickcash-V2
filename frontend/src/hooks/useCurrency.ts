import axios from 'axios';
import {useState,useEffect} from 'react';

export const useCurrency = () => {

 const [currencyList,setCurrencyList] = useState<any>([]);
 const url = import.meta.env.VITE_NODE_ENV == "production" ? 'api' : 'api'; 

 useEffect(() => {
  getList();
 },[]);

 const getList = async () => {
  await axios.get(`/${url}/v1/currency/list`)
  .then(result => {
  if(result.data.status == 201) {
    setCurrencyList(result?.data?.data);
   }
  })
  .catch(error => {
    console.log("Currency List Hook API Error", error);
  })
 }

 return { currencyList }

};
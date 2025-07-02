import api from '@/helpers/apiHelper';
import {useState,useEffect} from 'react';
import { Await } from 'react-router-dom';

export const useFee = (props:any) => {

 const [feeCommision,setFeeCommision] = useState<any>([]);
 const url = import.meta.env.VITE_NODE_ENV == "production" ? 'api' : 'api'; 

 useEffect(() => {
  getFeeList();
 },[props]);

 const getFeeList = async () => {
  try {
    const result = await api.get(`/${url}/v1/admin/feetype/type?type=${props}`);
    if(result.data.status == 201) {
      if(result.data.data.length > 0) {
        setFeeCommision(result?.data?.data?.[0]?.feedetails?.[0]);
      }
    }
  } catch (error) {
    console.log("Fee Commission Hook Error", error);
  }

 }

 return { feeCommision }

};
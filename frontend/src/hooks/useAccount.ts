import api from '@/helpers/apiHelper';
import {useState,useEffect} from 'react';

export const useAccount = (props:any) => {

 const [list,setAccountList] = useState<any>([]);
 const url = import.meta.env.VITE_NODE_ENV == "production" ? 'api' : 'api'; 

 useEffect(() => {
  getList();
 },[props]);

 const getList = async () => {
  try{
    const result = await api.get(`/${url}/v1/account/list/${props}`);
    if(result.data.status == 201) {
      setAccountList(result.data.data);
    }
    
  }catch(error) {
    console.log("Account List Hook Error", error);
  }
 }

 return { list }

};
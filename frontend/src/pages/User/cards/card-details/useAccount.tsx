import axios from 'axios';
import {useState,useEffect} from 'react';

export const useAccount = (props:any) => {

 const [list,setAccountList] = useState<any>([]);
 const url = import.meta.env.VITE_NODE_ENV == "production" ? 'api' : 'api'; 

 useEffect(() => {
  getList();
 },[props]);

 const getList = async () => {
  await axios.get(`/${url}/v1/account/list/${props}`,{
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  })
  .then(result => {
  if(result.data.status == 201) {
    setAccountList(result?.data?.data);
   }
  })
  .catch(error => {
    console.log("Account List Hook API Error", error);
  })
 }

 return { list }

};
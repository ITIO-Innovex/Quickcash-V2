import axios from 'axios';

export const saveSumsubKycConfig = async (data: any, token: string) => {
  const url = '/api/v1/admin/kycmode/sumsub';
  return axios.post(url, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getSumsubKycConfig = async (token: string) => {
  const url = '/api/v1/admin/kycmode/sumsub';
  return axios.get(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const updateSumsubKycConfig = async (data: any, token: string) => {
  const url = '/api/v1/admin/kycmode/sumsub';
  return axios.put(url, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}; 
import admin from '@/helpers/adminApiHelper';

export const getBusinessKycById = async (id: string, token: string) => {
  return admin.get(`/api/v1/admin/business/list/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};
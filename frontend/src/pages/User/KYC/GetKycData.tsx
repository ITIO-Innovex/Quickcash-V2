import axios from 'axios';
import { jwtDecode } from "jwt-decode";

export const loadAndStoreKycData = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return;

    const decoded = jwtDecode<{ data: { id: string } }>(token);
    const userId = decoded?.data?.id;

    const response = await axios.get(`/your-backend-url/v1/kyc/getData/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = response.data?.data?.[0];
    if (response.data?.status === 201 && data) {
      const kycData = {
        email: data.email,
        emailVerified: data.emailVerified,
        phone: `+${data.primaryPhoneNumber}`,
        phonePVerified: data.phonePVerified,
        additionalPhone: `+${data.secondaryPhoneNumber}`,
        phoneSVerified: data.phoneSVerified,
        documentType: data.documentType,
        addressDocumentType: data.addressDocumentType,
        documentNumber: data.documentNumber,
        documentPhotoFront: data.documentPhotoFront || null,
        documentPhotoBack: data.documentPhotoBack || null,
        addressProofPhoto: data.addressProofPhoto || null,
        createdAt: data.createdAt,
        status: data.status,
        _id: data._id
      };

      localStorage.setItem('KycData', JSON.stringify(kycData));
      return kycData;
    }
  } catch (error) {
    console.error("❌ Error loading KYC:", error);
  }
};

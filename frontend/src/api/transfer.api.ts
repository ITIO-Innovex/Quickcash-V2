import api from '@/helpers/apiHelper';

export interface TransferMethod {
  _id: string;
  methodId: 'sepa' | 'swift' | 'ach';
  title: string;
  description: string;
  icon: string;
  fee: number;
  time: string;
  region: string;
  currency: string;
  isActive: boolean;
  formFields: Record<string, any>;
  validationRules: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface TransferFormData {
  [key: string]: any;
}

export interface TransferValidationResponse {
  isValid: boolean;
  errors?: Record<string, string>;
}

export interface TransferProcessResponse {
  transactionId: string;
  amount: number;
  fee: number;
  totalAmount: number;
  estimatedTime: string;
}

// Get all transfer methods
export const getTransferMethods = async (): Promise<TransferMethod[]> => {
  try {
    const response = await api.get('/api/v1/transfer/methods');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching transfer methods:', error);
    throw error;
  }
};

// Get transfer method by ID
export const getTransferMethodById = async (methodId: string): Promise<TransferMethod> => {
  try {
    const response = await api.get(`/api/v1/transfer/methods/${methodId}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching transfer method:', error);
    throw error;
  }
};

// Get recommended transfer method based on destination
export const getRecommendedTransferMethod = async (
  destinationCountry: string,
  destinationCurrency: string
): Promise<{ recommended: TransferMethod; available: TransferMethod[] }> => {
  try {
    const response = await api.get('/api/v1/transfer/recommended', {
      params: { destinationCountry, destinationCurrency }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching recommended transfer method:', error);
    throw error;
  }
};

// Validate transfer form data
export const validateTransferForm = async (
  methodId: string, 
  formData: TransferFormData
): Promise<TransferValidationResponse> => {
  try {
    const response = await api.post('/api/v1/transfer/validate', {
      methodId,
      formData
    });
    return response.data.data;
  } catch (error: any) {
    if (error.response?.status === 400) {
      return {
        isValid: false,
        errors: error.response.data.data
      };
    }
    console.error('Error validating transfer form:', error);
    throw error;
  }
};

// Process transfer request
export const processTransfer = async (
  methodId: string,
  formData: TransferFormData,
  sourceAccountId: string
): Promise<TransferProcessResponse> => {
  try {
    const response = await api.post('/api/v1/transfer/process', {
      methodId,
      formData,
      sourceAccountId
    });
    return response.data.data;
  } catch (error) {
    console.error('Error processing transfer:', error);
    throw error;
  }
};

// Admin functions (for future use)
export const createTransferMethod = async (methodData: Partial<TransferMethod>): Promise<TransferMethod> => {
  try {
    const response = await api.post('/api/v1/transfer/admin/methods', methodData);
    return response.data.data;
  } catch (error) {
    console.error('Error creating transfer method:', error);
    throw error;
  }
};

export const updateTransferMethod = async (
  methodId: string, 
  updateData: Partial<TransferMethod>
): Promise<TransferMethod> => {
  try {
    const response = await api.put(`/api/v1/transfer/admin/methods/${methodId}`, updateData);
    return response.data.data;
  } catch (error) {
    console.error('Error updating transfer method:', error);
    throw error;
  }
};

export const deleteTransferMethod = async (methodId: string): Promise<void> => {
  try {
    await api.delete(`/api/v1/transfer/admin/methods/${methodId}`);
  } catch (error) {
    console.error('Error deleting transfer method:', error);
    throw error;
  }
}; 
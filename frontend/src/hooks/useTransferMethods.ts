import { useState, useEffect, useCallback } from 'react';
import { 
  getTransferMethods, 
  getTransferMethodById, 
  validateTransferForm, 
  processTransfer,
  TransferMethod,
  TransferFormData,
  TransferValidationResponse,
  TransferProcessResponse
} from '@/api/transfer.api';

export const useTransferMethods = () => {
  const [transferMethods, setTransferMethods] = useState<TransferMethod[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<TransferMethod | null>(null);

  // Fetch all transfer methods
  const fetchTransferMethods = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const methods = await getTransferMethods();
      setTransferMethods(methods);
      // Set first method as default if none selected
      if (methods.length > 0 && !selectedMethod) {
        setSelectedMethod(methods[0]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch transfer methods');
    } finally {
      setLoading(false);
    }
  }, [selectedMethod]);

  // Fetch specific transfer method
  const fetchTransferMethodById = useCallback(async (methodId: string) => {
    setLoading(true);
    setError(null);
    try {
      const method = await getTransferMethodById(methodId);
      setSelectedMethod(method);
      return method;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch transfer method');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Validate form data
  const validateForm = useCallback(async (
    methodId: string, 
    formData: TransferFormData
  ): Promise<TransferValidationResponse> => {
    setError(null);
    try {
      const result = await validateTransferForm(methodId, formData);
      return result;
    } catch (err: any) {
      setError(err.message || 'Validation failed');
      throw err;
    }
  }, []);

  // Process transfer
  const processTransferRequest = useCallback(async (
    methodId: string,
    formData: TransferFormData,
    sourceAccountId: string
  ): Promise<TransferProcessResponse> => {
    setLoading(true);
    setError(null);
    try {
      const result = await processTransfer(methodId, formData, sourceAccountId);
      return result;
    } catch (err: any) {
      setError(err.message || 'Transfer processing failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Select transfer method
  const selectMethod = useCallback((method: TransferMethod) => {
    setSelectedMethod(method);
  }, []);

  // Get method by ID from local state
  const getMethodById = useCallback((methodId: string) => {
    return transferMethods.find(method => method.methodId === methodId) || null;
  }, [transferMethods]);

  // Initialize on mount
  useEffect(() => {
    fetchTransferMethods();
  }, [fetchTransferMethods]);

  return {
    transferMethods,
    selectedMethod,
    loading,
    error,
    fetchTransferMethods,
    fetchTransferMethodById,
    validateForm,
    processTransferRequest,
    selectMethod,
    getMethodById,
    setError
  };
}; 
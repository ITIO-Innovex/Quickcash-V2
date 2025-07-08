import axios from 'axios';
import { jwtDecode } from "jwt-decode";
import React, { useState } from 'react';
import { useAppToast } from '@/utils/toast';
import { useNavigate } from 'react-router-dom';
import FileUpload from '@/components/FileUpload';
import CustomButton from '@/components/CustomButton';
import { Box, Typography, Grid } from '@mui/material';
import CustomSelect from '@/components/CustomDropdown';
const url = import.meta.env.VITE_NODE_ENV === 'production' ? 'api' : 'api';

interface JwtPayload {
  data: {
    id: string;
  };
}

interface ResidentialAddressProps {
  onBack: () => void;
  frontDocument: { raw: File; preview: string } | null;
  backDocument: { raw: File; preview: string } | null;
}

const ResidentialAddress: React.FC<ResidentialAddressProps> = ({ onBack, frontDocument, backDocument }) => {

  const toast = useAppToast();
  const navigate = useNavigate();
  const [document, setDocument] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState('Bank Statement');
  const [errors, setErrors] = useState<{ documentType?: string; document?: string }>({});

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!documentType) newErrors.documentType = 'Please select a document type';
    if (!document) newErrors.document = 'Upload document is mandatory';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const documentTypes = [
    { label: 'Bank Statement', value: 'Bank Statement' },
    { label: 'Utility Bill', value: 'Utility Bill' },
    { label: 'Credit Card Statement', value: 'Credit Card Statement' },
  ];

  const handleBack = () => {
    onBack();
  };

const handleUpdate = async () => {
   if (!validate()) return;
  try {
    const kycData = JSON.parse(localStorage.getItem('KycData') || '{}');

    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('User not authenticated');
      return;
    }

    const decoded = jwtDecode<JwtPayload>(token);

    // ✅ Prepare FormData
    const formData = new FormData();
    formData.append('email', kycData.email);
    formData.append('user', decoded?.data?.id);
    formData.append('documentType', kycData.documentType);
    formData.append('documentNumber', kycData.documentNumber);
    formData.append('primaryPhoneNumber', kycData.phone.replace(/\D/g, ''));
    formData.append('secondaryPhoneNumber', kycData.additionalPhone.replace(/\D/g, ''));


    // 👇 Add File objects by fetching from FileUpload component states
    formData.append('addressProofPhoto', document); // residential proof File
    formData.append('documentPhotoFront', frontDocument?.raw);
    formData.append('documentPhotoBack', backDocument?.raw);

    formData.append('addressDocumentType', documentType);
    formData.append('status', 'Pending');

    // ✅ API Call
    const response = await axios.post(`/${url}/v1/kyc/add`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.data.status === '201' || response.data.status === 201 || response.data.status === 'success') {
      toast.success(response.data.message || 'KYC submitted successfully');
      localStorage.removeItem('KycData');
       navigate('/dashboard'); // ✅ clear KYC data
    } else {
          toast.error(response.data.message || 'Submission failed');
        }
      } catch (err: any) {
        console.error('KYC Submit Error:', err);
        toast.error(err?.response?.data?.message || 'Failed to submit KYC data');
      }
    };

  return (
    <Box className="contact-details-container">
      <Box className="step-indicator">
        <Typography className="step-text">STEP 3 OF 3</Typography>
        <Typography variant="h5" className="step-title">Residential Address</Typography>
        <Box className="step-progress">
          <Box className="progress-bar active"></Box>
          <Box className="progress-bar active"></Box>
          <Box className="progress-bar active"></Box>
        </Box>
      </Box>

      <Typography className="step-description">
        Please upload your proof of residential address. Accepted documents include bank statement, utility bill, or lease agreement.
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box className="input-section">
            <Typography className="input-label">TYPE OF DOCUMENT</Typography>
            <CustomSelect
              label=""
              options={documentTypes}
              value={documentType}
               onChange={(e) => {
                setDocumentType(e.target.value as string);
                setErrors({ ...errors, documentType: '' });
              }}
            />
            {errors.documentType && (
              <Typography className="error-text" style={{ color: 'red', fontSize: '0.8rem' }}>
                {errors.documentType}
              </Typography>
            )}
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Box className="input-section">
            <Typography className="input-label">UPLOAD DOCUMENT</Typography>
             <FileUpload
              onFileSelect={(file) => {
                setDocument(file);
                setErrors({ ...errors, document: '' });
              }}
              selectedFile={document}
              acceptedFormats=".jpg,.jpeg,.png,.pdf"
            />
            {errors.document && (
              <Typography className="error-text" style={{ color: 'red', fontSize: '0.8rem' }}>
                {errors.document}
              </Typography>
            )}
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Box className="upload-note">
            <Typography className="upload-note-text">
              <strong>Notes:</strong> Upload the selected document in .jpg, .jpeg or .pdf format. Max size: 5MB.
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Box className="button-container">
            <CustomButton className="back-button" onClick={handleBack}>
              Back
            </CustomButton>
            <CustomButton
              className="update-button"
              onClick={handleUpdate}
              disabled={!document || !documentType}
            >
              Update
            </CustomButton>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ResidentialAddress;

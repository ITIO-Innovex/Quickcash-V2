import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Avatar } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Upload } from 'lucide-react';
import CustomInput from '../../../components/CustomInputField';
import CustomSelect from '../../../components/CustomDropdown';
import CustomButton from '../../../components/CustomButton';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useAppToast } from '@/utils/toast'; 

const url = import.meta.env.VITE_NODE_ENV === "production" ? "api" : "api";

const Documents = () => {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    documentId: '',
    idType: ''
  });
  const [uploadedDocument, setUploadedDocument] = useState<File | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
const toast = useAppToast(); 
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedDocument(file);
    }
  };

  const validateFields = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.documentId) newErrors.documentId = 'Document ID is required.';
    if (!formData.idType) newErrors.idType = 'ID type is required.';
    if (!uploadedDocument) newErrors.uploadedDocument = 'Document upload is required.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateFields()) return;

    try {
      const token = localStorage.getItem('token');
      const decoded = jwtDecode<{ data: { id: string } }>(token as string);
      const user_id = decoded?.data?.id;

      const formPayload = new FormData();
      formPayload.append('user_id', user_id);
      formPayload.append('ownerTitle', ''); // If you have a field, use its state
      formPayload.append('ownertaxid', formData.documentId);
      formPayload.append('owneridofindividual', formData.idType);
      formPayload.append('ownerbrd', uploadedDocument as File);

      const response = await axios.patch(`/${url}/v1/user/update-profile`, formPayload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.status === 201) {
        toast.success(response.data.message);
      }
    } catch (error: any) {
      console.error("error", error);
      toast.success(error?.response?.data?.message || "Failed to update document");
    }
  };

  const idTypeOptions = [
    { label: 'Driving License', value: 'driving_license' },
    { label: 'Passport', value: 'passport' },
    { label: 'National ID', value: 'national-id' },
    { label: 'Social Security Card', value: 'ssn' }
  ];
  const getUserDetails = async () => {
  try {
    const result = await axios.post(`/${url}/v1/user/auth`, {}, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
console.log("User Details:", result.data);
    if (result?.data?.status === 201) {
      const data = result.data.data;

      setFormData({
        documentId: data.ownertaxid || '',
        idType: data.owneridofindividual || ''
      });
console.log("Set form data:", {
  documentId: data.ownertaxid || '',
  idType: data.owneridofindividual || ''
});
      if (data.ownerbrd) {
        // Optional: store preview or filename for display
        setUploadedDocument(null); // or leave it as-is
      }
    }
  } catch (error: any) {
    console.log("error", error);
    toast.error(error.response?.data?.message || "Failed to load user data");
  }
};

useEffect(() => {
  getUserDetails();
}, []);
  return (
    <Box className="documents-container">
      <Typography variant="h6" className="documents-title">Documents</Typography>

      <Box component="form" onSubmit={handleSubmit} className="documents-form">
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <CustomInput
              label="Document ID No"
              value={formData.documentId}
              onChange={(e) => handleInputChange('documentId', e.target.value)}
              error={!!errors.documentId}
              helperText={errors.documentId}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <CustomSelect
              label="ID of Individual"
              options={idTypeOptions}
              value={formData.idType}
              onChange={(e) => handleInputChange('idType', e.target.value as string)}
              error={!!errors.idType}
              // helperText={errors.idType}
            />
          </Grid>

          <Grid item xs={12}>
            <Box className="document-upload-section">
              <Typography variant="body2" className="upload-label">
                Please upload document
              </Typography>

              <Box className="upload-area">
                <input
                  type="file"
                  id="document-upload"
                  accept="image/*,.pdf"
                  onChange={handleFileUpload}
                  className="upload-input"
                />
                <label htmlFor="document-upload" className="upload-label-clickable">
                  <Box className="upload-content">
                    <Avatar className="upload-avatar">
                      <Upload size={24} />
                    </Avatar>
                    <Typography variant="body2" className="upload-text">
                      Click here to upload new document
                    </Typography>
                  </Box>
                </label>
                {errors.uploadedDocument && (
                  <Typography variant="caption" color="error">{errors.uploadedDocument}</Typography>
                )}
              </Box>

              <Typography variant="caption" className="upload-note">
                Note: Click over the Image in order to change the existing Document
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <CustomButton type="submit" className="documents-button">
              UPDATE
            </CustomButton>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default Documents;

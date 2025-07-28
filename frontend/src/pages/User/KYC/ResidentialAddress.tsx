import axios from 'axios';
import { jwtDecode } from "jwt-decode";
import PDFImage from '@/assets/PDF.png';
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
  previewUrl?: string; 
}

const ResidentialAddress: React.FC<ResidentialAddressProps> = ({ onBack, frontDocument, backDocument }) => {

  const toast = useAppToast();
  const navigate = useNavigate();
  const [previewUrl, setPreviewUrl] = useState('');
  const [document, setDocument] = useState<File | null>(null);
  const [isExistingKycData, setIsExistingKycData] = useState(false);
  const [documentType, setDocumentType] = useState('Bank Statement');
  const [errors, setErrors] = useState<{ documentType?: string; document?: string }>({});
  const [documentFileName, setDocumentFileName] = useState('');

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!documentType) newErrors.documentType = 'Please select a document type';
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

  React.useEffect(() => {
  const kycData = localStorage.getItem('KycData');
  if (kycData) {
    try {
      const parsed = JSON.parse(kycData);

      // ✅ Restore address document type
      if (parsed.addressDocumentType) {
        setDocumentType(parsed.addressDocumentType);
      }

      // ✅ Restore uploaded file name (just the name, file can't be restored fully)
      if (parsed.addressProofPhoto) {
          const path = `/kyc/${parsed.addressProofPhoto}`;
          const dummyFile = new File([], parsed.addressProofPhoto);
          setPreviewUrl(path);
          setDocumentFileName(parsed.addressProofPhoto);
          setDocument(dummyFile); // set dummy file to preserve selectedFile
        }
       // ✅ Set flag if data was already present
      if (parsed.addressProofPhoto || parsed.addressDocumentType) {
        setIsExistingKycData(true);
      }
      console.log('[✅ Restored Address Proof from KycData]');
    } catch (err) {
      console.error('[❌ Error parsing KycData]', err);
    }
  }
}, []);

const handleUpdate = async (skipFileUpload = false) => {
  if (!validate()) return;

  const kycData = JSON.parse(localStorage.getItem('KycData') || '{}');
  const token = localStorage.getItem('token');
  const decoded = jwtDecode<JwtPayload>(token || '');
  const formData = new FormData();

  formData.append('email', kycData.email);
  formData.append('user', decoded?.data?.id);
  formData.append('documentType', kycData.documentType);
  formData.append('documentNumber', kycData.documentNumber);
  formData.append('primaryPhoneNumber', kycData.phone.replace(/\D/g, ''));
  formData.append('secondaryPhoneNumber', kycData.additionalPhone.replace(/\D/g, ''));
  formData.append('addressDocumentType', documentType);
  formData.append('dob', kycData.dob);      // Add this line
  formData.append('gender', kycData.gender); // Add this line
  formData.append('status', 'Pending');

  // 🔁 Attach file only if it's new and required
  if (!skipFileUpload && document) {
    formData.append('addressProofPhoto', document);
  }

  if (!skipFileUpload && frontDocument?.raw) {
    formData.append('documentPhotoFront', frontDocument.raw);
  }

  if (!skipFileUpload && backDocument?.raw) {
    formData.append('documentPhotoBack', backDocument.raw);
  }

  try {
    let response;
    if (kycData._id) {
      response = await axios.patch(`/${url}/v1/kyc/update/${kycData._id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
    } else {
      response = await axios.post(`/${url}/v1/kyc/add`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
    }

    if (response?.data?.status === '201' || response?.data?.status === 201 || response?.data?.status === 'success') {
      toast.success(response.data.message || 'KYC submitted successfully');
      localStorage.removeItem('KycData');
      navigate('/dashboard');
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
              const value = e.target.value as string;
              setDocumentType(value);
              setErrors({ ...errors, documentType: '' });

              const existing = JSON.parse(localStorage.getItem('KycData') || '{}');
              const updated = {
                ...existing,
                addressDocumentType: value,
              };
              localStorage.setItem('KycData', JSON.stringify(updated));
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
                if (!file) return;

                const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
                const isAllowed = allowedTypes.includes(file.type);

                if (!isAllowed) {
                  toast.error('Please upload supported file type (.jpg, .jpeg, .png, .pdf)');
                  return;
                }

                const fileName = `addressProofPhoto-${Date.now()})-${file.name}`;
                const preview = URL.createObjectURL(file);
                setDocument(file);
                setDocumentFileName(fileName);
                setPreviewUrl(preview);
                setErrors({ ...errors, document: '' });

                const existing = JSON.parse(localStorage.getItem('KycData') || '{}');
                const updated = {
                  ...existing,
                  addressProofPhoto: fileName,
                  addressDocumentType: documentType,
                };
                localStorage.setItem('KycData', JSON.stringify(updated));

                console.log('[📤 Residential Address File Selected]:', fileName);
              }}
              selectedFile={document}
              acceptedFormats=".jpg,.jpeg,.png,.pdf"
            />

           {previewUrl && (
            <Box sx={{ mt: 2 }}>
              <Typography sx={{ fontSize: '14px', color: '#555' }}>
                Document Preview:
              </Typography>
              {document?.type === 'application/pdf' ? (
                <img
                  src={PDFImage}
                  alt="PDF Preview"
                  style={{ maxWidth: '100%', maxHeight: '300px', marginTop: '10px' }}
                />
              ) : (
                <img
                  src={previewUrl}
                  alt="Address Proof Preview"
                  style={{ maxWidth: '100%', maxHeight: '300px', marginTop: '10px' }}
                />
              )}
            </Box>
          )}
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
              <strong>Notes:</strong> Upload the selected document in .jpg, .jpeg, .png or .pdf format. Max size: 5MB.
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
            onClick={async () => {
              const kyc = JSON.parse(localStorage.getItem('KycData') || '{}');
              const hasDocument = !!document;

              // ✅ Always validate first
              if (!validate()) return;

              // 🟡 New KYC (POST)
              if (!kyc._id) {
                await handleUpdate(); // your existing POST logic
              } 
              
              // 🟢 Existing KYC (PATCH)
              else {
                if (!hasDocument) {
                  await handleUpdate(true); // 👈 pass flag to avoid attaching new file
                } else {
                  await handleUpdate(); // with file
                }
              }
            }}
            disabled={!documentType} // 🔁 document optional for PATCH
          >
            {documentFileName && !document ? 'Update KYC' : 'Submit'}
          </CustomButton>

          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ResidentialAddress;

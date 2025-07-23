import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Avatar, Card, FormControl, FormHelperText, Select, MenuItem } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Upload, CloudUpload } from 'lucide-react';
import CustomInput from '../../../components/CustomInputField';
import CustomSelect from '../../../components/CustomDropdown';
import CustomButton from '../../../components/CustomButton';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useAppToast } from '@/utils/toast';

const url = import.meta.env.VITE_NODE_ENV === "production" ? "api" : "api";

interface JwtPayload {
  sub: string;
  role: string;
  iat: number;
  exp: number;
  data: {
    defaultcurr: string;
    email: string;
    id: string;
    name: string;
    type: string;
  };
}

const Documents = () => {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    documentId: '',
    idType: ''
  });
  const [uploadedDocument, setUploadedDocument] = useState<File | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [imageFront1, setImageFront1] = useState({ preview: "", raw: "" });
  const [ownerbrd, setOwnerbrd] = useState<any>();
  const toast = useAppToast();

  const accountId = jwtDecode<JwtPayload>(localStorage.getItem('token') as string);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleChangeImageFront1 = (e: any) => {
    if (e.target.files.length) {
      setOwnerbrd('');
      setImageFront1({
        preview: URL.createObjectURL(e.target.files[0]),
        raw: e.target.files[0]
      });
      setUploadedDocument(e.target.files[0]);
      handleImageChange(e);
    }
  };

  const handleImageChange = (e: any) => {
    const { name, files } = e.target;
    const returnValue = validate(name, files[0]);
    console.log(returnValue);
  };

  const validate = (name: string, value: any) => {
    let error = '';

    switch (name) {
      case 'taxid':
        if (!value || value.trim() === '') {
          error = 'Document ID is required';
        }
        break;
      case 'DocumentType':
        if (!value || value === '') {
          error = 'ID type is required';
        }
        break;
      case 'files[]':
        if (!value) {
          error = 'Document upload is required';
        } else if (value.size > 5 * 1024 * 1024) { // 5MB limit
          error = 'File size should be less than 5MB';
        } else if (!['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'].includes(value.type)) {
          error = 'Only JPG, PNG, and PDF files are allowed';
        }
        break;
      default:
        break;
    }

    setErrors(prev => ({
      ...prev,
      [name]: error
    }));

    return error;
  };

  const validateFields = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.documentId) newErrors.taxid = 'Document ID is required.';
    if (!formData.idType) newErrors.DocumentType = 'ID type is required.';
    if (!uploadedDocument) newErrors['files[]'] = 'Document upload is required.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const SaveUserDocuments = async () => {
    if (!validate('taxid', formData.documentId) && !validate('DocumentType', formData.idType) && !validate('files[]', imageFront1.raw)) {
      const decoded = jwtDecode<JwtPayload>(localStorage.getItem('token') as string);

      const formPayload = new FormData();
      formPayload.append('user_id', decoded?.data?.id);
      formPayload.append('ownertaxid', formData.documentId);
      formPayload.append('owneridofindividual', formData.idType);
      formPayload.append('ownerbrd', imageFront1?.raw);

      try {
        const response = await axios.patch(`/${url}/v1/user/update-profile`, formPayload, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data'
          }
        });

        if (response.data.status === 201) {
          toast.success(response.data.message);
          getUserDetails(); // Refresh data after successful update
        }
      } catch (error: any) {
        console.error("error", error);
        toast.error(error?.response?.data?.message || "Failed to update document");
      }
    } else {
      if (validate('taxid', formData.documentId)) {
        toast.error(errors.taxid);
      }
      if (validate('DocumentType', formData.idType)) {
        toast.error(errors.DocumentType);
      }
      if (validate('files[]', imageFront1.raw)) {
        toast.error(errors['files[]']);
      }
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

      // console.log("User Details:", result.data);

      if (result?.data?.status === 201) {
        const data = result.data.data;

        setFormData({
          documentId: data.ownertaxid || '',
          idType: data.owneridofindividual || ''
        });

        setOwnerbrd(data.ownerbrd);
        console.log("Set form data:", {
          documentId: data.ownertaxid || '',
          idType: data.owneridofindividual || ''
        });
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

      <Box component="form" className="documents-form">
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <CustomInput
              label="Document ID No"
              value={formData.documentId}
              onChange={(e) => handleInputChange('documentId', e.target.value)}
              error={!!errors.taxid}
              helperText={errors.taxid}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth error={!!errors.DocumentType}>
              <CustomSelect
                label="ID of Individual"
                options={idTypeOptions}
                value={formData.idType}
                onChange={(e) => handleInputChange('idType', e.target.value as string)}
                error={!!errors.DocumentType}
              />
              {errors.DocumentType && <FormHelperText>{errors.DocumentType}</FormHelperText>}
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <Typography variant="body2" className="upload-label">
                {ownerbrd ? "Update document" : "Please upload document"}
              </Typography>


              <Box className="Neon Neon-theme-dragdropbox" sx={{ position: 'relative', height: '200px', border: '2px dashed #ccc', borderRadius: '8px' }}>
                <input
                  style={{
                    zIndex: '999',
                    opacity: '0',
                    width: '100%',
                    height: '100%',
                    background: 'silver',
                    position: 'absolute',
                    right: '0px',
                    left: '0px',
                    marginRight: 'auto',
                    marginLeft: 'auto',
                    cursor: 'pointer'
                  }}
                  name="files[]"
                  id="filer_input2"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleChangeImageFront1}
                />
                <FormControl fullWidth error={!!errors['files[]']}>
                  {errors['files[]'] && <FormHelperText>{errors['files[]']}</FormHelperText>}
                </FormControl>

                {
                  ownerbrd ?
                    !ownerbrd.includes("pdf") ?
                      <>
                        <img
                          crossOrigin="anonymous"
                          src={`${import.meta.env.VITE_PUBLIC_URL}/storage/profile/${accountId?.data?.id}/${ownerbrd}`}
                          alt="proofoftrading"
                          width="100%"
                          height="200px"
                          style={{ objectFit: 'cover', borderRadius: '6px' }}
                        />
                        <div style={{
                          marginTop: '-100px',
                          left: 0,
                          right: 0,
                          padding: "12px",
                          zIndex: '2',
                          position: 'absolute',
                          backdropFilter: 'blur(90px)',
                          textAlign: 'center',
                          color: 'white',
                          fontWeight: 'bold'
                        }}>
                          Click here to upload new document
                        </div>
                      </>
                      :
                      <>
                        <img
                          crossOrigin="anonymous"
                          src={`${import.meta.env.VITE_APP_URL}/pdf.png`}
                          alt="Upload document (FRONT)"
                          // style={{marginBottom: '12px'}} 
                          width="120px"
                          height="120px"
                        />
                      </>
                    :
                    imageFront1.preview ? (
                      <img
                        src={imageFront1.preview}
                        alt="dummy"
                        width="100%"
                        height="100%"
                        style={{ objectFit: 'cover', borderRadius: '6px' }}
                      />
                    )
                      :
                      (
                        <div className="Neon-input-dragDrop">
                          <div className="Neon-input-inner" style={{ marginTop: '-210px' }}>
                            <div className="Neon-input-icon">
                              <i className="fa fa-file-image-o"></i>
                            </div>
                            <div className="Neon-input-text"></div>
                            <a className="Neon-input-choose-btn blue">
                              <CloudUpload style={{ cursor: 'pointer' }} />
                            </a>
                          </div>
                        </div>
                      )
                }
              </Box>

              {ownerbrd?.includes("pdf") && (
                <CustomButton
                  sx={{ cursor: 'pointer', margin: '10px' }}
                  fullWidth
                >
                  <a
                    href={`${import.meta.env.VITE_PUBLIC_URL}/kyc/${ownerbrd}`}
                    target='_blank'
                    style={{ textDecoration: 'none', color: 'white' }}
                    download
                  >
                    View Document
                  </a>
                </CustomButton>
              )}
            </Card>

            {ownerbrd && (
              <Typography variant="caption" className="upload-note">
                Note: Click over the Image in order to change the existing Document
              </Typography>
            )}
            <Box mt={2}>
              <CustomButton
                onClick={SaveUserDocuments}
                className="documents-button"
              >
                Update
              </CustomButton>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default Documents;

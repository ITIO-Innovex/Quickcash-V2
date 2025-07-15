import { useEffect } from 'react';
import { useState } from 'react';
import api from '@/helpers/apiHelper'
import { jwtDecode } from 'jwt-decode';
import { useAppToast } from '@/utils/toast';
import { useNavigate ,useParams } from 'react-router-dom';
import CustomButton from '@/components/CustomButton';
import CustomInput from '@/components/CustomInputField';
import PageHeader from '@/components/common/pageHeader';
const url = import.meta.env.VITE_NODE_ENV == "production" ? 'api' : 'api';
import { Box, Typography, Radio, RadioGroup, FormControlLabel, FormLabel,} from '@mui/material';

const EditPaymentQr = () => {
  // Submit handler for updating QR code
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const decoded = jwtDecode(localStorage.getItem('token') as string);
      const form = new FormData();
      // Extract user id from decoded JWT payload
      const userId = (decoded as any)?.data?.id || (decoded as any)?.id || '';
      form.append('user', userId);
      form.append('title', formData.title);
      form.append('isDefault', formData.default);
      if (imageFront3.raw) {
        form.append('qrCodeImage', imageFront3.raw);
      }
      const result = await api.patch(`/${url}/v1/qrcode/update/${id}`, form);
      
      if (result.data.status == 201 || result.data.status == "201") {
        toast.success(result.data.message || 'QR code updated successfully');
        navigate('/settings?filter=Payment_Qr_Code');
      } else {
        toast.error(result.data.message || 'Update failed');
      }
    } catch (error: any) {
      console.log("error", error);
      toast.error(error?.response?.data?.message || 'Error updating QR code');
    }
  };
  const navigate = useNavigate();
  const { id } = useParams();
  const toast = useAppToast();

  // Fetch QR details by id
  const getDetailsById = async (val: any) => {
    try {
      const result = await api.get(`/${url}/v1/qrcode/${val}`);
      if (result.data.status == 201) {
        setFormData((prev) => ({
          ...prev,
          title: result.data.data.title || '',
          default: result.data.data.IsDefault === 'Yes' ? 'yes' : 'no',
          qrImage: null,
          qrPreview: result.data.data.image
        }));
        setImageFront3((prev) => ({
          ...prev,
          preview: result.data.data.image ? `${import.meta.env.VITE_PUBLIC_URL}/qrcode/${result.data.data.image}` : '',
          raw: null
        }));
      }
    } catch (error: any) {
      console.log("error", error);
      toast.error(error?.response?.data?.message || 'Failed to fetch QR details');
    }
  };


  useEffect(() => {
    if (id) {
      getDetailsById(id);
    }
  }, [id]);
    const [formData, setFormData] = useState({
    title: '',
    default: 'no',
    qrImage: null,
    qrPreview: '',
  });
  const [imageFront3, setImageFront3] = useState({ preview: '', raw: null });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Image preview and state update
  const handleChangeImageFront3 = (e) => {
    if (e.target.files.length) {
      setImageFront3({
        preview: URL.createObjectURL(e.target.files[0]),
        raw: e.target.files[0],
      });
      handleImageChange(e);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = typeof reader.result === 'string' ? reader.result : '';
        setFormData((prev) => ({ ...prev, qrImage: file, qrPreview: result }));
      };
      reader.readAsDataURL(file);
    }
  };


  return (
    <Box component="form" className="dashboard-container" onSubmit={handleSubmit} >
      <PageHeader title={`Edit-Qr-Code/${id}`} />
      <CustomInput
        label="Title"
        name="title"
        required
        value={formData.title}
        onChange={handleChange}
      />

      <Box className="upload-box">
        <Typography variant="body2" className="upload-label">
          Upload Payment QR-Code
        </Typography>
        <Box className="upload-preview">
          {imageFront3.preview ? (
            <img
              src={imageFront3.preview}
              alt="QR Preview"
              className="qr-preview-image"
            />
          ) : (
            <Box className="empty-preview" />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleChangeImageFront3}
            className="file-input"
          />
        </Box>
      </Box>

      <Box className="radio-group">
        <FormLabel sx={{color:'text.primary'}}>Default:</FormLabel>
        <RadioGroup
          row
          name="default"
          value={formData.default}
          onChange={handleChange}
        >
          <FormControlLabel value="yes" control={<Radio />} label="Yes" />
          <FormControlLabel value="no" control={<Radio />} label="No" />
        </RadioGroup>
      </Box>

      <Box className="form-button">
        <CustomButton type="submit">Update</CustomButton>
      </Box>
    </Box>
  );
};

export default EditPaymentQr;

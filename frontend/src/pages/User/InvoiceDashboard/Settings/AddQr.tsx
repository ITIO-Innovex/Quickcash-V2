import axios from 'axios';
import { useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useAppToast } from '@/utils/toast';
import { useNavigate } from 'react-router-dom';
import CustomButton from '@/components/CustomButton';
import CustomInput from '@/components/CustomInputField';
import PageHeader from '@/components/common/pageHeader';
const url = import.meta.env.VITE_NODE_ENV == "production" ? 'api' : 'api';
import { Box, Typography, Radio, RadioGroup, FormControlLabel, FormLabel,} from '@mui/material';

const AddPaymentQr = () => {
  const navigate = useNavigate();
  const toast = useAppToast();
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

  // Placeholder validate and alertnotify
  const validate = (field, value) => {
    if (!value || value === '') return `${field} is required`;
    return '';
  };
  const alertnotify = (msg, type) => {
    alert(`${type}: ${msg}`);
  };

  const HandleCreatePaymentQrCode = async (e) => {
    e.preventDefault();
    if (!validate('title', formData.title) && !validate('files[]', imageFront3.raw)) {
      try {
        const decoded: any = jwtDecode(localStorage.getItem('token') as string);
        const form = new FormData();
        form.append('user', decoded?.data?.id);
        form.append('title', formData.title);
        form.append('qrCodeImage', imageFront3.raw);
        form.append('isDefault', formData.default);
        const result = await axios.post(`/${url}/v1/qrcode/add`, form, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (result.data.status == 201 ) {
          toast.success(result.data.message);
           navigate('/settings?tab=qr');
        }
      } catch (error) {
        console.log("error", error);
        toast.error(error?.response?.data?.message );
      }
    } else {
      if (validate('title', formData.title)) {
        const result = validate('title', formData.title);
        toast.error(result);
      }
      if (validate('files[]', imageFront3.raw)) {
        const result = validate('files[]', imageFront3.raw);
        toast.error(result);
      }
    }
  };

  return (
    <Box component="form" onSubmit={HandleCreatePaymentQrCode} className="dashboard-container" >
      <PageHeader title='Add-tax' />
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
        <CustomButton type="submit">Submit</CustomButton>
      </Box>
    </Box>
  );
};

export default AddPaymentQr;

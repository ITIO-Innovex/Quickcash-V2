import React, { useState } from 'react';
import {
  Box,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import CustomButton from '@/components/CustomButton';
import CustomInput from '@/components/CustomInputField';
import PageHeader from '@/components/common/pageHeader';

const AddPaymentQr = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    default: 'no',
    qrImage: null,
    qrPreview: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setFormData((prev) => ({ ...prev, qrImage: file, qrPreview: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submitted Data:', formData);
    navigate('/settings');
  };

  return (
    // <Box className="settings-wrapper">
    //   <Typography variant="h6" className="section-title">
    //     Add Payment QR Code
    //   </Typography>
      <Box component="form" onSubmit={handleSubmit} className="dashboard-container" >
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
            {formData.qrPreview ? (
              <img
                src={formData.qrPreview}
                alt="QR Preview"
                className="qr-preview-image"
              />
            ) : (
              <Box className="empty-preview" />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
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

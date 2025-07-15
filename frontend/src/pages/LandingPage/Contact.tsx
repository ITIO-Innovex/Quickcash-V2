import React, { useState } from 'react';
import {
  Box,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import CustomButton from '@/components/CustomButton';
import CustomInput from '@/components/CustomInputField';

const ContactForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    contactNumber: '',
    companyName: '',
    email: '',
    description: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submitted Data:', formData);
    navigate('/');
  };

  return (
    <Box className="contact-form-wrapper">
      <Box className="contact-form-box">
        <Typography variant="h4" className="form-heading">
          Contact Us
        </Typography>

        <Box component="form" onSubmit={handleSubmit} className="contact-form">
          <CustomInput
            label="Full Name"
            name="fullName"
            required
            value={formData.fullName}
            onChange={handleChange}
          />

          <CustomInput
            label="Contact Number"
            name="contactNumber"
            required
            value={formData.contactNumber}
            onChange={handleChange}
          />

          <CustomInput
            label="Company Name"
            name="companyName"
            required
            value={formData.companyName}
            onChange={handleChange}
          />

          <CustomInput
            label="Email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
          />

          <CustomInput
            label="Description"
            name="description"
            required
            value={formData.description}
            onChange={handleChange}
            multiline
            minRows={4}
            className="description-field"
          />

          <Box className="form-button-box">
            <CustomButton type="submit">Submit</CustomButton>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ContactForm;
import React, { useState } from 'react';
import {
  Box,
  Typography,
} from '@mui/material';
import api from '@/helpers/apiHelper';
import { useAppToast } from '@/utils/toast';
import { useNavigate } from 'react-router-dom';
import CustomButton from '@/components/CustomButton';
import CustomInput from '@/components/CustomInputField';

const url = import.meta.env.VITE_NODE_ENV == "production" ? 'api' : 'api'; 

const ContactForm = () => {
  const navigate = useNavigate();
  const toast = useAppToast();

  const [formData, setFormData] = useState({
    fullName: '',
    contactNumber: '',
    companyName: '',
    email: '',
    description: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false); // track submit state

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true); // disable button

    try {
      const res = await api.post(`/${url}/v1/contact/send`, formData);
      if (res.status !== 200) {
        toast.success(res.data.message || 'Something went wrong!');
      }
     toast.success( 'Thanks for reaching out! We’ve received your message and will get back to you soon.');
      setFormData({
        fullName: '',
        contactNumber: '',git reset --soft HEAD~2

        companyName: '',
        email: '',
        description: '',
      });
      navigate('/');
    } catch (error) {
      console.error('Email Send Error:', error);
      toast.error(
        error?.response?.data?.message || 'Something went wrong while sending your message.'
      );
    } finally {
      setIsSubmitting(false); // re-enable button
    }
  };

  return (
    <Box className="contact-form-wrapper">
      <Box className="contact-form-box">
        <Typography variant="h6" className="form-heading">
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
            <CustomButton type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </CustomButton>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ContactForm;

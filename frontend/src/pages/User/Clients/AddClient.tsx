import { useNavigate } from 'react-router-dom';
import { ArrowBack } from '@mui/icons-material';
import React, { useRef, useState } from 'react';
import CustomButton from '../../../components/CustomButton';
import CustomSelect from '../../../components/CustomDropdown';
import CustomInput from '../../../components/CustomInputField';
import { Box, Typography, Grid, useTheme } from '@mui/material';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
const url = import.meta.env.VITE_NODE_ENV == "production" ? 'api' : 'api';

const AddClient = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageProfile, setImageProfile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    postalCode: '',
    country: '',
    state: '',
    city: '',
    address: '',
    notes: ''
  });

  const countryOptions = [
    { label: 'Germany', value: 'DE' },
    { label: 'United States', value: 'US' },
    { label: 'United Kingdom', value: 'UK' },
    { label: 'France', value: 'FR' },
    { label: 'Spain', value: 'ES' },
    { label: 'Italy', value: 'IT' }
  ];

  const stateOptions = [
    { label: 'Berlin', value: 'Berlin' },
    { label: 'Munich', value: 'Munich' },
    { label: 'Hamburg', value: 'Hamburg' },
    { label: 'Frankfurt', value: 'Frankfurt' }
  ];

  const cityOptions = [
    { label: 'Berlin', value: 'Berlin' },
    { label: 'Munich', value: 'Munich' },
    { label: 'Hamburg', value: 'Hamburg' },
    { label: 'Frankfurt', value: 'Frankfurt' }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');
      const accountId = jwtDecode<{ data: { id: string } }>(token);
      const form = new FormData();
      form.append('user', accountId?.data?.id || '');
      form.append('firstName', formData.firstName);
      form.append('lastName', formData.lastName);
      form.append('email', formData.email);
      form.append('mobile', formData.mobile);
      form.append('postalCode', formData.postalCode);
      form.append('country', formData.country);
      form.append('city', formData.city);
      form.append('state', formData.state);
      form.append('address', formData.address);
      form.append('notes', formData.notes);
      if (imageProfile) {
        form.append('profilePhoto', imageProfile);
      }
      const response = await axios.post(
        `/${url}/v1/client/add`,
        form,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      if (response.data.status === "201") {
        toast.success('Client added successfully!');
        navigate('/clients');
      } else {
        toast.error(response.data.message || 'Unexpected response');
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message || 'Error occurred');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = () => {
    fileInputRef.current?.click(); 
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageProfile(file);
    }
  };

  return (
    <Box 
      className="add-client-container dashboard-container"
      sx={{ 
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.primary 
      }}
    >
      <Typography variant="h5" component="h1" className='stats-heading'>
        Add Client
      </Typography>

      <Box className="add-client-form">
        <Box className="form-actions">
          <Box className="client-avatar-section">
            <Box className="avatar-placeholder">
              <Typography variant="h3" className="avatar-text">
                {formData.firstName?.charAt(0)?.toUpperCase() || 'C'}
              </Typography>

              {/*  Edit icon */}
              <Box className="edit-avatar-icon" onClick={handleEditClick} sx={{ cursor: 'pointer' }}>
                ✏️
              </Box>

              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
            </Box>
          </Box>

          <CustomButton
            fullWidth
            loading={loading}
            onClick={handleSubmit}
            className="save-button"
          >
            Save
          </CustomButton>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <CustomInput
            required
              label="First Name *"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              placeholder="Full Name"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <CustomInput
              label="Last Name *"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              placeholder="Last Name"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <CustomInput
              label="Email *"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Email"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <CustomInput
              label="Mobile Number *"
              value={formData.mobile}
              onChange={(e) => handleInputChange('mobile', e.target.value)}
              placeholder="+49 1234567890"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <CustomInput
              label="Postal Code *"
              value={formData.postalCode}
              onChange={(e) => handleInputChange('postalCode', e.target.value)}
              placeholder="Postal Code"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <CustomSelect
              label="Country *"
              value={formData.country}
              onChange={(e) => handleInputChange('country', e.target.value as string)}
              options={countryOptions}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <CustomSelect
              label="State *"
              value={formData.state}
              onChange={(e) => handleInputChange('state', e.target.value as string)}
              options={stateOptions}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <CustomSelect
              label="City *"
              value={formData.city}
              onChange={(e) => handleInputChange('city', e.target.value as string)}
              options={cityOptions}
            />
          </Grid>

          <Grid item xs={12}>
            <CustomInput
              label="Address *"
              multiline
              rows={4}
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Address"
            />
          </Grid>

          <Grid item xs={12}>
            <CustomInput
              label="Notes"
              multiline
              rows={4}
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Notes"
            />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default AddClient;

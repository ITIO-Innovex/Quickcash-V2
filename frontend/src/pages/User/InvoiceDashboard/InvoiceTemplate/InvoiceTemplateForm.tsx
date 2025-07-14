
import React, { useState, useEffect } from 'react';
import CustomInputField from '../../../../components/CustomInputField';
import CustomDropdown from '../../../../components/CustomDropdown';
import CustomButton from '../../../../components/CustomButton';
import { Box } from '@mui/material';
import api from '../../../../helpers/apiHelper';
import { jwtDecode } from 'jwt-decode';
import { useAppToast } from '@/utils/toast';

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

const InvoiceTemplateForm = () => {
  const toast = useAppToast();

  const [template, setTemplate] = useState('Default');
  const [color, setColor] = useState('#483594');
  const [country, setCountry] = useState('Default');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const accountId = jwtDecode<JwtPayload>(token);
      fetchTemplateSettings(accountId?.data?.id);
    }
  }, []);

  const fetchTemplateSettings = async (userId: string) => {
    setLoading(true);
    try {
      const res = await api.get(`/api/v1/templateSetting/list/${userId}`);
      if (res.data.status === 201 && res.data.data && res.data.data.length > 0) {
        setColor(res.data.data[0].color || '#483594');
        setCountry(res.data.data[0].invoice_country || 'Default');
        setTemplate('Default'); // You can update this if template type is stored
      }
    } catch (error: any) {
      toast.error('Failed to fetch template settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('User not authenticated');
      return;
    }
    const decoded = jwtDecode<JwtPayload>(token);
    setLoading(true);
    try {
      const res = await api.post(`/api/v1/templateSetting/add`, {
        user: decoded?.data?.id,
        invoice_country: country,
        color: color,
        templateContent: ''
      });
      if (res.data.status === 201) {
        toast.success(res.data.message || 'Template saved!');
      } else {
        toast.error(res.data.message || 'Failed to save template');
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Error saving template');
    } finally {
      setLoading(false);
    }
  };

  const templateOptions = [
    { label: 'Default', value: 'Default' },
    { label: 'Modern', value: 'Modern' },
    { label: 'Classic', value: 'Classic' },
    { label: 'Minimal', value: 'Minimal' }
  ];

  const countryOptions = [
    { label: 'Default', value: 'Default' },
    { label: 'New York', value: 'New York' },
    { label: 'Toronto', value: 'Toronto' },
    { label: 'Rio', value: 'Rio' },
    { label: 'London', value: 'London' },
    { label: 'Istanbul', value: 'Istanbul' },
    { label: 'Mumbai', value: 'Mumbai' },
    { label: 'Hong Kong', value: 'Hong Kong' },
    { label: 'Tokyo', value: 'Tokyo' },
    { label: 'Paris', value: 'Paris' }
  ];

  return (
    <Box className="invoice-template-form">
      <Box className="form-section">
        <h3 className="form-section-title">Invoice Template</h3>
        
        <Box className="form-group">
          <CustomDropdown
            label="Template"
            options={templateOptions}
            value={template}
            onChange={(e) => setTemplate(e.target.value as string)}
          />
        </Box>

        <Box className="form-group">
          <label className="form-label">COLOR</label>
          <Box className="color-picker-wrapper">
            <Box 
              className="color-picker"
              style={{ backgroundColor: color }}
            ></Box>
            <CustomInputField
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="color-input"
            />
          </Box>
        </Box>

        <Box className="form-group">
          <CustomDropdown
            label="Country/Region"
            options={countryOptions}
            value={country}
            onChange={(e) => setCountry(e.target.value as string)}
          />
        </Box>

        <Box className="form-actions">
          <CustomButton
            onClick={handleSave}
            className="save-button"
          >
            Save
          </CustomButton>
        </Box>
      </Box>
    </Box>
  );
};

export default InvoiceTemplateForm;

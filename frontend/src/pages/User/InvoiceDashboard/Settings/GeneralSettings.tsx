import axios from 'axios';
import {jwtDecode} from 'jwt-decode';
import api from '@/helpers/apiHelper';
import { useAppToast } from '@/utils/toast';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/material.css';
import React, { useEffect, useState } from 'react';
import CustomButton from '@/components/CustomButton';
import type { CountryData } from 'react-phone-input-2';
import CustomSelect from '@/components/CustomDropdown';
import { Country, State, City } from 'country-state-city';
import CustomTextField from '@/components/CustomTextField';
import { Box, Typography, useTheme, SelectChangeEvent, Grid } from '@mui/material';
const url = import.meta.env.VITE_NODE_ENV == "production" ? 'api' : 'api';

const GeneralSettings = ({ invoicesetting_id }: { invoicesetting_id?: string }) => {
  const theme = useTheme();
  const toast = useAppToast();
  const [formData, setFormData] = useState({
    companyName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    companyLogo: '',
    invoicePrefix: '',
    regardText: ''
  });
  
  const [stateList, setStateList] = useState([]);
  const [cityList, setCityList] = useState([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [invoiceSettingId, setInvoiceSettingId] = useState<string | undefined>(undefined);

  useEffect(() => {
  const storedId = localStorage.getItem("invoiceSettingId");
  if (storedId) {
    setInvoiceSettingId(storedId);
  }
}, []);

useEffect(() => {
  const fetchInvoiceSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const decoded = jwtDecode<{ data: { id: string } }>(token);
      const userId = decoded.data.id;

      const res = await api.get(`/${url}/v1/invoicesetting/list/${userId}`);
      console.log(res.data);
      
      if (res?.data?.status === 201) {
        const data = res.data.data?.[0];
        if (data?._id) {
            setInvoiceSettingId(data._id);
          }
        if (!data) return;

        setFormData({
          companyName: data.company_name || '',
          phone: data.mobile ? `+${data.mobile}` : '',
          address: data.address || '',
          city: data.city || '',
          state: data.state || '',
          zipCode: data.zipcode || '',
          country: data.invoice_country || '',
          companyLogo: data.logo || '',
          invoicePrefix: data.prefix || '',
          regardText: data.regardstext || '',
        });

        if (data.logo) {
          setLogoPreview(`${import.meta.env.VITE_PUBLIC_URL}/setting/${userId}/${data.logo}`);
        }

        const states = State.getStatesOfCountry(data.invoice_country);
        const cities = City.getCitiesOfState(data.invoice_country, data.state);
        setStateList(states);
        setCityList(cities);
      }

    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Failed to fetch invoice settings");
    }
  };

  fetchInvoiceSettings();
}, []);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (event: SelectChangeEvent<string>) => {
    const { name, value } = event.target;

    if (name === 'country') {
      const states = State.getStatesOfCountry(value);
      setStateList(states);
      setCityList([]);
      setFormData(prev => ({
        ...prev,
        [name]: value,
        state: '',
        city: '',
      }));
    } else if (name === 'state') {
      const cities = City.getCitiesOfState(formData.country, value);
      setCityList(cities);
      setFormData(prev => ({
        ...prev,
        [name]: value,
        city: '',
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      setFormData(prev => ({
        ...prev,
        companyLogo: file.name
      }));
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handlePhoneChange = (value: string, country: {} | CountryData) => {
    const countryData = country as CountryData;
    setFormData(prev => ({
      ...prev,
      phone: value,
      country: countryData.countryCode?.toUpperCase() || '',
    }));
  };

  const handleSaveOrUpdate = async () => {
    try {
      const token = localStorage.getItem('token');
      const decoded = jwtDecode<{ data: { id: string } }>(token as string);

      const formPayload = new FormData();
      formPayload.append('user', decoded.data.id);
      formPayload.append('invoice_country', formData.country);
      formPayload.append('company_name', formData.companyName);
      formPayload.append('mobile', formData.phone);
      formPayload.append('state', formData.state);
      formPayload.append('city', formData.city);
      formPayload.append('zipcode', formData.zipCode);
      formPayload.append('address', formData.address);
      formPayload.append('prefix', formData.invoicePrefix);
      formPayload.append('regardstext', formData.regardText);
      if (imageFile) {
        formPayload.append('logo', imageFile);
      }

      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        }
      };

      console.log('Payload:', Object.fromEntries(formPayload.entries()));

      let res;
        console.log("invoiceSettingId", invoiceSettingId);
        if (invoiceSettingId) {
          res = await axios.patch(`/${url}/v1/invoicesetting/update/${invoiceSettingId}`, formPayload, config);
        } else {
          res = await axios.post(`/${url}/v1/invoicesetting/add`, formPayload, config);
           toast.success("Invoice added successfully ");
        }

        if (!invoiceSettingId && res.data.data?._id) {
        const newId = res.data.data._id;
        setInvoiceSettingId(newId);

      }else {
        toast.error("Something went wrong");
      }
    } catch (error: any) {
      console.error("API Error:", error);
      toast.error(error?.response?.data?.message || "API Error");
    }
  };

  const countryOptions = Country.getAllCountries().map(c => ({
    label: c.name,
    value: c.isoCode,
  }));

  const stateOptions = stateList.map(s => ({
    label: s.name,
    value: s.isoCode,
  }));

  const cityOptions = cityList.map(c => ({
    label: c.name,
    value: c.name,
  }));

  return (
    <Box>
      <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
        <CustomTextField label="Company Name" name="companyName" value={formData.companyName} onChange={handleInputChange} required />
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <PhoneInput
            country={'us'}
            value={formData.phone}
            onChange={handlePhoneChange}
            inputStyle={{
              width: '100%',
              height: '55px',
              borderRadius: '6px',
              border: '1px solid rgba(0, 0, 0, 0.23)',
              background: 'transparent',
              fontSize: '16px',
              paddingLeft: '48px',
            }}
            buttonStyle={{
              border: 'none',
              borderRight: '1px solid rgba(0,0,0,0.23)',
              background: 'transparent'
            }}
            containerStyle={{ width: '100%' }}
          />
        </Box>

        <CustomSelect label="Country" name="country" value={formData.country} onChange={handleSelectChange} options={countryOptions} />
        <CustomSelect label="State" name="state" value={formData.state} onChange={handleSelectChange} options={stateOptions} />
        <CustomSelect label="City" name="city" value={formData.city} onChange={handleSelectChange} options={cityOptions} />
        <CustomTextField label="ZIP/Postal Code" name="zipCode" value={formData.zipCode} onChange={handleInputChange} />

        <CustomTextField
          label="Company Address"
          name="address"
          multiline
          rows={4}
          value={formData.address}
          onChange={handleInputChange}
          sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}
        />

        <Box>
          <Typography sx={{ fontSize: 14, mb: 1 }}>Company Logo</Typography>
          <input type="file" accept="image/*" onChange={handleLogoChange} />
          {logoPreview && (
            <Box mt={1}>
              <img src={logoPreview} alt="Logo Preview" style={{ maxHeight: '80px' }} />
            </Box>
          )}
        </Box>

        <CustomTextField label="Invoice Prefix" name="invoicePrefix" value={formData.invoicePrefix} onChange={handleInputChange} />
        <CustomTextField label="Regard Text" name="regardText" value={formData.regardText} onChange={handleInputChange} />
      </Box>

       <CustomButton onClick={handleSaveOrUpdate}>
        {invoiceSettingId ? 'Update' : 'Save'}
      </CustomButton>
    </Box>
  );
};

export default GeneralSettings;

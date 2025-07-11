import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CustomInput from '../../../components/CustomInputField';
import CustomSelect from '../../../components/CustomDropdown';
import CustomButton from '../../../components/CustomButton';
import { jwtDecode } from 'jwt-decode';
import api from '@/helpers/apiHelper';
import axios from 'axios';
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
const url = import.meta.env.VITE_NODE_ENV === "production" ? "api" : "api";

const UpdateDetails = () => {
  const theme = useTheme();
  const toast = useAppToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    address: '',
    country: '',
    state: '',
    city: '',
    postalCode: '',
    title: '',
  });

  const [countries, setCountries] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const countryRes = await api.get(`/${url}/v1/user/getCountryList`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        const countryList = countryRes.data.data?.country || [];
        setCountries(countryList);
        const userRes = await axios.post(`/${url}/v1/user/auth`, {}, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const data = userRes.data.data;

        const countryObj = countryList.find((c: any) => c.id === (data.country?.id || data.country));
        let statesList: any[] = [];
        let stateObj;
        if (countryObj) {
          const stateRes = await api.get(`/${url}/v1/user/getStateList/${countryObj.name}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
          if (stateRes.data.status === 201) {
            statesList = stateRes.data.data;
            setStates(statesList);
            stateObj = statesList.find(s => s.id === (data.state?.id || data.state));
          }
        }
        let citiesList: any[] = [];
        let cityObj;
        if (stateObj) {
          const cityRes = await api.get(`/${url}/v1/user/getCityList/${stateObj.name}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
          if (cityRes.data.status === 201) {
            citiesList = cityRes.data.data;
            setCities(citiesList);
            cityObj = citiesList.find(c => c.id === (data.city?.id || data.city));
          }
        }
        setFormData({
          name: data.name || '',
          email: data.email || '',
          mobile: "+" + data.mobile || '',
          address: data.address || '',
          country: countryObj ? countryObj.id : '',
          state: stateObj ? stateObj.id : '',
          city: cityObj ? cityObj.id : '',
          postalCode: data.postalcode || '',
          title: data.ownerTitle || '',
        });
      } catch (error) {
        console.error('Error loading profile data:', error);
      }
    };

    fetchAll();
  }, []);
  useEffect(() => {
    getUserDetails();
    getCountryList();
  }, []);
 const getUserDetails = async () => {
  try {
    const result = await axios.post(`/${url}/v1/user/auth`, {}, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (result?.data?.status === 201) {
      const data = result.data.data;

      const countryId = typeof data.country === 'object' ? data.country.id : data.country;
      const stateId = typeof data.state === 'object' ? data.state.id : data.state;
      const cityId = typeof data.city === 'object' ? data.city.id : data.city;

      setFormData({
        name: data.name || '',
        email: data.email || '',
        mobile: "+" + (data.mobile || ''),
        address: data.address || '',
        country: countryId || '',
        state: stateId || '',
        city: cityId || '',
        postalCode: data.postalcode || '',
        title: data.ownerTitle || '',
      });
    }

  } catch (error: any) {
    console.error("User fetch error", error);
  }
};

  const getCountryList = async () => {
    try {
      const result = await api.get(`/${url}/v1/user/getCountryList`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (result.data.status === 201) {
        setCountries(result.data.data?.country || []);
      }
    } catch (error) {
      console.log('Country List Error:', error);
    }
  };

  const getStateList = async (countryId: number | string, clear = true) => {
    const countryObj = countries.find(c => c.id == countryId);
    if (!countryObj) return;
    try {
      const result = await api.get(`/${url}/v1/user/getStateList/${countryObj.name}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (result.data.status === 201) {
        setStates(result.data.data);
        if (clear) {
          setCities([]);
          setFormData(prev => ({ ...prev, state: '', city: '' }));
        }
      }
    } catch (error) {
      console.log('State List Error:', error);
    }
  };

  const getCityList = async (stateId: number | string, clear = true) => {
    const stateObj = states.find(s => s.id == stateId);
    if (!stateObj) return;
    try {
      const result = await api.get(`/${url}/v1/user/getCityList/${stateObj.name}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (result.data.status === 201) {
        setCities(result.data.data);
        if (clear) {
          setFormData(prev => ({ ...prev, city: '' }));
        }
      }
    } catch (error) {
      console.log('City List Error:', error);
    }
  };


  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    if (field === 'country') getStateList(value);
    if (field === 'state') getCityList(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token not found');
      const decoded = jwtDecode<JwtPayload>(token);

      const payload = {
        user_id: decoded.data.id,
        ...formData,
        ownerTitle: formData.title,
        postalcode: formData.postalCode,
      };

      const result = await api.patch(`/${url}/v1/user/update-profile`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (result.data.status === 201) {
        toast.success(result.data.message || "Profile updated successfully!",);
        console.log('Success:', result.data.message);
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || error.message);
        console.log('Save Error:', error.response?.data?.message || error.message);
      } else {
        toast.error((error as Error).message);
        console.log('Unexpected Error:', (error as Error).message);
      }
    }
  };

  const titleOptions = [
    { label: 'CEO', value: 'CEO' },
    { label: 'CFO', value: 'CFO' },
    { label: 'PRESIDENT', value: 'PRESIDENT' },
    { label: 'MANAGER', value: 'MANAGER' },
    { label: 'OTHERS.', value: 'OTHERS' },
  ];
  return (
    <Box className="update-details-container">
      <Typography variant="h6" className="update-details-title">
        Update Details
      </Typography>

      <Box component="form" onSubmit={handleSubmit} className="update-details-form">
        <Grid container spacing={3}>
          {[
            { label: 'Name', field: 'name' },
            { label: 'Email', field: 'email', type: 'email' },
            { label: 'Mobile', field: 'mobile' },
            { label: 'Address', field: 'address', multiline: true },
            { label: 'Postal Code', field: 'postalCode' }
          ].map(({ label, field, type = 'text', multiline = false }) => (
            <Grid item xs={12} md={6} key={field}>
              <CustomInput
                label={label}
                value={formData[field as keyof typeof formData]}
                onChange={(e) => handleInputChange(field, e.target.value)}
                type={type}
                multiline={multiline}
              />
            </Grid>
          ))}

          <Grid item xs={12} md={6}>
            <CustomSelect
              label="Country"
              options={countries.map(c => ({ label: c.name, value: c.id }))}
              value={formData.country}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('country', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <CustomSelect
              label="State"
              options={states.map(s => ({ label: s.name, value: s.id }))}
              value={formData.state}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('state', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <CustomSelect
              label="City"
              options={cities.map(c => ({ label: c.name, value: c.id }))}
              value={formData.city}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('city', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <CustomSelect
              label="Title"
              options={titleOptions}
              value={formData.title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('title', e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomButton type="submit" className="update-details-button">
              UPDATE
            </CustomButton>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default UpdateDetails;

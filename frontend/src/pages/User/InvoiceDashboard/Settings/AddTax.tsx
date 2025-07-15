import axios from 'axios';
import {jwtDecode} from 'jwt-decode';
import api from '@/helpers/apiHelper';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomButton from '@/components/CustomButton';
import CustomInput from '@/components/CustomInputField';
import PageHeader from '@/components/common/pageHeader';
const url = import.meta.env.VITE_NODE_ENV == "production" ? 'api' : 'api';
import { Box, Typography, RadioGroup, FormControlLabel, Radio } from '@mui/material';
import { useAppToast } from '@/utils/toast';

const AddTax = () => {
  const navigate = useNavigate();
  const toast = useAppToast();
  const [taxData, setTaxData] = useState({
    name: '',
    rate: '',
    isDefault: 'No',
  });

  const [touched, setTouched] = useState({
    name: false,
    rate: false,
  });

  // Placeholder validate and alertnotify functions
  const validate = (field: string, value: string) => {
    if (!value || value.trim() === '') return `${field} is required`;
    return '';
  };
  const HandleCreateTax = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate('name', taxData.name) && !validate('rate', taxData.rate)) {
      try {
        const decoded: any = jwtDecode(localStorage.getItem('token') as string);
        const response = await api.post(`/${url}/v1/tax/add`, {
          user: decoded?.data?.id,
          name: taxData.name,
          value: taxData.rate,
          isDefault: taxData.isDefault
        });
        console.log('API response:', response);
        if (response.data.status == 201) {
          toast.success(response.data.message);
          navigate('/settings');
        }
      } catch (error: any) {
        console.log("error", error);
        toast.error(error?.response?.data?.message);
      }
    } else {
      if (validate('name', taxData.name)) {
        const result = validate('name', taxData.name);
        // console.log(result);
      }
      if (validate('rate', taxData.rate)) {
        const result = validate('rate', taxData.rate);
        // console.log(result);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTaxData(prev => ({ ...prev, [name]: value }));
  };

  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTaxData(prev => ({ ...prev, isDefault: e.target.value }));
  };

  return (
      <Box component="form" onSubmit={HandleCreateTax} className="dashboard-container" >
        <PageHeader title='Add-tax' />
    <Box className="add-tax-form" >
      <CustomInput
        label="Name"
        name="name"
        value={taxData.name}
        onChange={handleChange}
        required
      />

      <CustomInput
        label="Tax Rate"
        name="rate"
        value={taxData.rate}
        onChange={handleChange}
        required
      />

      <Box>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          Default:
        </Typography>
        <RadioGroup
          row
          name="isDefault"
          value={taxData.isDefault}
          onChange={handleRadioChange}
        >
          <FormControlLabel value="Yes" control={<Radio />} label="Yes" />
          <FormControlLabel value="No" control={<Radio />} label="No" />
        </RadioGroup>
      </Box>

      <CustomButton type="submit">
        Submit
      </CustomButton>
      </Box>
    </Box>
  );
};

export default AddTax;


import { jwtDecode } from 'jwt-decode';
import api from '@/helpers/apiHelper';
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CustomButton from '@/components/CustomButton';
import CustomInput from '@/components/CustomInputField';
import PageHeader from '@/components/common/pageHeader';
const url = import.meta.env.VITE_NODE_ENV == 'production' ? 'api' : 'api';
import {
  Box,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';
import { useAppToast } from '@/utils/toast';

const EditTax = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const toast = useAppToast();
  const [taxData, setTaxData] = useState({
    name: '',
    rate: '',
    isDefault: 'No',
  });

  // Fetch tax details by id
  useEffect(() => {
    const getDetailsById = async (val: any) => {
      try {
        const result = await api.get(`/${url}/v1/tax/${val}`);
        if (result.data.status == 201 ) {
          const data = result.data.data[0];
          setTaxData({
            name: data.Name || '',
            rate: data.taxvalue || '',
            isDefault: data.IsDefault && (data.IsDefault.toLowerCase() === 'yes' ? 'Yes' : 'No'),
          });
        }
      } catch (error: any) {
        console.log("error", error);
      }
    };
    if (id) getDetailsById(id);
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTaxData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTaxData((prev) => ({ ...prev, isDefault: e.target.value }));
  };
  // Update tax API handler
  const HandleUpdateTax = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const decoded: any = jwtDecode(token as string);
      const result = await api.patch(`/${url}/v1/tax/update/${id}`, {
        user: decoded?.data?.id,
        name: taxData.name,
        value: taxData.rate,
        isDefault: taxData.isDefault
      });
      if (result.data.status == 201) {
        toast.success(result.data.message);
        navigate('/settings?tab=tax');

      } else {
        toast.error(result.data.message || 'Update failed');
      }
    } catch (error: any) {
      console.log("error", error);
      toast.error(error?.response?.data?.message || 'Error');
    }
  };

  return (
    <Box component="form" className="dashboard-container" onSubmit={HandleUpdateTax}>
      <PageHeader title={`Edit-tax/${id}`} />

      <Box className="add-tax-form">
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

        <CustomButton type="submit">Update</CustomButton>
      </Box>
    </Box>
  );
};

export default EditTax;

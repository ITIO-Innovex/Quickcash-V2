import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomButton from '@/components/CustomButton';
import CustomInput from '@/components/CustomInputField';
import PageHeader from '@/components/common/pageHeader';
import { Box, Typography, RadioGroup, FormControlLabel, Radio } from '@mui/material';

const AddTax = () => {
  const navigate = useNavigate();

  const [taxData, setTaxData] = useState({
    name: '',
    rate: '',
    isDefault: 'No',
  });

  const [touched, setTouched] = useState({
    name: false,
    rate: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTaxData(prev => ({ ...prev, [name]: value }));
  };

  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTaxData(prev => ({ ...prev, isDefault: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, rate: true });

    if (!taxData.name.trim() || !taxData.rate.trim()) {
      return;
    }

    console.log("Form Submitted:", taxData);
    // Here you can POST data to backend
    navigate('/invoices'); // back to listing after save
  };

  return (
      <Box component="form" onSubmit={handleSubmit} className="dashboard-container" >
        <PageHeader title='Add-tax' />
      <Typography variant="h5">Invoices/Add-Tax</Typography>
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

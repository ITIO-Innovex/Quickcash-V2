import React, { useState, useEffect } from 'react';
import CustomButton from '../CustomButton';
import CustomInput from '@/components/CustomInputField';
import { Box, Typography, Divider, useTheme, MenuItem, Select } from '@mui/material';
import admin from '@/helpers/adminApiHelper';
import { useAppToast } from '@/utils/toast'; 

const url = import.meta.env.VITE_NODE_ENV === "production" ? 'api' : 'api';

interface Props {
  onClose: () => void;
  onAdded?: () => void;
}

const CreateCurrencyForm: React.FC<Props> = ({ onClose, onAdded }) => {
  const theme = useTheme();
  const toast = useAppToast(); 
  const [currencyName, setCurrencyName] = useState('');
  const [currencyCode, setCurrencyCode] = useState('');
  const [currencyList, setCurrencyList] = useState<any[]>([]);

  useEffect(() => {
    getListCurrencyData();
  }, []);

  const getListCurrencyData = async () => {
    try {
      const result = await admin.get(`/${url}/v1/currency/currency-list`);
      if (result.data.status === 201) {
        setCurrencyList(result?.data?.data);
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  const HandleCurrency = (value: any) => {
    const splitValue = value.split('-');
    setCurrencyCode(splitValue[0]);
    setCurrencyName(splitValue[1]);
  }

  const addCurrencyToSave = async () => {
    try {
      const result = await admin.post(
        `/${url}/v1/currency/add`,
        {
          base_code: currencyCode,
          currencyName: currencyName,
        },
      );
      if (result.data.status === 201) {
        setCurrencyCode('');
        setCurrencyName('');
        toast.success(result?.data?.message);
        onAdded?.();
        onClose();
      }
    } catch (error) {
      console.log("error", error);
      toast.error(error?.response?.data?.message || "Error occurred");
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Currency Select Dropdown */}
      <Box>
        <Typography mb={1}>Currency Name</Typography>
        <Select
          onChange={(e) => HandleCurrency(e.target.value)}
          sx={{ color: theme.palette.mode === 'dark' ? 'white' : 'black' }}
          fullWidth
          value={currencyName ? `${currencyCode}-${currencyName}` : ''}
        >
          {currencyList?.map((item: any, index: number) => (
            <MenuItem
              key={index}
              value={`${item?.CurrencyCode}-${item?.CurrencyName}`}
              sx={{ color: theme.palette.mode === 'dark' ? 'white' : 'black' }}
            >
              {item?.CurrencyName}
            </MenuItem>
          ))}
        </Select>
      </Box>

      {/* Currency Code Display */}
      <CustomInput
        id="currencyCode"
        name="currencyCode"
        value={currencyCode}
        label="Currency Code"
        fullWidth
        disabled
      />

      {/* Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
        <CustomButton onClick={addCurrencyToSave}>Save</CustomButton>
        <CustomButton onClick={onClose}>Close</CustomButton>
      </Box>
    </Box>
  );
};

export default CreateCurrencyForm;

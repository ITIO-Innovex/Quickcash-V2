
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  IconButton,
  FormControl,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import CustomButton from '@/components/CustomButton';
import CustomTextField from '@/components/CustomTextField';
import CustomSelect from '@/components/CustomDropdown';
import api from '@/helpers/apiHelper';
import { useAppToast } from '@/utils/toast';
import { jwtDecode } from 'jwt-decode';
import ReactFlagsSelect from 'react-flags-select';
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
const AddBeneficiaryForm: React.FC = () => {
  const navigate = useNavigate();
  const toast = useAppToast();
  const [name, setName] = React.useState<any>('');
  const [iban, setIban] = React.useState<any>('');
  const [email, setEmail] = React.useState<any>('');
  const [mobile, setMobile] = React.useState<any>('');
  const [country, setCountry] = React.useState<any>();
  const [currency, setCurrency] = React.useState<any>();
  const [bicCode, setBicCode] = React.useState<any>('');
  const [address, setAddress] = React.useState<any>('');
  const [bankName, setBankName] = React.useState<any>('');
  const [currencyList, setCurrencyList] = React.useState<any>([]);
  const url = import.meta.env.VITE_NODE_ENV == "production" ? 'api' : 'api';
  const HandleCountryCurrency = (code: any) => {
    setCountry(code);
  }

  useEffect(() => {
    getListCurrencyData();
  }, []);
  const getListCurrencyData = async () => {
    await api.get(`/${url}/v1/currency/currency-list`)
      .then(result => {
        if (result.data.status == 201) {
          setCurrencyList(result?.data?.data);
        }
      })
      .catch(error => {
        console.log("error", error);
      })
  }
  const HandleSaveIndividualData = async () => {
    const accountId = jwtDecode<JwtPayload>(localStorage.getItem('token') as string);
    await api.post(`/${url}/v1/receipient/add`, {
      "name": name,
      "rtype": "Individual",
      "user": accountId?.data?.id,
      "iban": iban,
      "bic_code": bicCode,
      "country": country,
      "currency": currency,
      "amount": 0,
      "mobile": mobile,
      "email": email,
      "address": address,
      "bankName": bankName,
      "status": true
    },)
      .then(result => {
        if (result.data.status == "201") {
          setName(''); setCountry('');
          setIban(''); setCurrency('');
          setMobile(''); setAddress('');
          setEmail(''); setBankName('');
          toast.success(result.data.message);
        }
      })
      .catch(error => {
        console.log("error", error);
        toast.error(error.response.data.message);
      })
  }


  const handleBack = () => {
    navigate('/beneficiary');
  };

  return (
    <Box className="add-beneficiary-container" sx={{ p: 3 }}>
      <Box className="beneficery-box" >
        <IconButton onClick={handleBack}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5">
          Add New Beneficiary
        </Typography>
      </Box>

      <Box component="form" sx={{ maxWidth: 600, mx: 'auto' }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <CustomTextField
              label="First Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <CustomTextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              label="Mobile Number"
              type="number"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              label="Bank Name"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <label>Country</label>
            <FormControl
              fullWidth
            >
              <ReactFlagsSelect
                selected={country}
                onSelect={HandleCountryCurrency}
                searchable
                showOptionLabel={true}
                showSelectedLabel={true}
              />
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <CustomSelect
              label="Currency"
              value={currency}
              onSelect={(code) => setCurrency(code)}
              options={currencyList?.map((item) => ({
                label: item?.CurrencyName,
                value: item?.CurrencyCode
              }))}
            />
          </Grid>

          <Grid item xs={12}>
            <CustomTextField
              label="IBAN / AC"
              value={iban}
              onChange={(e) => setIban(e.target.value)}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              label="Routing/IFSC/BIC/SwiftCode"
              value={bicCode}
              onChange={(e) => setBicCode(e.target.value)}
              fullWidth
              required
            />
          </Grid>
        </Grid>

        <Box className="add-beneficiary-actions" sx={{ mt: 4 }}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <CustomButton
                onClick={handleBack}
                variant="outlined"
                fullWidth
                className="back-button"
              >
                Cancel
              </CustomButton>
            </Grid>
            <Grid item xs={6}>
              <CustomButton
                onClick={HandleSaveIndividualData}
                fullWidth
              >
                Add Beneficiary
              </CustomButton>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Box>
  );
};

export default AddBeneficiaryForm;

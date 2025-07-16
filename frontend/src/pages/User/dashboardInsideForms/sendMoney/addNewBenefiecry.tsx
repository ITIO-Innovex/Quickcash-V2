import React, { useEffect, useState } from 'react';
import {
    TextField,
    Button,
    Typography,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Box,
    Grid,
    IconButton
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import api from '@/helpers/apiHelper';
import { useAppToast } from '@/utils/toast';
import { jwtDecode } from 'jwt-decode';
import ReactFlagsSelect from 'react-flags-select';
import CustomSelect from '@/components/CustomDropdown';
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
    const HandleSaveIndividualData = async (e) => {
        e.preventDefault();
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
                if (result.data.status == 201) {
                    toast.success(result.data.message);
                    navigate('/beneficiary');
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
        <Box className="form-container">
            <Box className="form-box">
                <Box className="beneficery-box" >
                    <IconButton onClick={handleBack}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h5" className="header-title">
                        Beneficiary
                    </Typography>
                </Box>
                <form>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <InputLabel htmlFor="full-name" className="label">FULL NAME</InputLabel>
                            <TextField
                                className="custom-textfield"
                                id="name"
                                placeholder="Full Name"
                                variant="outlined"
                                fullWidth
                                size="small"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <InputLabel htmlFor="email" className="label">EMAIL</InputLabel>
                            <TextField
                                className="custom-textfield"
                                id="email"
                                placeholder="Email Address"
                                type="email"
                                variant="outlined"
                                fullWidth
                                size="small"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <InputLabel htmlFor="mobile" className="label">MOBILE</InputLabel>
                            <TextField
                                className="custom-textfield"
                                id="mobile"
                                placeholder="Mobile"
                                variant="outlined"
                                fullWidth
                                size="small"
                                value={mobile}
                                onChange={(e) => setMobile(e.target.value)}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <InputLabel htmlFor="bank-name" className="label">BANK NAME</InputLabel>
                            <TextField
                                className="custom-textfield"
                                id="bank-name"
                                placeholder="Bank Name"
                                variant="outlined"
                                fullWidth
                                size="small"
                                value={bankName}
                                onChange={(e) => setBankName(e.target.value)}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <InputLabel htmlFor="iban-ac" className="label">IBAN/AC</InputLabel>
                            <TextField
                                className="custom-textfield"
                                id="iban-ac"
                                placeholder="IBAN / AC"
                                variant="outlined"
                                fullWidth
                                size="small"
                                value={iban}
                                onChange={(e) => setIban(e.target.value)}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <InputLabel htmlFor="routing-swift" className="label">ROUTING/IFSC/BIC/SWIFTCODE</InputLabel>
                            <TextField
                                className="custom-textfield"
                                id="routing-swift"
                                placeholder="Routing/IFSC/BIC/SwiftCode"
                                variant="outlined"
                                fullWidth
                                size="small"
                                value={bicCode}
                                onChange={(e) => setBicCode(e.target.value)}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <InputLabel htmlFor="country-select" className="label">COUNTRY</InputLabel>
                            {/* <FormControl fullWidth variant="outlined" size="small" className="custom-select"> */}
                            <ReactFlagsSelect
                                selected={country}
                                onSelect={HandleCountryCurrency}
                                searchable
                                showOptionLabel={true}
                                showSelectedLabel={true}
                            />
                            {/* </FormControl> */}
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <InputLabel htmlFor="currency-select" className="label">
                                CURRENCY
                            </InputLabel>
                            {/* <FormControl fullWidth variant="outlined" size="small" className="custom-select"> */}
                            <Select
                                id="currency-select"
                                fullWidth
                                value={currency}
                                onChange={(e) => setCurrency(e.target.value)}
                            >
                                {currencyList?.map((item, index) => (
                                    <MenuItem key={index} value={item?.CurrencyCode}>
                                        {item?.CurrencyName}
                                    </MenuItem>
                                ))}
                            </Select>
                            {/* </FormControl> */}
                        </Grid>
                        <Grid item xs={12}>
                            <InputLabel htmlFor="recipient-address" className="label">RECIPIENT ADDRESS</InputLabel>
                            <TextField
                                className="custom-textfield"
                                id="recipient-address"
                                placeholder="Recipient Address"
                                variant="outlined"
                                fullWidth
                                multiline
                                rows={4}
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                            />
                        </Grid>

                        <Grid item xs={12} className="submit-button-container">
                            <Button
                                fullWidth
                                type="submit"
                                variant="contained"
                                className="modal-button"
                                onClick={HandleSaveIndividualData}
                            >
                                Submit
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Box>
        </Box>
    );
};

export default AddBeneficiaryForm;

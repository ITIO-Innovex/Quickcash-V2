import React, { useState, useEffect } from 'react';
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
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { JwtPayload } from '@/types/jwt';
import { toast } from 'sonner';
import api from '@/helpers/apiHelper';
import { useCurrency } from '@/hooks/useCurrency';
import { getAvailableTransferMethods } from '@/utils/transferMethodUtils';

const AddBeneficiaryForm: React.FC = () => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [mobile, setMobile] = useState('');
    const [bankName, setBankName] = useState('');
    const [ibanAc, setIbanAc] = useState('');
    const [routingSwiftCode, setRoutingSwiftCode] = useState('');
    const [country, setCountry] = useState('');
    const [currency, setCurrency] = useState('US Dollar');
    const [recipientAddress, setRecipientAddress] = useState('');
    const [countries, setCountries] = useState<any[]>([]);
    const { currencyList } = useCurrency();
    const navigate = useNavigate();
    const [selectedMethod, setSelectedMethod] = useState('');
    const [availableMethods, setAvailableMethods] = useState<any[]>([]);

    const url = import.meta.env.VITE_NODE_ENV === 'production' ? 'api' : 'api';

    useEffect(() => {
        const fetchCountries = async () => {
            try {
                const result = await api.get(`/${url}/v1/user/getCountryList`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });
                if (result.data.status === 201) {
                    setCountries(result.data.data?.country || []);
                }
            } catch (error) {
                console.log('Country List Error:', error);
            }
        };
        fetchCountries();
    }, []);

    useEffect(() => {
        if (currency) {
            let currencyCode = currency;
            if (currency === 'US Dollar') currencyCode = 'USD';
            if (currency === 'Euro') currencyCode = 'EUR';
            if (currency === 'Indian Rupee') currencyCode = 'INR';
            const methods = getAvailableTransferMethods('', currencyCode);
            setAvailableMethods(methods);
            setSelectedMethod(methods[0]?.methodId || '');
        } else {
            setAvailableMethods([]);
            setSelectedMethod('');
        }
    }, [currency]);

    const HandleSaveIndividualData = async () => {
        const accountId = jwtDecode<JwtPayload>(localStorage.getItem('token') as string);
        await axios.post(`/${url}/v1/receipient/add`, {
            "name": fullName,
            "rtype": "Individual",
            "user": accountId?.data?.id,
            "iban": ibanAc,
            "bic_code": routingSwiftCode,
            "country": country.slice(0, 2),
            "currency": currency,
            "amount": 0,
            "mobile": mobile,
            "email": email,
            "address": recipientAddress,
            "bankName": bankName,
            "status": true,
            "transferMethod": selectedMethod
        }, 
        {
            headers: 
            {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
        .then(result => {
            if(result.data.status == "201") {
                toast.success(result.data.message);
                const beneficiaryData = {
                    fullName,
                    email,
                    mobile,
                    bankName,
                    ibanAc,
                    routingSwiftCode,
                    country,
                    currency,
                    recipientAddress,
                    selectedMethod
                };
                localStorage.setItem('beneficiaryData', JSON.stringify(beneficiaryData));
                navigate("/send-money?step=2");
            }
        })
        .catch(error => {
            console.log("error", error);
            toast.error(error.response.data.message);
        })
    };

    const handleBack = () => {
        navigate("/beneficiary");
    };
    
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        HandleSaveIndividualData();
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
                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <InputLabel htmlFor="full-name" className="label">FULL NAME</InputLabel>
                            <TextField
                             className="custom-textfield"
                                id="full-name"
                                placeholder="Full Name"
                                variant="outlined"
                                fullWidth
                                size="small"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
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
                                value={ibanAc}
                                onChange={(e) => setIbanAc(e.target.value)}
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
                                value={routingSwiftCode}
                                onChange={(e) => setRoutingSwiftCode(e.target.value)}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <InputLabel htmlFor="country-select" className="label">COUNTRY</InputLabel>
                            <FormControl fullWidth variant="outlined" size="small" className="custom-select">
                                <Select
                                    id="country-select"
                                    value={country}
                                    onChange={(e) => setCountry(e.target.value)}
                                    displayEmpty
                                >
                                    <MenuItem value="" disabled>
                                        Select a Country
                                    </MenuItem>
                                    {countries.map((c) => (
                                        <MenuItem key={c.id} value={c.name}>{c.name}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <InputLabel htmlFor="currency-select" className="label">CURRENCY</InputLabel>
                            <FormControl fullWidth variant="outlined" size="small" className="custom-select">
                                <Select
                                    id="currency-select"
                                    value={currency}
                                    onChange={(e) => setCurrency(e.target.value)}
                                    displayEmpty
                                >
                                    <MenuItem value="" disabled>
                                        Select a Currency
                                    </MenuItem>
                                    {currencyList.map((cur) => (
                                        <MenuItem key={cur._id} value={cur.currency}>{cur.currency}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {availableMethods.length > 0 && (
                            <Grid item xs={12}>
                                <InputLabel className="label">Transfer Method</InputLabel>
                                <FormControl component="fieldset">
                                    <div style={{ display: 'flex', gap: 24 }}>
                                        {availableMethods.map((method) => (
                                            <label key={method.methodId} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <input
                                                    type="radio"
                                                    name="transferMethod"
                                                    value={method.methodId}
                                                    checked={selectedMethod === method.methodId}
                                                    onChange={() => setSelectedMethod(method.methodId)}
                                                />
                                                <span>{method.title} ({method.currency})</span>
                                            </label>
                                        ))}
                                    </div>
                                </FormControl>
                            </Grid>
                        )}

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
                                value={recipientAddress}
                                onChange={(e) => setRecipientAddress(e.target.value)}
                            />
                        </Grid>

                        <Grid item xs={12} className="submit-button-container">
                            <Button
                                fullWidth
                                type="submit"
                                variant="contained"
                                className="modal-button"
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

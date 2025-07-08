import React, { useState } from 'react';
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
    const navigate = useNavigate();

    const handleBack = () => {
        navigate("/beneficiary");
    };
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        console.log({
            fullName,
            email,
            mobile,
            bankName,
            ibanAc,
            routingSwiftCode,
            country,
            currency,
            recipientAddress,
        });
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
                                    <MenuItem value="USA">United States</MenuItem>
                                    <MenuItem value="CAN">Canada</MenuItem>
                                    <MenuItem value="GBR">United Kingdom</MenuItem>
                                    <MenuItem value="IND">India</MenuItem>
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
                                >
                                    <MenuItem value="US Dollar">US Dollar</MenuItem>
                                    <MenuItem value="Euro">Euro</MenuItem>
                                    <MenuItem value="Indian Rupee">Indian Rupee</MenuItem>
                                </Select>
                            </FormControl>
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

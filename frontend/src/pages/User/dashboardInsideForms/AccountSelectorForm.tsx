// components/AccountSelectModal.tsx
import axios from "axios";
import React, { useState } from "react";
import {
  Modal,
  Box,
  Typography,
  IconButton,
  TextField,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  InputAdornment,
  useTheme,
} from "@mui/material";
import { Close, Search } from "@mui/icons-material";
import { blue } from "@mui/material/colors";
import ReactCountryFlag from "react-country-flag";

interface Account {
  flag: string;
  label: string;
  balance: string;
  code: string;
  currency: string;
}

interface AccountSelectModalProps {
  open: boolean;
  selectedValue: string;
  onClose: (value: string) => void;
  activeToAccount: (value: string) => void;
  accountsList: any;
  ActiveAccountDetails: any;
  activeAccountBal: any;
  fromValue: any;
  convertedValue: any;
  setFromValue: any;
  setConvertedValue: any;
  setToExchangeBox: any;
  setActiveRate: any;
  setCalCulateOpen: any;
  calCulateOpen: any;
  feeChargeAmount: any;
  reviewFlag: any;
}

const AccountSelectModal: React.FC<AccountSelectModalProps> = ({
open,
onClose,
selectedValue,
activeToAccount,
accountsList,
ActiveAccountDetails,
activeAccountBal,
fromValue,
convertedValue,
setFromValue,
setConvertedValue,
setToExchangeBox,
setActiveRate,
setCalCulateOpen,
calCulateOpen,
feeChargeAmount,
reviewFlag
}) => {
  const theme = useTheme();
  const [search, setSearch] = useState("");
  const [exchangeError, setExchangeError] = useState<any>(false);

  const filteredAccounts = accountsList.filter((acc) =>
    acc.name.toLowerCase().includes(search.toLowerCase()) ||
    acc.iban.toLowerCase().includes(search.toLowerCase())
  );
    const HandleSwitchAccount = (item: any) => {
    activeToAccount(item);
    onClose(item);
    setToExchangeBox(item);
    calCulateExChangeCurrencyValue(item);
  };
  const calCulateExChangeCurrencyValue = async (item: any) => {
    // setFromValue(activeAccountBal);
    if (
      fromValue &&
      localStorage.getItem("currentCurrency") != item?.currency
    ) {
      localStorage.setItem("currentCurrency", item?.currency);
      setCalCulateOpen(true);
      const options = {
        method: "GET",
        url: "https://currency-converter18.p.rapidapi.com/api/v1/convert",
        params: {
          from: ActiveAccountDetails
            ? ActiveAccountDetails.currency
            : "",
          to: item?.currency,
          amount: 1,
        },
        headers: {
          "X-RapidAPI-Key": import.meta.env.VITE_RAPID_API_KEY,
          "X-RapidAPI-Host": import.meta.env.VITE_RAPID_API_HOST,
        },
      };

      try {
        const response = await axios.request(options);
        if (response.data.success) {
          setCalCulateOpen(false);
          setConvertedValue(response.data.result.convertedAmount * fromValue);
          setActiveRate(
            parseFloat(response.data.result.convertedAmount).toFixed(3)
          );
        } else {
          setCalCulateOpen(false);
          setExchangeError(response.data.validationMessage[0]);
        }
      } catch (error) {
        console.error(error);
        setCalCulateOpen(false);
      }
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box className='account-box'sx={{backgroundColor:theme.palette.background.default}} >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" fontWeight="bold">Change Account</Typography>
          <IconButton onClick={() => onClose(selectedValue)}>
            <Close />
          </IconButton>
        </Box>

        <Typography variant="body2" mb={2}>
          Select your preferred account for currency exchange.
        </Typography>

        <TextField
          placeholder="Search by name or code"
          fullWidth
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />

        <List>
          {accountsList.map((acc, index) => (
            <ListItem className="acoount-list-item"
              key={index}
              onClick={() => HandleSwitchAccount(acc)}
            >
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: blue[100], color: blue[600] }}>
                  <ReactCountryFlag
                    countryCode={acc?.country}
                    svg
                    style={{
                      width: "2em",
                      height: "2em",
                      borderRadius: "50%",
                    }}
                    cdnUrl="https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.4.3/flags/1x1/"
                    cdnSuffix="svg"
                    title={acc?.country}
                  />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={acc?.name}
                secondary={`${acc?.amount} - ${acc?.iban}`}
                primaryTypographyProps={{ fontWeight: "bold" }}
                secondaryTypographyProps={{color:'text.gray'}}
              />
            </ListItem>
          ))}
          {accountsList.length === 0 && (
            <Typography variant="body2" color="text.primary" align="center" mt={2}>
              No accounts match your search.
            </Typography>
          )}
        </List>
      </Box>
    </Modal>
  );
};

export default AccountSelectModal;

import 'swiper/css';
import 'swiper/css/pagination';
import { Pagination } from 'swiper/modules';
import AddIcon from '@mui/icons-material/Add';
import SendIcon from '@mui/icons-material/Send';
import React, { useEffect, useState } from 'react';
import AppsIcon from '@mui/icons-material/Apps';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Sell, Wallet } from '@mui/icons-material';
import CustomModal from '@/components/CustomModal';
import { Link, useNavigate } from 'react-router-dom';
import CommonTooltip from '@/components/common/toolTip';
import AddMoneyForm from './dashboardInsideForms/AddMoney';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import CurrencyExchangeForm from './dashboardInsideForms/CurrencyExchange';
import SelectCryptoModal from './selectCurrencyModal';
import { jwtDecode } from 'jwt-decode';
import { JwtPayload } from '@/types/jwt';
import api from '@/helpers/apiHelper';
import ReactCountryFlag from "react-country-flag";
import { Box, Button,Tooltip, Card, CardContent, Tab, Tabs, Typography, useTheme } from '@mui/material';
import getSymbolFromCurrency from "currency-symbol-map";
import { Grid } from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
interface ActiveAccDetails {
  _id: string;
  amount: any;
  bic_code: string;
  country: string;
  currency: any;
  defaultAccount: string;
  iban: string;
  name: string;
  status: Boolean;
}

//Set the API URL based on the environment
const url = import.meta.env.VITE_NODE_ENV === "production" ? "api" : "api";
const FiatCrypto = () => {
    const [fiatAccounts, setfiatAccounts] = useState([]);
    const [DefaultAccountItem, setDefaultAccountItem] = React.useState<any>();
    const [ActiveAccountDetails, setActiveAccountDetails] =React.useState<ActiveAccDetails>();
    const [activeAccountBal, setActiveAccountBal] = React.useState<any>();
    const [accountChange, setAccountChange] = React.useState("all_account");
    const [cryptoCoins, setCryptoCoins] = React.useState<any>([]);
    const [toExchangeAccount, setToExchangeAccount] = useState("");

    const theme = useTheme  ();
    const [activeTab, setActiveTab] = useState('Fiat');
    // Fetch the Fiat Crypto data when the component mounts
        useEffect(() => {
        if (localStorage.getItem("token")) {
            const accountId = jwtDecode<JwtPayload>(
            localStorage.getItem("token") as string
            );
            getAllAccountsList(accountId.data.id);
            fetchCyrptoCoins(accountId.data.id);
            var valSearch = location?.search
            ?.replace("?currency=", "")
            .replace("?", "");
            if (valSearch.substring(0, 6) == "crypto") {
                setDisplayCryptoItem(valSearch?.replace("crypto=", ""));
            }
        }
        }, []);
    // Function to fetch all accounts list
    const getAllAccountsList = async (id: string, text = "") => {
        try {
            const result = await api.get(`/${url}/v1/account/list/${id}?title=${text}`);
            if (result.data.status === 201) {
                setfiatAccounts(result.data.data);
                console.log("fiatAccounts", result.data.data);
                setActiveAccountBal(result?.data?.totalAmt);
                getDefaultAccountList(id);
            } else {
                console.error("Failed to fetch accounts:", result.data.message);
            }
        } catch (error) {
            console.error("Error fetching accounts:", error);
        }
    };
    // Function to fetch crypto coins
    const fetchCyrptoCoins = async (id: any) => {
        try {
            // Fetching crypto coins from the API
            const response = await api.get(`/${url}/v1/walletaddressrequest/list/${id}`);
            if (response.data.status === 201) {
                setCryptoCoins(response.data.data);
            }
            } catch (error) {
                console.error("Error fetching crypto coins:", error);
            }
    };
    const getDefaultAccountList = async (id: any) => {
    if (!localStorage.getItem("activeCurr")) {
        try {
          const result = await api.get(`/${url}/v1/account/default/${id}`);
          if (result.data.status === 201) {
            setDefaultAccountItem(result.data.data[0]);
            setActiveAccountDetails(result.data.data[0].accountDetails);
            localStorage.setItem(
              "currency",
              result.data.data[0].accountDetails.currency
            );
            localStorage.setItem(
              "amount",
              result.data.data[0].accountDetails.amount
            );
            localStorage.setItem(
              "activeCurr",
              result.data.data[0].accountDetails._id
            );
          }
        } catch (error) {
          console.log("error", error);
        }
      } else {
            activeAccountDetails(localStorage.getItem("activeCurr"));
        }
     
    };
    const activeAccountDetails = async (id: any) => {
        try {
            const result = await api.get(`/${url}/v1/account/accountbyid/${id}`);
            if (result.data.status === 201) {
                setActiveAccountDetails(result.data.data);
                setActiveAccountBal(result.data.data.amount);
                setAccountChange(result.data.data.name);
                localStorage.setItem("currency", result.data.data.currency);
                localStorage.setItem("amount", result.data.data.amount);
                localStorage.setItem("activeCurr", result.data.data._id);
            }
        } catch (error) {
            console.log("error", error);
        }
    };
    const HandleAccountChange = (itm: any, type: any, bal: any, trans: any) => {
        if (type == "all_account") {
        const accountId = jwtDecode<JwtPayload>(
            localStorage.getItem("token") as string
        );
        getAllAccountsList(accountId?.data?.id);
        setActiveAccountBal(DefaultAccountItem?.accountDetails?.amount);
        setAccountChange(type);
        getDefaultAccountList(accountId?.data?.id);
        setTimeout(() => {
        }, 500);
        navigate(`/dashboard?currency=all`);
        } else {
        setActiveAccountDetails(itm);
        setAccountChange(type);
        setActiveAccountBal(bal);
        localStorage.setItem("currency", itm?.currency);
        localStorage.setItem("activeCurr", itm?._id); 
        setTimeout(() => {
        }, 500);
        navigate(`/dashboard?currency=${itm?.currency}`);
        }
    };
    const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
        setActiveTab(newValue);
    };
    const [isAddMoneyOpen, setIsAddMoneyOpen] = useState(false);
    const [isCurrencyExchnageOpen, setIsCurrencyExchnageOpen] = useState(false);

    const handleAddMoneyOpen = () => setIsAddMoneyOpen(true);
    const handleAddMoneyClose = () => setIsAddMoneyOpen(false);
    // const handleCurrencyExchangeOpen = () => setIsCurrencyExchnageOpen(true);
    const handleCurrencyExchangeClose = () => setIsCurrencyExchnageOpen(false);
    const [isCryptoModalOpen, setIsCryptoModalOpen] = useState(false);


    const navigate = useNavigate();
    const handleClick = () => {
        navigate('/account-section');
    };
    const [displayCryptoItem, setDisplayCryptoItem] = React.useState<any>("");

    const HandleDisplayCryptoItemData = (id: any) => {
        setDisplayCryptoItem(id);
        navigate(`/dashboard?crypto=${id}`);
    };
    const handleClickExchangeOpen = () => {
    if (ActiveAccountDetails?.amount > 0) {
      localStorage.removeItem("currentCurrency");
      setToExchangeAccount("");
      setTimeout(() => {
        setIsCurrencyExchnageOpen(true);
      }, 100);
    } else {
        console.log("Error");
        toast.error("Default account has 0 amount, please add amount in default account otherwise switch account");
    }
    };

    return (
        <>
            <Box >
                <Card sx={{color:theme.palette.text.primary, backgroundColor:theme.palette.background.default}}>
                    <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                        <Box className='crypto-section-header'>
                            <Tabs
                                value={activeTab}
                                onChange={handleTabChange}
                                sx={{
                                    minHeight: '48px',
                                    '& .MuiTab-root': { minHeight: '48px' },
                                }}
                            >
                                <Tab label="Fiat" value="Fiat" className='label-fiat-crypto' sx={{color:theme.palette.text.primary}} />
                                <Tab label="Crypto" value="Crypto" className='label-fiat-crypto' sx={{color:theme.palette.text.primary}}/>
                            </Tabs>

                            <Box className="icon-account" onClick={handleClick} sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                                <AppsIcon fontSize="small"sx={{color:theme.palette.text.primary}} />
                                <Typography variant="body2" sx={{ fontWeight: 500, ml: 1 }}>
                                    <span className="button-text" style={{color:theme.palette.text.primary}}>Account Section</span>
                                </Typography>
                            </Box>
                        </Box>

                        {activeTab === 'Fiat' && (
                            <Box sx={{color:theme.palette.text.primary}}>
                                {/* Header Section */}
                                <Box
                                    className='header-section'
                                    sx={{
                                        flexDirection: { xs: 'column', sm: 'row' },
                                        alignItems: { xs: 'flex-start', sm: 'center' },
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        mb: 2,
                                        color:theme.palette.text.primary,
                                    }}
                                >
                                    <Box className='img-section' onClick={() => setIsCryptoModalOpen(true)} sx={{ mb: { xs: 1, sm: 0 }, display: 'flex', alignItems: 'center' }}>
                                        
                                        <Typography variant="subtitle1" sx={{ fontWeight: 'semibold', ml: 1 }}>
                                            {ActiveAccountDetails ? (
                                                <>
                                                    <ReactCountryFlag
                                                        countryCode={ActiveAccountDetails?.country}
                                                        svg
                                                        style={{
                                                            width: "2em",
                                                            height: "2em",
                                                            borderRadius: "50%",
                                                        }}
                                                        cdnUrl="https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.4.3/flags/1x1/"
                                                        cdnSuffix="svg"
                                                        title={ActiveAccountDetails?.country}
                                                    />
                                                    {" "}{ActiveAccountDetails?.currency} Account : {getSymbolFromCurrency(ActiveAccountDetails?.currency)}
                                                </>
                                                ) : (
                                                <>
                                                    <ReactCountryFlag
                                                        countryCode={DefaultAccountItem?.country}
                                                        svg
                                                        style={{
                                                            width: "2em",
                                                            height: "2em",
                                                            borderRadius: "50%",
                                                        }}
                                                        cdnUrl="https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.4.3/flags/1x1/"
                                                        cdnSuffix="svg"
                                                        title={DefaultAccountItem?.country}
                                                        />
                                                        {" "}{DefaultAccountItem?.currency} Account : {getSymbolFromCurrency(DefaultAccountItem?.currency)}
                                                </>
                                                )}
                                                {" "}
                                                {activeAccountBal !== undefined
                                                ? parseFloat(activeAccountBal).toFixed(2)
                                                : "0.00"}

                                            {/* {selectedCrypto.currency} Account : {selectedCrypto.balance} */}
                                        </Typography>       
                                        <ExpandMoreIcon sx={{ width: 16, height: 16, ml: 0.5, cursor: 'pointer' }} />
                                    </Box>
                                    <Box className='button-section' sx={{ display: 'flex', gap: 1 }}>
                                        <CommonTooltip title="Easily add funds to your wallet using your debit card or linked bank account for instant access.">
                                        <Button className="custom-button" onClick={handleAddMoneyOpen}>
                                            <AddIcon className='icon-size' />
                                            <span className="button-text">Add money</span>
                                        </Button>
                                        </CommonTooltip>

                                        <CommonTooltip title="Seamlessly convert between multiple currencies with real-time exchange rates and low fees.">
                                        <Button className="custom-button" onClick={handleClickExchangeOpen}>
                                            <CompareArrowsIcon className='icon-size' />
                                            <span className="button-text">Exchange</span>
                                        </Button>
                                        </CommonTooltip>

                                        <CommonTooltip title="Send money instantly to friends, family, or other users—locally or internationally.">
                                        <Button
                                            component={Link}
                                            to="/send-money"
                                            className="custom-button"
                                        >
                                            <SendIcon className="icon-size" />
                                            <span className="button-text">Send</span>
                                        </Button>
                                        </CommonTooltip>
                                        
                                    </Box>
                                </Box>

                                {/* Swiper Slider */}
                                <Swiper
                                    spaceBetween={16}
                                    slidesPerView={1}
                                    pagination={{ clickable: true }}
                                    breakpoints={{
                                        640: { slidesPerView: 2, spaceBetween: 20 },
                                        992: { slidesPerView: 3, spaceBetween: 30 },
                                        1400: { slidesPerView: 4, spaceBetween: 30 },
                                    }}
                                    modules={[Pagination]}
                                    style={{ paddingBottom: '2rem' }}
                                >
                                    {fiatAccounts.map((account, index) => {
                                        const isActive = account._id === ActiveAccountDetails?._id;
                                        return (
                                            <SwiperSlide key={index}>
                                                <Card
                                                    className={`crypto-card ${isActive ? 'active' : 'inactive'}`}
                                                    onClick={() => {
                                                          HandleAccountChange(account, account.name, account.amount, account.transDetails);                   
                                                    }}
                                                    sx={{ cursor: 'pointer' }}
                                                >
                                                    <CardContent className='card-content-custom'>
                                                        <Box className='main-content-section' sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            {/* ReactCountryFalg */}
                                                            <ReactCountryFlag
                                                                countryCode={account.country}
                                                                svg
                                                                style={{
                                                                    width: "2em",
                                                                    height: "2em",
                                                                    borderRadius: "50%",
                                                                }}
                                                                cdnUrl="https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.4.3/flags/1x1/"
                                                                cdnSuffix="svg"
                                                                title={account.country}
                                                            />
                                                            {/* End ReactCountryFlag */}
                                                            <Typography
                                                                className={`currency-subtitle ${isActive ? 'active' : ''}`}
                                                                variant="subtitle1"
                                                            >
                                                                 {account.currency}
                                                            </Typography>
                                                        </Box>

                                                        <Box className='currency-detail' sx={{ mt: 1 }}>
                                                            <Typography variant="body2" sx={{ color: isActive ? '#e5e7eb' : '#4b5563' }}>
                                                                {account.name}
                                                            </Typography>
                                                            <Typography
                                                                className={`account-balance ${isActive ? 'active' : ''}`}
                                                                variant="body1"
                                                            >
                                                               {getSymbolFromCurrency(account?.currency)} {parseFloat(account.amount).toFixed(3)}
                                                            </Typography>
                                                        </Box>
                                                    </CardContent>
                                                </Card>
                                            </SwiperSlide>
                                        );
                                    })}

                                    {/* Default Add Currency Card */}
                                    <SwiperSlide key="add-currency-fiat">
                                        <Card
                                            className="card-content-custom add-card"
                                            onClick={handleClick}
                                        >
                                            <CardContent className='add-card-content'>
                                                <AddIcon className='add-icon-currency' />
                                                <Typography variant="subtitle1" className='text-add-currency'>
                                                    Add Currency
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </SwiperSlide>
                                </Swiper>
                            </Box>
                        )}

                        {activeTab === 'Crypto' && (
                            <Box>           
                                <Box
                                    className='header-section'
                                    sx={{
                                        flexDirection: { xs: 'column', sm: 'row' },
                                        alignItems: { xs: 'flex-start', sm: 'center' },
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        mb: 2,
                                      
                                    }}
                                >

                                    <Box className='button-section' sx={{ display: 'flex', gap: 1 }}>
                                        <Button className='custom-button'>
                                            <Sell className='icon-size' />
                                            <span className='button-text'>Buy/Sell</span>
                                        </Button>
                                        <Button className='custom-button'>
                                            <Wallet className='icon-size' />
                                            <span className='button-text'> Wallet Address</span>
                                        </Button>
                                    </Box>
                                </Box>

                                <Swiper
                                    spaceBetween={16}
                                    slidesPerView={1}
                                    pagination={{ clickable: true }}
                                    breakpoints={{
                                        600: { slidesPerView: 1 },
                                        960: { slidesPerView: 3 },
                                    }}
                                    modules={[Pagination]}
                                    style={{ paddingBottom: '1.5rem' }}
                                >
                                    {cryptoCoins.map((item: any, index: number) => {
                                        const isActive = displayCryptoItem ==item?.coin;

                                        return (
                                            <SwiperSlide key={index}>
                                               <Card
                                                    className={`crypto-card ${isActive ? 'active' : 'inactive'}`}
                                                    onClick={() => {
                                                        HandleDisplayCryptoItemData(item?.coin)
                                                    }}
                                                    sx={{ cursor: 'pointer' }}
                                                >
                                                  
                                                    <CardContent className='card-content-custom'>
                                                        <Box className='main-content-section' sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <img
                                                                loading="lazy"
                                                                style={{
                                                                height: "30px",
                                                                width: "30px",
                                                                borderRadius: "50px",
                                                                }}
                                                                src={`https://assets.coincap.io/assets/icons/${item?.coin
                                                                .split("_")[0]
                                                                .replace("_TEST", "")
                                                                .toLowerCase()}@2x.png`}
                                                                alt={`${item?.coin}`}
                                                            />
                                                            <Typography
                                                                className={`currency-subtitle ${isActive ? 'active' : ''}`}
                                                                variant="subtitle1"
                                                            >
                                                                {item.coin.replace("_TEST", "")}
                                                            </Typography>
                                                        </Box>

                                                        <Box className='currency-detail' sx={{ mt: 1 }}>
                                                            <Typography variant="body2" sx={{ color: isActive ? '#e5e7eb' : '#4b5563' }}>
                                                                {item?.walletAddress?.length > 7
                                                                ? item?.walletAddress?.substring(0, 7) + "..."
                                                                : item?.walletAddress}
                                                            </Typography>
                                                            <Typography
                                                                className={`account-balance ${isActive ? 'active' : ''}`}
                                                                variant="body1"
                                                            >
                                                                {item?.noOfCoins?.length > 7
                                                                ? item?.noOfCoins?.substring(0, 7) + "..."
                                                                : item?.noOfCoins}
                                                            </Typography>
                                                        </Box>
                                                    </CardContent>
                                                </Card>
                                            </SwiperSlide>
                                        );
                                    })}

                                    {/* Default Add Currency Card */}
                                    <SwiperSlide key="add-currency-crypto">
                                        <Card
                                            className="card-content-custom add-card"
                                            onClick={handleClick}
                                        >
                                            <CardContent className='add-card-content'>
                                                <AddIcon className='add-icon-currency' />
                                                <Typography variant="subtitle1" className='text-add-currency'>
                                                    Add Currency
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </SwiperSlide>
                                </Swiper>
                            </Box>
                        )}
                    </CardContent>
                </Card>
            </Box>

            <CustomModal open={isAddMoneyOpen} onClose={handleAddMoneyClose} title="Add Money" sx={{backgroundColor:theme.palette.background.default, color:theme.palette.text.primary}}>
                <AddMoneyForm
                    accountChange={setAccountChange}
                    onClose={handleAddMoneyClose} 
                    activeAccount={ActiveAccountDetails?._id}
                    accountBalance={ActiveAccountDetails?.amount}
                    acctDetails={ActiveAccountDetails}
                    accountList={fiatAccounts}
                />
            </CustomModal>

            <CustomModal open={isCurrencyExchnageOpen} onClose={handleCurrencyExchangeClose} title="Exchange Currency" sx={{backgroundColor:theme.palette.background.default, color:theme.palette.text.primary}}>
                <CurrencyExchangeForm onClose={handleCurrencyExchangeClose}
                    activeAccount={ActiveAccountDetails?._id}
                    accountBalance={ActiveAccountDetails?.amount}
                    acctDetails={ActiveAccountDetails}
                    accountList={fiatAccounts}/>
            </CustomModal>

                <SelectCryptoModal
                    open={isCryptoModalOpen}
                    onClose={() => setIsCryptoModalOpen(false)}
                    accounts={fiatAccounts}
                    onSelect={(account) => {
                        // setSelectedCrypto(account);
                        const index = fiatAccounts.findIndex((a) => a.currency === account.currency);
                    
                    }}
                    handleAccountChange={HandleAccountChange}
                
                />

        </>
    );
};

export default FiatCrypto;

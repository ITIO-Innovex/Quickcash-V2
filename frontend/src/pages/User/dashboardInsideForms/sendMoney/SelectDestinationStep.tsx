
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Tab,
  Tabs,
  useTheme,
} from "@mui/material";
import { useNavigate } from 'react-router-dom';
import CustomButton from '@/components/CustomButton';
import CountryCard from '@/components/CountryCard';
import CountryDropdown from '@/components/CountryDropdown';

interface Beneficiary {
  id: string;
  name: string;
  accountNumber: string;
  country: string;
  currency: string;
}

interface SelectDestinationStepProps {
  formData: any;
  updateFormData: (data: any) => void;
  onNext: () => void;
  onBeneficiaryTab: () => void;
  onSelectBeneficiary?: (beneficiary: Beneficiary) => void;
  currencyList?:any[];
}

// Step 1: Destination Selection Component - Choose destination country or select existing beneficiary
const SelectDestinationStep: React.FC<SelectDestinationStepProps> = ({
  formData,
  updateFormData,
  onNext,
  onBeneficiaryTab,
  onSelectBeneficiary,
  currencyList,
}) => {
  const theme  = useTheme();
  const navigate = useNavigate();
  const [selectedCurrency, setSelectedCurrency] = useState(formData.selectedCurrency || '');
  const [activeTab, setActiveTab] = useState(0);
  const [selectedCurrencyVal, setSelectedCurrencyVal] = useState<string | null>(null);

  // Featured countries displayed as cards
    // Split currency list
  const featuredCurrencies = currencyList.slice(0, 4);
  const otherCurrencies = currencyList.slice(4);
  // Other countries available in dropdown
  // Filter out featured currencies from dropdown to avoid duplicates
  const filteredOtherCountries = otherCurrencies.filter(
    country => !featuredCurrencies.some(featured => featured.currency === country.currency)
  );

  const handleCountrySelect = (currency: string, id:any, country:any) => {
    const val = `${currency}-${id}-${country}`;
    setSelectedCurrencyVal(val);
    setSelectedCurrency(currency);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    
    // If user clicks on beneficiary tab, navigate to beneficiary page
    if (newValue === 1) {
      onBeneficiaryTab();
    }
  };

  const handleContinue = () => {
    if (selectedCurrency) {
      updateFormData({ 
        selectedCurrency,
        toCurrency: selectedCurrency,
        sendCurrencyData:selectedCurrencyVal
      });
      onNext();
    }
  };

  const isFeaturedSelected = featuredCurrencies.some(country => country.currency === selectedCurrency);

  return (
    <Box className="destination-step">
      <Typography variant="h6" className="step-title" sx={{color:theme.palette.text.primary}}>
        Where do you want to send money?
      </Typography>
      <Typography variant="body2" className="step-description" sx={{color:theme.palette.text.gray}}>
        Select your destination country or choose from existing beneficiaries
      </Typography>

      {/* Tab Navigation - Switch between currency selection and beneficiary selection */}
      <Box className="tab-navigation">
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          className="destination-tabs"
          centered
        >
          <Tab label="Select Currency" />
          <Tab label="Select Beneficiary" sx={{color:theme.palette.text.primary}} />
        </Tabs>
      </Box>

      {activeTab === 0 && (
        <Box className="currency-content">
          {/* Featured Currency Cards - Quick selection for popular countries */}
          <Grid container spacing={3} className="country-cards" >
            {featuredCurrencies.map((currency) => (
              <Grid item xs={12} sm={6} md={3} key={currency.code}  >
                <CountryCard 
                  countryCode={currency.country}
                  currencyCode={currency.currency}
                  id={currency._id}
                  selected={selectedCurrency === currency.currency}
                  onClick={() => handleCountrySelect(currency.currency, currency._id,currency.country)}
                />
              </Grid>
            ))}
          </Grid>

          {/* Other Countries Dropdown - All other available destinations */}
          <Box className="other-countries" sx={{ mt: 3 }}>
            <Typography variant="subtitle1" className="other-countries-label" sx={{ mb: 2 }}>
              Select Other Currency
            </Typography>
           <CountryDropdown
              label="Select other Currency"
              countries={filteredOtherCountries}
              value={!isFeaturedSelected ? selectedCurrency : ''}
              onChange={(e) => {
                const value = e.target.value as string;
                setSelectedCurrency(value);
                updateFormData({
                  selectedCurrency: value,
                  toCurrency: value,
                });
              }}
            />
          </Box>

          {/* Continue Button - Proceed to next step */}
          <Box className="step-actions" sx={{ mt: 4 }}>
            <CustomButton
              onClick={handleContinue}
              disabled={!selectedCurrency}
              fullWidth
              className="continue-button"
            >
              Continue
            </CustomButton>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default SelectDestinationStep;

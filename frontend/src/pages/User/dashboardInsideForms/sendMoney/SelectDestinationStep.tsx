import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Tab,
  Tabs,
  useTheme,
  Alert,
} from "@mui/material";
import { useNavigate } from 'react-router-dom';
import CustomButton from '@/components/CustomButton';
import CountryCard from '@/components/CountryCard';
import CountryDropdown from '@/components/CountryDropdown';
import { getRecommendedTransferMethod, getAvailableTransferMethods } from '@/utils/transferMethodUtils';

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
  const featuredCurrencies = currencyList?.slice(0, 4) || [];
  const otherCurrencies = currencyList?.slice(4) || [];
  // Other countries available in dropdown
  // Filter out featured currencies from dropdown to avoid duplicates
  const filteredOtherCountries = otherCurrencies.filter(
    country => !featuredCurrencies.some(featured => featured.currency === country.currency)
  );

  const handleCountrySelect = (currency: string, id:any, country:any) => {
    const val = `${currency}-${id}-${country}`;
    setSelectedCurrencyVal(val);
    setSelectedCurrency(currency);
    
    // Automatically determine the recommended transfer method
    const recommendedMethod = getRecommendedTransferMethod(country, currency);
    const availableMethods = getAvailableTransferMethods(country, currency);
    
    // Update form data with transfer method information
    updateFormData({
      selectedCurrency,
      toCurrency: currency,
      sendCurrencyData: val,
      recommendedTransferMethod: recommendedMethod.methodId,
      availableTransferMethods: availableMethods.map(m => m.methodId),
      transferMethod: recommendedMethod.methodId, // Set as default
      transferMethodDetails: recommendedMethod,
      destinationCountry: country,
      destinationCurrency: currency
    });
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
      // If transfer method wasn't set during country selection, set it now
      if (!formData.transferMethod && selectedCurrencyVal) {
        const currencyParts = selectedCurrencyVal.split('-');
        if (currencyParts.length >= 3) {
          const country = currencyParts[2];
          const currency = currencyParts[0];
          const recommendedMethod = getRecommendedTransferMethod(country, currency);
          const availableMethods = getAvailableTransferMethods(country, currency);
          
          updateFormData({
            selectedCurrency,
            toCurrency: selectedCurrency,
            sendCurrencyData: selectedCurrencyVal,
            recommendedTransferMethod: recommendedMethod.methodId,
            availableTransferMethods: availableMethods.map(m => m.methodId),
            transferMethod: recommendedMethod.methodId,
            transferMethodDetails: recommendedMethod,
            destinationCountry: country,
            destinationCurrency: currency
          });
        }
      }
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
                
                // Find the selected currency details
                const selectedCurrencyData = filteredOtherCountries.find(c => c.currency === value);
                if (selectedCurrencyData) {
                  const val = `${value}-${selectedCurrencyData._id}-${selectedCurrencyData.country}`;
                  setSelectedCurrencyVal(val);
                  
                  // Automatically determine the recommended transfer method
                  const recommendedMethod = getRecommendedTransferMethod(selectedCurrencyData.country, value);
                  const availableMethods = getAvailableTransferMethods(selectedCurrencyData.country, value);
                  
                  // Update form data with transfer method information
                  updateFormData({
                    selectedCurrency: value,
                    toCurrency: value,
                    sendCurrencyData: val,
                    recommendedTransferMethod: recommendedMethod.methodId,
                    availableTransferMethods: availableMethods.map(m => m.methodId),
                    transferMethod: recommendedMethod.methodId,
                    transferMethodDetails: recommendedMethod,
                    destinationCountry: selectedCurrencyData.country,
                    destinationCurrency: value
                  });
                } else {
                  updateFormData({
                    selectedCurrency: value,
                    toCurrency: value,
                  });
                }
              }}
            />
          </Box>

          {/* Transfer Method Preview */}
          {formData.transferMethodDetails && (
            <Box sx={{ mt: 3, p: 2, borderRadius: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="subtitle2" sx={{ mb: 1, color: theme.palette.text.primary, fontWeight: 600 }}>
                Transfer Method
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                  {formData.transferMethodDetails.title} • {formData.transferMethodDetails.time} • Fee: ${formData.transferMethodDetails.fee}
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ color: theme.palette.text.gray, fontStyle: 'italic' }}>
                This is the available transfer method for {formData.destinationCurrency} transfers.
              </Typography>
            </Box>
          )}

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

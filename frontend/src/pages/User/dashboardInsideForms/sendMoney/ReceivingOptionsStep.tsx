
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
} from "@mui/material";
import { Wallet, Building2, CreditCard, MapPin } from 'lucide-react';
import CustomButton from '@/components/CustomButton';

interface ReceivingOptionsStepProps {
  formData: any;
  updateFormData: (data: any) => void;
  onNext: () => void;
  onPrevious: () => void;
}

const ReceivingOptionsStep: React.FC<ReceivingOptionsStepProps> = ({
  formData,
  updateFormData,
  onNext,
  onPrevious,
}) => {
  const [selectedOption, setSelectedOption] = useState(formData.receivingOption || '');

  const receivingOptions = [
    {
      id: 'bank_account',
      title: 'Bank Account',
      description: 'Direct deposit to bank account',
      icon: Building2,
      fee: 'Low fees',
      time: '1-3 business days',
      details: 'Most secure and widely accepted method'
    },
    {
      id: 'mobile_wallet',
      title: 'Mobile Wallet',
      description: 'Send to mobile wallet',
      icon: Wallet,
      fee: 'Instant',
      time: 'Real-time',
      details: 'Quick and convenient for mobile users'
    },
    {
      id: 'cash_pickup',
      title: 'Cash Pickup',
      description: 'Collect cash at pickup location',
      icon: MapPin,
      fee: 'Medium fees',
      time: 'Within hours',
      details: 'Available at thousands of locations'
    },
    {
      id: 'debit_card',
      title: 'Debit Card',
      description: 'Direct to recipient\'s card',
      icon: CreditCard,
      fee: 'Instant',
      time: 'Real-time',
      details: 'Fast delivery to Visa/Mastercard'
    },
  ];

  const handleOptionSelect = (optionId: string) => {
    setSelectedOption(optionId);
  };

  const handleContinue = () => {
    if (selectedOption) {
      updateFormData({ receivingOption: selectedOption });
      onNext();
    }
  };

  return (
    <Box className="receiving-options-step">
      <Typography variant="h6" className="step-title">
        How will your recipient receive the money?
      </Typography>
      <Typography variant="body2" className="step-description">
        Choose how your recipient will receive the funds
      </Typography>

      <Grid container spacing={3} className="receiving-options" sx={{ mt: 2 }}>
        {receivingOptions.map((option) => {
          const IconComponent = option.icon;
          return (
            <Grid item xs={12} sm={6} key={option.id}>
              <Card
                className={`receiving-option-card ${
                  selectedOption === option.id ? 'selected' : ''
                }`}
                onClick={() => handleOptionSelect(option.id)}
                sx={{
                  cursor: 'pointer',
                  border: selectedOption === option.id ? '2px solid #483594' : '2px solid #e0e0e0',
                  minHeight: 200,
                  '&:hover': {
                    borderColor: '#483594',
                    boxShadow: '0 4px 16px rgba(72, 53, 148, 0.15)',
                  }
                }}
              >
                <CardContent className="option-content" sx={{ p: 3, height: '100%' }}>
                  <Box className="option-icon" sx={{ mb: 2 }}>
                    <IconComponent size={32} color="#483594" />
                  </Box>
                  <Typography variant="h6" className="option-title" sx={{ mb: 1, fontWeight: 600 }}>
                    {option.title}
                  </Typography>
                  <Typography variant="body2" className="option-description" sx={{ mb: 2, color: 'text.secondary' }}>
                    {option.description}
                  </Typography>
                  
                  <Box className="option-details" sx={{ mt: 'auto' }}>
                    <Typography className="option-fee" sx={{ fontWeight: 600, color: '#483594', fontSize: '0.875rem' }}>
                      {option.fee}
                    </Typography>
                    <Typography className="option-time" sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
                      {option.time}
                    </Typography>
                    <Typography className="option-info" sx={{ fontSize: '0.75rem', color: 'text.secondary', mt: 1 }}>
                      {option.details}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <Box className="step-actions" sx={{ mt: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <CustomButton
              onClick={onPrevious}
              variant="outlined"
              fullWidth
              className="back-button"
            >
              Back
            </CustomButton>
          </Grid>
          <Grid item xs={6}>
            <CustomButton
              onClick={handleContinue}
              disabled={!selectedOption}
              fullWidth
              className="continue-button"
            >
              Continue
            </CustomButton>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default ReceivingOptionsStep;

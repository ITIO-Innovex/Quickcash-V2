import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Button,
  Box,
  MenuItem,
  Select,
  SelectChangeEvent,
  FormControl,
  InputLabel,
  useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CustomButton from '@/components/CustomButton';

interface AddAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (currency: string) => void;
}

const currencies = [
  { code: 'USD', name: 'USD', flag: '🇺🇸' },
  { code: 'INR', name: 'INR', flag: '🇮🇳' },
  { code: 'EUR', name: 'EUR', flag: '🇪🇺' },
  { code: 'GBP', name: 'GBP', flag: '🇬🇧' },
  { code: 'AWG', name: 'AWG', flag: '🇦🇼' },
  { code: 'AUD', name: 'AUD', flag: '🇦🇺' },
];

const AddAccountModal: React.FC<AddAccountModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const theme = useTheme();
  const [selectedCurrency, setSelectedCurrency] = useState<string>('');

  const handleChange = (event: SelectChangeEvent) => {
    setSelectedCurrency(event.target.value);
  };

  const handleSubmit = () => {
    if (selectedCurrency) {
      onSubmit(selectedCurrency);
      setSelectedCurrency('');
      onClose();
    }
  };

  const handleCancel = () => {
    setSelectedCurrency('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogContent className="add-account-modal-content" sx={{backgroundColor:theme.palette.background.default}}>
        <Box className="modal-header">
          <DialogTitle>Add Account</DialogTitle>
          <IconButton onClick={onClose} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <Box className="modal-body">
          <Typography className="label" component="label" sx={{color:theme.palette.text.gray}}>
            Currency
          </Typography>
          <FormControl fullWidth size="small">
            <InputLabel sx={{color:theme.palette.text.gray}}>Select currency</InputLabel>
            <Select
              value={selectedCurrency}
              onChange={handleChange}
              label="Select currency"
            >
              {currencies.map((currency) => (
                <MenuItem key={currency.code} value={currency.code}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <span>{currency.flag}</span>
                    <span>{currency.name}</span>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box className="modal-actions">
          <CustomButton
            onClick={handleSubmit}
            disabled={!selectedCurrency}
          >
            Submit
          </CustomButton>
          <CustomButton  onClick={handleCancel}>
            Cancel
          </CustomButton>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default AddAccountModal;

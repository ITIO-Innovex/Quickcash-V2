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
import ReactCountryFlag from 'react-country-flag';
import { useCurrency } from '@/hooks/useCurrency';

interface AddAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (currency: string) => void;
}

const AddAccountModal: React.FC<AddAccountModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const theme = useTheme();
  const [selectedCurrency, setSelectedCurrency] = useState<string>('');
  const { currencyList } = useCurrency();

  const handleChange = (event: SelectChangeEvent) => {
    setSelectedCurrency(event.target.value);
  };

  const handleSubmit = () => {
    if (selectedCurrency) {
      onSubmit(selectedCurrency);
      setSelectedCurrency('');
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
              {currencyList?.map((item: any, index: number) => (
                <MenuItem value={item?.base_code} key={index}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <ReactCountryFlag
                      countryCode={item?.base_code?.slice(0, 2).toUpperCase()}
                      svg
                      style={{
                        width: '2em',
                        height: '2em',
                        borderRadius: '50%',
                      }}
                      cdnUrl="https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.4.3/flags/1x1/"
                      cdnSuffix="svg"
                      title={item?.base_code?.slice(0, 2).toUpperCase()}
                    />
                    <span>{item?.base_code}</span>
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

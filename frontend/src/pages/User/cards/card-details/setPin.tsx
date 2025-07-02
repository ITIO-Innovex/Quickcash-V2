import React, { useState } from 'react';
import { Box, Typography, TextField, Button } from '@mui/material';

interface SetPinFormProps {
  cardNumber: string;
  cardHolder: string;
  expiryDate: string;
  onSubmit: (pin: string) => void;
}

const SetPinForm: React.FC<SetPinFormProps> = ({ cardNumber, cardHolder, expiryDate, onSubmit }) => {
  const [pin, setPin] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length === 3) {
      onSubmit(pin);
    } else {
      alert('PIN must be exactly 4 digits');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography>Card Number: {cardNumber}</Typography>
      <Typography>Card Holder: {cardHolder}</Typography>
      <Typography>Expiry Date: {expiryDate}</Typography>

      <TextField
        className="custom-textfield"
        label="Set 4-digit PIN"
        variant="outlined"
        value={pin}
        onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
          setPin(
            Math.max(0, parseInt(e.target.value)).toString().slice(0, 3)
          );
        }}
    
        required
      />

      <Button type="submit" className='custom-button' disabled={pin.length !== 3}>
        Save PIN
      </Button>
    </Box>
  );
};

export default SetPinForm;

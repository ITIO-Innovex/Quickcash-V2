import React, { useState } from 'react';
import {
  Box,
  Button,
  MenuItem,
  TextField,
  Typography,
  Stack,
} from '@mui/material';
import CustomTextField from '@/components/CustomTextField';

interface GetCardFormProps {
  onClose: () => void;
  currencyOptions: string[];
}

interface Errors {
  name?: string;
  currency?: string;
}

const formatCardNumber = (num: string): string => {
  return num
    .padStart(16, '0')
    .replace(/(.{4})/g, '$1 ')
    .trim();
};

const getCurrencyStyles = (currency: string, isFrozen: boolean) => {
  const baseStyles = {
    USD: {
      background: 'linear-gradient(135deg, rgb(26 35 126 / 89%) 0%, rgb(45 100 185) 100%)',
      color: '#ffffff',
      border: '1px solid transparent',
    },
    EUR: {
      background: 'linear-gradient(135deg, rgb(0 77 64 / 81%) 0%, rgb(0 81 121 / 87%) 100%)',
      color: '#ffffff',
      border: '1px solid transparent',
    },
    GBP: {
      background: 'linear-gradient(135deg, rgb(120 24 75) 0%, rgb(194 24 91 / 67%) 100%)',
      color: '#ffffff',
      border: '1px solid transparent',
    },
    JPY: {
      background: 'linear-gradient(135deg, #bf360c 0%, #e64a19 100%)',
      color: '#ffffff',
      border: '1px solid #e64a19',
    },
    AUD: {
      background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)',
      color: '#ffffff',
      border: '1px solid #2e7d32',
    },
    CAD: {
      background: 'linear-gradient(135deg, #4a148c 0%, #7b1fa2 100%)',
      color: '#ffffff',
      border: '1px solid #7b1fa2',
    },
    CHF: {
      background: 'linear-gradient(135deg, #e65100 0%, #f57c00 100%)',
      color: '#ffffff',
      border: '1px solid #f57c00',
    },
    CNY: {
      background: 'linear-gradient(135deg, #b71c1c 0%, #d32f2f 100%)',
      color: '#ffffff',
      border: '1px solid #d32f2f',
    },
    INR: {
      background: 'linear-gradient(135deg, rgb(255 111 0 / 81%) 0%, rgb(72 151 3) 100%)',
      color: '#ffffff',
      border: '1px solid transparent',
    },
    SGD: {
      background: 'linear-gradient(135deg, #006064 0%, #00838f 100%)',
      color: '#ffffff',
      border: '1px solid #00838f',
    },
    NZD: {
      background: 'linear-gradient(135deg, #4a148c 0%, #6a1b9a 100%)',
      color: '#ffffff',
      border: '1px solid #6a1b9a',
    },
    PAK: {
      background: 'linear-gradient(135deg, rgb(113 137 149 / 87%) 0%, rgb(12 89 11 / 97%) 100%)',
      color: '#ffffff',
      border: '1px solid transparent',
    },
    default: {
      background: 'linear-gradient(135deg, #263238de 0%, #455a64 100%)',
      color: '#ffffff',
      border: '1px solid #455a64',
    },
  };

  const style = baseStyles[currency as keyof typeof baseStyles] || baseStyles.default;

  if (isFrozen) {
    return {
      ...style,
      background: 'linear-gradient(135deg, #9e9e9e 0%, #757575 100%)',
      border: '1px solid #757575',
      opacity: 0.7,
      filter: 'grayscale(100%)',
    };
  }

  return style;
};

const CardDisplay: React.FC<{
  number: string;
  expiry: string;
  cvc: string;
  name: string;
  currency: string;
  isFrozen?: boolean;
}> = ({ number, expiry, cvc, name, currency, isFrozen = false }) => {
  const cardStyles = getCurrencyStyles(currency, isFrozen);

  return (
    <Box
      sx={{
        borderRadius: 2,
        ...cardStyles,
        p: 3,
        mb: 3,
        fontFamily: 'monospace',
        userSelect: 'none',
      }}
    >
      <Typography variant="subtitle1" sx={{ mb: 1, letterSpacing: '0.1em' }}>
        {number ? formatCardNumber(number) : '0000 0000 0000 0000'}
      </Typography>
      <Stack direction="row" justifyContent="space-between" sx={{ fontSize: '0.9rem' }}>
        <Typography>{name || 'YOUR NAME HERE'}</Typography>
        <Typography>{expiry || 'MM/YY'}</Typography>
        <Typography>{cvc || '•••'}</Typography>
      </Stack>
    </Box>
  );
};

const GetCardForm: React.FC<GetCardFormProps> = ({ onClose, currencyOptions }) => {
  const [state, setState] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: '',
    currency: '',
  });

  const [errors, setErrors] = useState<Errors>({});
  const [generateMode, setGenerateMode] = useState(true);

  const validate = (name: string, value: string): string => {
    switch (name) {
      case 'name':
        if (!value.trim()) return 'Name is required.';
        return '';
      case 'currency':
        if (!value) return 'Currency is required.';
        return '';
      default:
        return '';
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'name' || name === 'currency') {
      setState((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'name' || name === 'currency') {
      const error = validate(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const generateCardDetails = () => {
    const nameError = validate('name', state.name);
    const currencyError = validate('currency', state.currency);

    if (nameError || currencyError) {
      setErrors({ name: nameError, currency: currencyError });
      return;
    }

    const randomNumber = Math.floor(Math.random() * 1e16)
      .toString()
      .padStart(16, '0');
    const expiry = '12/30';
    const cvc = '123';

    setState((prev) => ({
      ...prev,
      number: randomNumber,
      expiry,
      cvc,
    }));

    setErrors({});
    setGenerateMode(false);
  };

  const handleSubmit = () => {
    const nameError = validate('name', state.name);
    const currencyError = validate('currency', state.currency);

    setErrors({ name: nameError, currency: currencyError });

    if (nameError || currencyError) return;

    console.log('Submitting card details:', state);

    // Reset form
    setState({
      number: '',
      expiry: '',
      cvc: '',
      name: '',
      currency: '',
    });
    setGenerateMode(true);
    onClose();
  };

  return (
    <Box sx={{ p: 2 }}>
      <CardDisplay
        number={state.number}
        expiry={state.expiry}
        cvc={state.cvc}
        name={state.name}
        currency={state.currency}
      />

      <CustomTextField
        fullWidth
        label="Name"
        name="name"
        value={state.name}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        error={!!errors.name}
        helperText={errors.name}
        margin="normal"
      />

      <CustomTextField
        select
        fullWidth
        label="Currency"
        name="currency"
        value={state.currency}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        error={!!errors.currency}
        helperText={errors.currency}
        margin="normal"
      >
        {currencyOptions.map((currency) => (
          <MenuItem key={currency} value={currency}>
            {currency}
          </MenuItem>
        ))}
      </CustomTextField>

      {generateMode ? (
        <Button
          fullWidth
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
          onClick={generateCardDetails}
          disabled={!state.name || !state.currency}
        >
          GENERATE
        </Button>
      ) : (
        <Button
          className="custom-button"
          fullWidth
          variant="contained"
          sx={{ mt: 2 }}
          onClick={handleSubmit}
        >
          SUBMIT
        </Button>
      )}
    </Box>
  );
};

export default GetCardForm;

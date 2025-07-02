import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  MenuItem,
  Typography,
  IconButton,
  useMediaQuery
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useTheme } from '@mui/material/styles';
import { useState } from 'react';

interface AddMoneyModalProps {
  open: boolean;
  onClose: () => void;
}

const AddMoneyModal = ({ open, onClose }: AddMoneyModalProps) => {
  const [currency, setCurrency] = useState('USD');
  const [transferType, setTransferType] = useState('stripe');
  const [amount, setAmount] = useState('');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const depositFee = 23;
  const finalAmount = amount ? parseFloat(amount) + depositFee : 0;
  const conversionAmount = finalAmount * 77.8; 

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        Add Money
        <IconButton edge="end" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
        <Box>
          <Typography variant="caption" fontWeight="bold" color="text.secondary" mb={0.5}>
            CURRENCY TYPE
          </Typography>
          <TextField
            select
            fullWidth
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            size="small"
          >
            <MenuItem value="USD">$ USD</MenuItem>
            <MenuItem value="EUR">€ EUR</MenuItem>
            <MenuItem value="INR">₹ INR</MenuItem>
          </TextField>
        </Box>

        <Box>
          <Typography variant="caption" fontWeight="bold" color="text.secondary" mb={0.5}>
            TRANSFER TYPE
          </Typography>
          <TextField
            select
            fullWidth
            value={transferType}
            onChange={(e) => setTransferType(e.target.value)}
            size="small"
          >
            <MenuItem value="stripe">
              <Typography variant="body2" fontWeight="bold" color="#6772e5">stripe</Typography> &nbsp;
              <Typography variant="caption" color="text.secondary">Supports USD, EUR and more</Typography>
            </MenuItem>
            <MenuItem value="paypal">PayPal</MenuItem>
          </TextField>
        </Box>

        <Box>
          <Typography variant="caption" fontWeight="bold" color="text.secondary" mb={0.5}>
            AMOUNT
          </Typography>
          <TextField
            fullWidth
            type="number"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            size="small"
          />
        </Box>

        <Box display="flex" flexDirection="column" mt={1}>
          <Typography variant="body2" color="text.secondary">
            Deposit Fee: <strong>${depositFee.toFixed(2)}</strong> &nbsp;
            Amount: <strong>${finalAmount.toFixed(2)}</strong> &nbsp;
            Conversion Amount: <strong>₹{conversionAmount.toFixed(2)}</strong>
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button
          fullWidth
          variant="contained"
          sx={{
            backgroundColor: '#004d00',
            color: '#fff',
            textTransform: 'none',
            fontWeight: 'bold',
            borderRadius: 5,
            py: 1.25,
            '&:hover': {
              backgroundColor: '#003300',
            },
          }}
          onClick={onClose}
        >
          Add Money
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddMoneyModal;

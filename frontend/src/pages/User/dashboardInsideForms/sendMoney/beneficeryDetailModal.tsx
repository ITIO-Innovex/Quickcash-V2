// BeneficiaryModal.tsx
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Grid,
  IconButton,
  Button,
  FormControl,
  Select,
  MenuItem,
  TextField,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface Recipient {
  id: string;
  name: string;
  accountNumber: string;
  iban?: string;
  bicCode?: string;
}

interface BankAccount {
  id: string;
  label: string;
  balance: number;
  currency: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  beneficiary: Recipient | null;
  amount: string;
  fee: number;
  total: number;
  youGet: number;
  selectedAccount: string;
  bankAccounts: BankAccount[];
  onAmountChange: (value: string) => void;
  onAccountChange: (value: string) => void;
}

const BeneficiaryModal: React.FC<Props> = ({
  open,
  onClose,
  onSubmit,
  beneficiary,
  amount,
  fee,
  total,
  youGet,
  selectedAccount,
  bankAccounts,
  onAmountChange,
  onAccountChange,
}) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between' }}>
        Beneficiary Account Details
        <IconButton onClick={onClose}><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid item xs={6}><Typography variant="h6">IBAN:</Typography></Grid>
          <Grid item xs={6}><Typography>{beneficiary?.iban}</Typography></Grid>

          <Grid item xs={6}><Typography variant="h6">BIC Code:</Typography></Grid>
          <Grid item xs={6}><Typography>{beneficiary?.bicCode}</Typography></Grid>

          <Grid item xs={6}><Typography variant="h6">Select Account:</Typography></Grid>
          <Grid item xs={6}>
            <FormControl fullWidth size="small" className="custom-select">
              <Select  className="custom-textfield"
                value={selectedAccount}
                onChange={(e) => onAccountChange(e.target.value)}
              >
                {bankAccounts.map((acc) => (
                  <MenuItem key={acc.id} value={acc.id}>
                    {`${acc.label} - $${acc.balance.toFixed(2)}`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={6}><Typography variant="h6">Enter Amount:</Typography></Grid>
          <Grid item xs={6}>
            <TextField
             className="custom-textfield"
              size="small"
              fullWidth
              type="number"
              value={amount}
              onChange={(e) => onAmountChange(e.target.value)}
            />
          </Grid>

          <Grid item xs={6}><Typography variant="h6">Fee:</Typography></Grid>
          <Grid item xs={6}><Typography>${fee}</Typography></Grid>

          <Grid item xs={6}><Typography variant="h6">Total Deduction:</Typography></Grid>
          <Grid item xs={6}><Typography>${total}</Typography></Grid>

          <Grid item xs={6}><Typography variant="h6">You Will Get:</Typography></Grid>
          <Grid item xs={6}><Typography>{youGet}</Typography></Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button className='outline-button'onClick={onClose}>Cancel</Button>
        <Button className='custom-button' onClick={onSubmit}>Submit</Button>
      </DialogActions>
    </Dialog>
  );
};

export default BeneficiaryModal;

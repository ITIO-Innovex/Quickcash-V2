import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Button,
  Checkbox,
  FormControlLabel,
  Box,
  Divider,
  useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

interface Account {
  id: string;
  currency: string;
  balance: string;
  flag: string;
  isDefault?: boolean;
  accountNumber?: string;
  ifscCode?: string;
  accountHolding?: string;
}

interface AccountDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: Account | null;
}

const AccountDetailsModal: React.FC<AccountDetailsModalProps> = ({
  isOpen,
  onClose,
  account,
}) => {
  const theme = useTheme();
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    // Replace with your own toast/notification logic
    alert(`${label} copied to clipboard`);
  };

  if (!account) return null;

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogContent className="account-modal-content" sx={{backgroundColor:theme.palette.background.default}}>
        <Box className="modal-header">
          <DialogTitle>Account Details</DialogTitle>
          <IconButton onClick={onClose} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <Box className="account-details-container">
          <Box className="account-header">
            <Box className="account-flag-name">
              <Box
                className='img-round'
                component="img"
                src={account.flag}
                alt={`${account.currency} flag`}
                sx={{ width: 24, height: 16, objectFit: 'cover' }}
              />
              <Typography variant="body1" className="currency-name">
                {account.currency} account
              </Typography>
            </Box>

            <FormControlLabel
              control={<Checkbox />}
              label="Statements"
              className="statements-checkbox"
            />
          </Box>

          <Typography variant="h5" className="account-balance">
            {account.balance}
          </Typography>

          <Divider />

          <Box className="detail-group">
            <label style={{color:theme.palette.text.gray}}>Account Number</label>
            <Box className="detail-row">
              <span className="detail-value">
                {account.accountNumber || 'US1000000014'}
              </span>
              <Button
                className='copy-text'
                onClick={() =>
                  copyToClipboard(
                    account.accountNumber || 'US1000000014',
                    'Account number'
                  )
                }
                startIcon={<ContentCopyIcon />}
              >
                Copy
              </Button>
            </Box>
          </Box>

          <Box className="detail-group">
            <label style={{color:theme.palette.text.gray}}>IFSC Code</label>
            <Box className="detail-row">
              <span className="detail-value">{account.ifscCode || '200014'}</span>
              <Button
               className='copy-text'
                onClick={() =>
                  copyToClipboard(account.ifscCode || '200014', 'IFSC code')
                }
                startIcon={<ContentCopyIcon />}
              >
                Copy
              </Button>
            </Box>
          </Box>

          <Box className="detail-group">
            <label style={{color:theme.palette.text.gray}}>Currency</label>
            <Box className="detail-static">{account.currency}</Box>
          </Box>

          <Box className="detail-group">
            <label style={{color:theme.palette.text.gray}}>Account Holding</label>
            <Box className="detail-static">
              {account.accountHolding || 'Currency Exchange'}
            </Box>
          </Box>

        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default AccountDetailsModal;

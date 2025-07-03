import React, { useState } from 'react';
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
import ReactCountryFlag from 'react-country-flag';
import { useNavigate } from 'react-router-dom';

interface Account {
  id: string;
  currency: string;
  balance: string;
  isDefault?: boolean;
  accountNumber?: string;
  ifscCode?: string;
  accountHolding?: string;
  country?: string;

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
  const [copied, setCopied] = useState(false);
  const [copiedIfsc, setCopiedIfsc] = useState(false);
  const navigate = useNavigate();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
  };

  if (!account) return null;

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogContent className="account-modal-content" sx={{ backgroundColor: theme.palette.background.default }}>
        <Box className="modal-header">
          <DialogTitle>Account Details</DialogTitle>
          <IconButton onClick={onClose} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <Box className="account-details-container">
          <Box className="account-header">
            <Box className="account-flag-name">
              <ReactCountryFlag
                countryCode={account.country}
                svg
                className="circular-flag"
                title={account.country}
              />
              <Typography variant="body1" className="currency-name">
                {account.currency} account
              </Typography>
            </Box>

            <Button
              variant="outlined"
              onClick={() => navigate('/statements')}
              sx={{ ml: 2 }}
            >
              Statements
            </Button>
          </Box>

          <Typography variant="h5" className="account-balance">
            {account.balance}
          </Typography>

          <Divider />

          <Box className="detail-group">
            <label style={{ color: theme.palette.text.gray }}>Account Number</label>
            <Box className="detail-row">
              <span className="detail-value">
                {account.accountNumber || 'US1000000014'}
              </span>
              <Button
                className="copy-text"
                onClick={() => copyToClipboard(account.accountNumber || 'US1000000014')}
                startIcon={<ContentCopyIcon />}
              >
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            </Box>
          </Box>

          <Box className="detail-group">
            <label style={{ color: theme.palette.text.gray }}>IFSC Code</label>
            <Box className="detail-row">
              <span className="detail-value">{account.ifscCode || '200014'}</span>
              <Button
                className='copy-text'
                onClick={() => {
                  copyToClipboard(account.ifscCode || '200014');
                  setCopiedIfsc(true);
                  setTimeout(() => setCopiedIfsc(false), 2000);
                }}
                startIcon={<ContentCopyIcon />}
              >
                {copiedIfsc ? 'Copied!' : 'Copy'}
              </Button>
            </Box>
          </Box>

          <Box className="detail-group">
            <label style={{ color: theme.palette.text.gray }}>Currency</label>
            <Box className="detail-static">{account.currency}</Box>
          </Box>

          <Box className="detail-group">
            <label style={{ color: theme.palette.text.gray }}>Account Holding</label>
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

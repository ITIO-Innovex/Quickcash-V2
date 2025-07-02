// components/AccountSelectModal.tsx

import React, { useState } from "react";
import {
  Modal,
  Box,
  Typography,
  IconButton,
  TextField,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  InputAdornment,
  useTheme,
} from "@mui/material";
import { Close, Search } from "@mui/icons-material";

interface Account {
  flag: string;
  label: string;
  balance: string;
  code: string;
  currency: string;
}

interface AccountSelectModalProps {
  open: boolean;
  onClose: () => void;
  accounts: Account[];
  onSelect: (account: Account) => void;
}

const AccountSelectModal: React.FC<AccountSelectModalProps> = ({
  open,
  onClose,
  accounts,
  onSelect,
}) => {
  const theme = useTheme();
  const [search, setSearch] = useState("");

  const filteredAccounts = accounts.filter((acc) =>
    acc.label.toLowerCase().includes(search.toLowerCase()) ||
    acc.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Modal open={open} onClose={onClose}>
      <Box className='account-box'sx={{backgroundColor:theme.palette.background.default}} >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" fontWeight="bold">Change Account</Typography>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>

        <Typography variant="body2" mb={2}>
          Select your preferred account for currency exchange.
        </Typography>

        <TextField
          placeholder="Search by name or code"
          fullWidth
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />

        <List>
          {filteredAccounts.map((acc, index) => (
            <ListItem className="acoount-list-item"
              key={index}
              onClick={() => onSelect(acc)}
           
            >
              <ListItemAvatar>
                <Avatar src={acc.flag} alt={acc.label} />
              </ListItemAvatar>
              <ListItemText
                primary={acc.label}
                secondary={`${acc.balance} - ${acc.code}`}
                primaryTypographyProps={{ fontWeight: "bold" }}
                secondaryTypographyProps={{color:'text.gray'}}
              />
            </ListItem>
          ))}
          {filteredAccounts.length === 0 && (
            <Typography variant="body2" color="text.primary" align="center" mt={2}>
              No accounts match your search.
            </Typography>
          )}
        </List>
      </Box>
    </Modal>
  );
};

export default AccountSelectModal;

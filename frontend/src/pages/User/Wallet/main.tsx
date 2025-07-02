import { useState } from 'react';
import WalletContent from './WalletContent';
import { Box, useTheme } from '@mui/material';
import CreateWalletForm from './CreateWalletForm';
import PageHeader from '@/components/common/pageHeader';
import CustomModal from '../../../components/CustomModal';

const Main = () => {
  const theme = useTheme();
  const handleOpen = () => setOpen(true);
  const [open, setOpen] = useState(false);
  const handleClose = () => setOpen(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleWalletAdded = () => {
  setRefreshKey((prev) => prev + 1);
  handleClose(); // modal close
};
  return (
   <Box className="dashboard-container" sx={{ backgroundColor: theme.palette.background.default }} >
      <PageHeader title="Wallets" buttonText="New Coin" onButtonClick={handleOpen}/>
      <WalletContent key={refreshKey} />

      <CustomModal open={open} onClose={handleClose} title="Add New Coin" sx={{ backgroundColor: theme.palette.background.default }}>
        <CreateWalletForm onClose={handleClose} onWalletAdded={handleWalletAdded} />

      </CustomModal>
    </Box>
  );
};

export default Main;

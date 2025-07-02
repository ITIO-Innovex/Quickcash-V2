import { Box, Grid, Typography, Badge } from '@mui/material';
import ReceiptIcon from '@mui/icons-material/Receipt';
import DescriptionIcon from '@mui/icons-material/Description';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CurrencyBitcoinIcon from '@mui/icons-material/CurrencyBitcoin';
interface SecondLeftSection {
  summary: any;
  loaderResult: boolean;
}


const SecondLeftSection = ({ summary, loaderResult }: SecondLeftSection) => {
  const cardData = [
  { icon: <ReceiptIcon fontSize="large" />, label: 'Invoice', count: summary?.totalInvoice ?? 0 },
  { icon: <DescriptionIcon fontSize="large" />, label: 'Ticket', count: summary?.totalTicket ?? 0 },
  { icon: <AccountBalanceWalletIcon fontSize="large" />, label: 'Wallet', count: summary?.totalAccount ?? 0 },
  { icon: <CurrencyBitcoinIcon fontSize="large" />, label: 'Crypto Wallet', count: summary?.wallet ?? 0 },
];
  return (
    <Box className="dashboard-box left-section">
      <Grid container spacing={2}>
        {cardData.map((card, index) => (
          <Grid item xs={12} sm={6} key={index}>
            <Box className="metric-card small-card">
              <Box className="metric-icon">
                <Badge
                  badgeContent={card.count > 99 ? '99+' : card.count}
                  color="success"
                  overlap="circular"
                >
                  {card.icon}
                </Badge>
              </Box>
              <Box className="card-label">{card.label}</Box>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default SecondLeftSection;

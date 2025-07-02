import { Box, Typography } from '@mui/material';
import PixIcon from '@mui/icons-material/Pix';
import { useTheme } from '@mui/material/styles';
import MoveUpIcon from '@mui/icons-material/MoveUp';
import ReceiptIcon from '@mui/icons-material/Receipt';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import AssuredWorkloadIcon from '@mui/icons-material/AssuredWorkload';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';

const features = [
  {
    icon: <DashboardIcon className="feature-icon" />,
    label: 'Effortless Onboarding',
    description:
      'With features like face recognition, fingerprints, and OTP, users can swiftly and securely create an account.',
  },
  {
    icon: <AssuredWorkloadIcon className="feature-icon" />,
    label: 'Send & Receive Money',
    description:
      'Our Whitelabel NEO banking platform enables users to easily send, receive, and request money from others.',
  },
  {
    icon: <PixIcon className="feature-icon" />,
    label: 'Multi-Currency Account',
    description:
      'Our Whitelabel NEO banking platform offers to create international bank accounts (IBAN) with comprehensive multi-currency support worldwide.',
  },
  {
    icon: <CreditCardIcon className="feature-icon" />,
    label: 'Virtual And Plastic Card',
    description:
      'Our System easily generate the Virtual and plastic card like traditional Banking .',
  },
  {
    icon: <MoveUpIcon className="feature-icon" />,
    label: 'Simple Money Transfers',
    description:
      'NEO bank customers can easily transfer funds to both domestic and international bank accounts using this feature.',
  },
  {
    icon: <CurrencyExchangeIcon className="feature-icon" />,
    label: 'Currency Exchange',
    description:
      'Our Whitelabel NEO banking platform includes a built-in currency exchange feature for seamless trading between fiat and cryptocurrencies.',
  },
  {
    icon: <ReceiptIcon className="feature-icon" />,
    label: 'Invoice System',
    description:
      'Our System levearege with complete Invoice system , so that generate and send invoice to 3rd party.',
  },
];

const FifthSection = () => {
  const theme = useTheme();
  return (
    <Box className="fifth-section">
      <Box className="fifth-top-container">
        <Typography
          variant="h1"
          sx={{
            color: theme.palette.navbar?.text || '#fff',
          }}
        >
          Features
        </Typography>
      </Box>

      <Box className="fifth-bottom-container">
        {features.map((feature, index) => (
          <Box
            className="feature-box"
            sx={{
              color: theme.palette.navbar?.text || '#fff',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'transparent',
            }}
            key={index}
          >
            {feature.icon}
            <Typography
              variant="subtitle1"
              sx={{
                color: theme.palette.navbar?.text || '#fff',
              }}
              className="feature-label"
            >
              {feature.label}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: theme.palette.navbar?.text || '#fff',
              }}
              className="feature-description"
            >
              {feature.description}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default FifthSection;

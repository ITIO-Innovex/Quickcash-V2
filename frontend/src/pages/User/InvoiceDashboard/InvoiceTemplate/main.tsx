import { Box, Container, useTheme } from '@mui/material';
import InvoiceTemplateForm from './InvoiceTemplateForm';
import InvoicePreview from './InvoicePreview';
import PageHeader from '@/components/common/pageHeader';

const InvoiceTemplate = () => {
  const theme = useTheme();
  return (
    <Box 
      className="dashboard-container" 
      sx={{ backgroundColor: theme.palette.background.default }}
    >
          <PageHeader title="Invoice-template"/>
        <Box className="invoice-template-content">
          <InvoiceTemplateForm />
          <InvoicePreview />
        </Box>
      </Box>
  );
};

export default InvoiceTemplate;

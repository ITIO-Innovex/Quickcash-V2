import { Box } from "@mui/material";

const InvoicePreviewFooter = () => {
  return (
    <Box className="invoice-footer">
      <Box className="footer-section">
        <h4 className="footer-title">Notes:</h4>
        <Box className="footer-content">
          <p>Paypal, Stripe & manual payment method accept.</p>
          <p>Net 10 – Payment due in 10 days from invoice date.</p>
          <p>Net 30 – Payment due in 30 days from invoice date.</p>
        </Box>
      </Box>
      
      <Box className="footer-section">
        <h4 className="footer-title">Terms:</h4>
        <Box className="footer-content">
          <p>Invoice payment terms ; 1% 10 Net 30, 1% discount if payment received within ten days otherwise payment 30 days after invoice date.</p>
        </Box>
      </Box>
    </Box>
  );
};

export default InvoicePreviewFooter;

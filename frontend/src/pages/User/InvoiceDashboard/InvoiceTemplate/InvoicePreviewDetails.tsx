import { Box } from '@mui/material';

const InvoicePreviewDetails = () => {
  return (
    <Box className="invoice-details">
      <Box className="invoice-details-left">
        <Box className="detail-section">
          <h4 className="detail-title">From</h4>
          <Box className="detail-content">
            <p>TTO Invoice</p>
            <p>Rajkot</p>
            <p>MO: 7405848976</p>
          </Box>
        </Box>
        
        <Box className="detail-section">
          <h4 className="detail-title">To</h4>
          <Box className="detail-content">
            <p>(Client Name)</p>
            <p>(Client Email)</p>
            <p>(Client Address)</p>
          </Box>
        </Box>
      </Box>
      
      <Box className="invoice-details-right">
        <Box className="date-section">
          <p><strong>Invoice Date:</strong> 25th Nov, 2020 8:03 AM</p>
          <p><strong>Due Date:</strong> 26th Nov, 2020</p>
        </Box>
      </Box>
    </Box>
  );
};

export default InvoicePreviewDetails;

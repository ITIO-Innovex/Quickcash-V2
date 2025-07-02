import { Box } from '@mui/material';
import React, { useState } from 'react';

const InvoiceIncomeChart = () => {
  const [period, setPeriod] = useState('Today');

  return (
    <Box className="chart-section">
      <Box className="chart-header">
        <h3 className="chart-title">Invoice Income Overview</h3>
        <select 
          className="chart-period-select"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
        >
          <option value="Today">Today</option>
          <option value="This Week">This Week</option>
          <option value="This Month">This Month</option>
          <option value="This Year">This Year</option>
        </select>
      </Box>
      
      <Box className="chart-legend">
        <Box className="legend-indicator"></Box>
        <span className="legend-text">Invoice Income</span>
      </Box>

      <Box className="chart-container">
        <Box className="chart-placeholder">
          Chart will be displayed here
        </Box>
      </Box>
    </Box>
  );
};

export default InvoiceIncomeChart;

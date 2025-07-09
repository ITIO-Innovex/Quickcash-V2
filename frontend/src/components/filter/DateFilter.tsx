import React from 'react';
import { Box, TextField } from '@mui/material';

interface DateFilterProps {
  onFilterChange: (params: { startDate: string, endDate: string }) => void;
  startDate: string;
  endDate: string;
}

const DateFilter: React.FC<DateFilterProps> = ({
  onFilterChange,
  startDate,
  endDate,
}) => {
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ startDate: e.target.value, endDate });
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ startDate, endDate: e.target.value });
  };

  return (
    <Box display="flex" alignItems="center" gap={2} style={{ marginTop: '10px' }}>
      <TextField
        type="date"
        size="small"
        value={startDate}
        onChange={handleStartDateChange}
        label="Start Date"
        InputLabelProps={{ shrink: true }}
      />
      <TextField
        type="date"
        size="small"
        value={endDate}
        onChange={handleEndDateChange}
        label="End Date"
        InputLabelProps={{ shrink: true }}
      />
    </Box>
  );
};

export default DateFilter; 
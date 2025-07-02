import React from 'react';
import { Box } from '@mui/material';
import CustomTextField from './CustomTextField';

type CommonFilterProps = {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  width?: string;
};

const CommonFilter: React.FC<CommonFilterProps> = ({
  label = 'Search',
  value,
  onChange,
  width = '200px',
}) => {
  return (
    <Box sx={{ width, mb: 2 }}>
      <CustomTextField
        label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </Box>
  );
};

export default CommonFilter;

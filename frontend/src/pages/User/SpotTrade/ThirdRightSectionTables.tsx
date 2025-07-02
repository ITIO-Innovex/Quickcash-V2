import { useState } from 'react';
import { Box, Tabs, Tab, useTheme, useMediaQuery } from '@mui/material';
import GenericTable from '../../../components/common/genericTable';

const orderTabs = ['Open Orders', 'Order History', 'Trade History'];

const columns = [
  { field: 'date', headerName: 'DATE' },
  { field: 'pair', headerName: 'PAIR' },
  { field: 'type', headerName: 'TYPE' },
  { field: 'side', headerName: 'SIDE' },
  { field: 'amount', headerName: 'AMOUNT' },
  { field: 'status', headerName: 'STATUS' },
];

const RightSection = () => {
  const theme = useTheme();
  const [tabIndex, setTabIndex] = useState(0);
  const isMobile = useMediaQuery('(max-width:600px)');

  const handleChange = (_: any, newValue: number) => {
    setTabIndex(newValue);
  };

  // Dummy empty data for now
  const data: any[] = [];

  return (
    <Box className="right-section-container" sx={{backgroundColor:theme.palette.background.default}}>
     <Tabs value={tabIndex} onChange={handleChange} orientation={isMobile ? 'vertical' : 'horizontal'} variant={isMobile ? 'standard' : 'scrollable'} className="tab-header">
        {orderTabs.map((label, index) => (
          <Tab key={index} label={label} sx={{ color: theme.palette.text.primary }} />
        ))}
    </Tabs>

      <Box className="order-table">
        <GenericTable columns={columns} data={data} />
      </Box>
    </Box>
  );
};

export default RightSection;

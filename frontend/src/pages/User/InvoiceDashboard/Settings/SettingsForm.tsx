
import React, { useState } from 'react';
import { Box, Typography, useTheme, Tabs, Tab } from '@mui/material';
import GeneralSettings from './GeneralSettings';
import TaxSettings from './TaxSettings';
import PaymentQrSettings from './PaymentQrSettings';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const SettingsForm = () => {
  const theme = useTheme();
  const [value, setValue] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={value} 
          onChange={handleChange} 
          aria-label="settings tabs"
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.875rem',
              minWidth: 'auto',
              padding: '12px 24px',
              color: theme.palette.text.secondary,
              '&.Mui-selected': {
                color: theme.palette.primary.main,
              },
            },
            '& .MuiTabs-indicator': {
              backgroundColor: theme.palette.primary.main,
            },
          }}
        >
          <Tab label="GENERAL SETTING" />
          <Tab label="TAX" />
          <Tab label="PAYMENT QR CODE" />
        </Tabs>
      </Box>

      <TabPanel value={value} index={0}>
        <GeneralSettings />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <TaxSettings />
      </TabPanel>
      <TabPanel value={value} index={2}>
        <PaymentQrSettings />
      </TabPanel>
    </Box>
  );
};

export default SettingsForm;

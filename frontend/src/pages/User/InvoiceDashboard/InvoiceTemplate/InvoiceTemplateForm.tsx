
import React, { useState } from 'react';
import CustomInputField from '../../../../components/CustomInputField';
import CustomDropdown from '../../../../components/CustomDropdown';
import CustomButton from '../../../../components/CustomButton';
import { Box } from '@mui/material';

const InvoiceTemplateForm = () => {
  const [template, setTemplate] = useState('Default');
  const [color, setColor] = useState('#483594');
  const [country, setCountry] = useState('');

  const templateOptions = [
    { label: 'Default', value: 'Default' },
    { label: 'Modern', value: 'Modern' },
    { label: 'Classic', value: 'Classic' },
    { label: 'Minimal', value: 'Minimal' }
  ];

  const countryOptions = [
    { label: 'Default', value: 'Default' },
    { label: 'New York', value: 'New York' },
    { label: 'Toronto', value: 'Toronto' },
    { label: 'Rio', value: 'Rio' },
    { label: 'London', value: 'London' },
    { label: 'Istanbul', value: 'Istanbul' },
    { label: 'Mumbai', value: 'Mumbai' },
    { label: 'Hong Kong', value: 'Hong Kong' },
    { label: 'Tokyo', value: 'Tokyo' },
    { label: 'Paris', value: 'Paris' }
  ];

  const handleSave = () => {
    console.log('Template saved:', { template, color, country });
  };

  return (
    <Box className="invoice-template-form">
      <Box className="form-section">
        <h3 className="form-section-title">Invoice Template</h3>
        
        <Box className="form-group">
          <CustomDropdown
            label="Template"
            options={templateOptions}
            value={template}
            onChange={(e) => setTemplate(e.target.value as string)}
          />
        </Box>

        <Box className="form-group">
          <label className="form-label">COLOR</label>
          <Box className="color-picker-wrapper">
            <Box 
              className="color-picker"
              style={{ backgroundColor: color }}
            ></Box>
            <CustomInputField
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="color-input"
            />
          </Box>
        </Box>

        <Box className="form-group">
          <CustomDropdown
            label="Country/Region"
            options={countryOptions}
            value={country}
            onChange={(e) => setCountry(e.target.value as string)}
          />
        </Box>

        <Box className="form-actions">
          <CustomButton
            onClick={handleSave}
            className="save-button"
          >
            Save
          </CustomButton>
        </Box>
      </Box>
    </Box>
  );
};

export default InvoiceTemplateForm;

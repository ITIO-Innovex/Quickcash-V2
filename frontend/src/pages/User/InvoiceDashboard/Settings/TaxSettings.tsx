import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import CustomButton from '@/components/CustomButton';
import GenericTable from '@/components/common/genericTable'; 
import { useNavigate } from 'react-router-dom';

const TaxSettings = () => {
  const navigate = useNavigate();
  const [taxData, setTaxData] = useState([
    {
      date: '2025-07-11',
      name: 'GST',
      value: '18%',
      default: 'Yes',
    },
    {
      date: '2025-06-10',
      name: 'VAT',
      value: '12%',
      default: 'No',
    },
  ]);

  const handleAddTax = () => {
    console.log("Add Tax clicked");
    navigate('/settings/add-tax');
  };

  const columns = [
    { field: 'date', headerName: 'Date' },
    { field: 'name', headerName: 'Name' },
    { field: 'value', headerName: 'Value' },
    { field: 'default', headerName: 'Default' },
    {
      field: 'action',
      headerName: 'Action',
      render: (row: any) => (
        <CustomButton variant="outlined" size="small" onClick={() => console.log('Edit', row)}>
          Edit
        </CustomButton>
      ),
    },
  ];

  return (
    <Box className="tax-settings-container">
      <Box className="tax-settings-header">
        <Typography variant="h6">Tax Settings</Typography>
        <CustomButton onClick={handleAddTax} >Add Tax</CustomButton>
      </Box>

      <GenericTable columns={columns} data={taxData} />
    </Box>
  );
};

export default TaxSettings;

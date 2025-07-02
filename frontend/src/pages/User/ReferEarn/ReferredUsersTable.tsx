
import React from 'react';
import { Box, Typography } from '@mui/material';
import GenericTable from '../../../components/common/genericTable';

const ReferredUsersTable = () => {
  const columns = [
    { field: 'registeredAt', headerName: 'REGISTERED AT' },
    { field: 'name', headerName: 'NAME' },
    { field: 'email', headerName: 'EMAIL' },
    { field: 'contactNo', headerName: 'CONTACT NO.' },
  ];

  const referredUsers = [
    {
      registeredAt: '2024-01-15',
      name: 'John Doe',
      email: 'john.doe@example.com',
      contactNo: '+1234567890'
    },
    {
      registeredAt: '2024-01-20',
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      contactNo: '+1234567891'
    },
    {
      registeredAt: '2024-01-25',
      name: 'Mike Johnson',
      email: 'mike.johnson@example.com',
      contactNo: '+1234567892'
    }
  ];

  return (
    <Box>
      <Typography variant="h6" component="h3" sx={{ mb: 3, fontWeight: 600 }}>
        Referred Users
      </Typography>
      <GenericTable columns={columns} data={referredUsers} />
    </Box>
  );
};

export default ReferredUsersTable;

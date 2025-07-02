import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import GenericTable from '../../../components/common/genericTable';
import api from '@/helpers/apiHelper';
import { jwtDecode } from 'jwt-decode';
const url = import.meta.env.VITE_NODE_ENV == "production" ? 'api' : 'api';

interface JwtPayload {
  sub: string;
  role: string;
  iat: number;
  exp: number;
  data: {
    defaultcurr: string;
    email: string;
    id: string;
    name: string;
    type: string;
  };
}
const LoginHistory = () => {
  const theme = useTheme();
  const [sessionList, setSessionList] = useState([]);
  const accountId = jwtDecode<JwtPayload>(localStorage.getItem('token') as string);
  const getUserSessionHistory = async () => {
    try {
      const result = await api.get(`/${url}/v1/session/getusersession/${accountId?.data?.id}`);
      if (result.data.status === 201) {
        const transformedData = result.data.data.map(item => ({
          date: new Date(item.createdAt).toLocaleString(),  // Format date
          browser: item.device,
          os: item.OS,
          ip: item.ipAddress,
        }));
        setSessionList(transformedData);
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  useEffect(() => {
    if (accountId?.data?.id) {
      getUserSessionHistory();
    }
  }, [accountId]);

  const columns = [
    { field: 'date', headerName: 'DATE & TIME' },
    { field: 'browser', headerName: 'BROWSER' },
    { field: 'os', headerName: 'OPERATING SYSTEM' },
    { field: 'ip', headerName: 'IP ADDRESS' }
  ];

  return (
    <Box sx={{ p: 3, backgroundColor: theme.palette.background.default, color: theme.palette.text.primary }}>
      <Typography
        variant="h6"
        sx={{ mb: 3, fontWeight: 'bold' }}
      >
        Login History
      </Typography>
      <GenericTable columns={columns} data={sessionList} />
    </Box>
  );
};

export default LoginHistory;

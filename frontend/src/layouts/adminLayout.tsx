import { Box, useMediaQuery } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import Header from '@/components/common/header';
import AdminSidebar from '@/components/common/adminSidebar';
import { useEffect, useState } from 'react';

const AdminLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const drawerWidth = isMobile ? 60 : (isSidebarOpen ? 300 : 80);
  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [isMobile]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header drawerWidth={drawerWidth} collapsed={!isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(prev => !prev)} />
      <Box sx={{ display: 'flex', flex: 1, backgroundColor: theme.palette.background.default }}>
        <Box sx={{ width: drawerWidth, flexShrink: 0 }}>
          <AdminSidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(prev => !prev)} />
        </Box>
        <Box
          sx={{
            flexGrow: 1,
            p: 1,
            overflowX: 'hidden',
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default AdminLayout;

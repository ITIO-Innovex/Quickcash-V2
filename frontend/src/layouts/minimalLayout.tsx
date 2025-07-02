import { Box, useMediaQuery } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import Header from '@/components/common/header';
import Sidebar from '@/components/common/userSidebar';
import { useEffect, useState } from 'react';

const MinimalLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isComingFromSource = localStorage.getItem('source');

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const drawerWidth = isMobile ? 60 : (isSidebarOpen ? 300 : 80);
  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [isMobile]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {!isComingFromSource && <Header drawerWidth={drawerWidth} collapsed={!isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(prev => !prev)} />}
      <Box sx={{ display: 'flex', flex: 1, backgroundColor: theme.palette.background.default }}>
        {
          !isComingFromSource && (
            <Box sx={{ width: drawerWidth, flexShrink: 0 }}>
              <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(prev => !prev)} />
            </Box>
          )
        }
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

export default MinimalLayout;

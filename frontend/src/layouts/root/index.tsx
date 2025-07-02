import { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { useSettings } from '@/contexts/SettingsContext';
import Navbar from './Navbar';
import { Box, Container } from '@mui/material';
import { FC } from 'react';

interface RootLayoutProps {
  children: ReactNode;
}

const Layout: FC = () => {
  const { themeMode, toggleTheme } = useSettings();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar mode={themeMode} toggleColorMode={toggleTheme} />
      <Container
        component="main"
        maxWidth={false}
        sx={{ flexGrow: 1, py: 3, px: { xs: 2, md: 6, lg: 12 } }}
      >
        <Outlet />
      </Container>
    </Box>
  );
};

export default Layout;

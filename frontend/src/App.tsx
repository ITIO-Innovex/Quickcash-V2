import React, { useEffect, useState } from 'react';
import { RouterProvider } from 'react-router-dom';
import router from '@/routes/index';
import ThemeConfig from '@/theme/index';
import 'react-circular-progressbar/dist/styles.css';
import { SettingsProvider } from './contexts/SettingsContext';
import Loader from './components/common/loader';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from '@/contexts/authContext'; // Import AuthProvider
import { Toaster } from 'sonner';

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <Loader />;

  return (
    <AuthProvider>
        <SettingsProvider>
          <ThemeConfig>
            <RouterProvider router={router} />
            <Toaster position="top-right" richColors />
          </ThemeConfig>
        </SettingsProvider>
    </AuthProvider>
  );
};

export default App;

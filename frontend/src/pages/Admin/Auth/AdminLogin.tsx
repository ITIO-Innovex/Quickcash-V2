import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CustomButton from '@/components/CustomButton';
import CustomInput from '@/components/CustomInputField';
import { useSettings } from '@/contexts/SettingsContext';
import CustomPassword from '@/components/CustomPasswordField';
import ForgotPasswordModal from '@/modal/forgotPasswordModal';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import {
  Box,
  Checkbox,
  FormControlLabel,
  IconButton,
  Typography,
  useTheme,
} from '@mui/material';
import { useAuth } from '@/contexts/authContext';
import admin from '@/helpers/adminApiHelper';

const AdminLogin = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { themeMode, toggleTheme } = useSettings();
  const [forgotOpen, setforgotOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Use adminLogin from authContext
  const { adminLogin, isAdminAuthenticated } = useAuth();

  const url = import.meta.env.VITE_NODE_ENV === "production" ? 'api' : 'api';

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await admin.post(`/${url}/v1/admin/login`, { email, password });
      if (result.status === 200 && result.data.token) {
        adminLogin(result.data.token); // Save token and set admin state
        console.log(`${result.data.data.fname} is Logged In Successfully!`);
        navigate('/admin/dashboard');
      } else {
        console.log('Login failed: Invalid response');
      }
    } catch (error: any) {
      console.log('Login error:', error?.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="login-container">
      <Box className="login-left-container"></Box>
      <Box className="login-right-container">
        <Box className="back-to-home" onClick={() => navigate('/')}>
          <ArrowBackIosNewIcon className="back-arrow-icon" />
          <span>Back to Home</span>
        </Box>
        <Box className="theme-toggle">
          <IconButton onClick={toggleTheme} color="inherit">
            {themeMode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Box>
        <Box className="login-box">
          <Typography
            variant="h5"
            className="login-title"
            sx={{ color: (theme) => theme.palette.navbar.text }}
          >
            Welcome Back Admin
          </Typography>
          <Typography variant="body1" className="login-subtitle" style={{ color: theme.palette.text.gray }}>
            Sign-in to your account and start the journey
          </Typography>
          <form className="login-form" onSubmit={handleSubmit}>
            <CustomInput
              name="email"
              label="Email Address"
              type="email"
              variant="outlined"
              fullWidth
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <CustomPassword
              name="password"
              label="Password"
              variant="outlined"
              fullWidth
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <Box className="remember-forgot-container">
              <FormControlLabel
                control={<Checkbox size="small" />}
                label="Remember me"
                className="remember-label"
              />
              {/* <Link
                to="/forgot-password"
                className="forgot-link"
                style={{ color: theme.palette.navbar.text }}
                onClick={e => { e.preventDefault(); setforgotOpen(true); }}
              >
                Forgot password?
              </Link>
              <ForgotPasswordModal
                open={forgotOpen}
                onClose={() => setforgotOpen(false)}
              /> */}
            </Box>
            <CustomButton
              type="submit"
              fullWidth
              loading={loading}
            >
              SIGN IN
            </CustomButton>
          </form>
          <Box className="login-form-footer" style={{ color: theme.palette.text.gray }}>
            {/* <p>
              New on our platform?{' '}
              <a href="/register" className="signup-link" style={{ color: theme.palette.navbar.text }}>
                Create an account
              </a>
            </p> */}
            <Typography variant="caption" className="copyright-text" style={{ color: theme.palette.text.gray }}>
              © Quick Cash 2025.
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default AdminLogin;

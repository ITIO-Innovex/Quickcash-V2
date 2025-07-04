import { useState, useEffect } from 'react';
import { Link, redirect, useNavigate, useSearchParams } from 'react-router-dom';
import CustomButton from '@/components/CustomButton';
import CustomInput from '@/components/CustomInputField';
import { useSettings } from '@/contexts/SettingsContext';
import CustomPassword from '@/components/CustomPasswordField';
import ForgotPasswordModal from '@/modal/forgotPasswordModal';
import {
  Box,
  Checkbox,
  FormControlLabel,
  IconButton,
  Typography,
  useTheme,
} from '@mui/material';
import axios from 'axios';
import { isValidateEmail, isValidPassword } from '@/utils/validator';
import { useAppToast } from '@/utils/toast';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '@/contexts/authContext';
import { jwtDecode } from 'jwt-decode';
import { API_ROUTES } from '../constant/apiRoutes';
import { getBearerToken } from '@/pages/User/constant/Utils.jsx';

// Utility functions
const validate = (field: string, value: string): boolean => {
  switch (field) {
    case 'email':
      return !isValidateEmail(value);
    case 'password':
      return !isValidPassword(value);
    default:
      return false;
  }
};

const setAuthenticated = (val: boolean) => {
  return val;
};

const authenticateDSUser = (data: any) => {
  localStorage.setItem('userData', JSON.stringify(data));
};

const errors: { email?: string; password?: string } = {
  email: 'Please enter a valid email address',
  password: 'Password must be at least 6 characters long',
};

const UserLogin = () => {
  const theme = useTheme();
  const toast = useAppToast();
  const navigate = useNavigate();
  const { themeMode, toggleTheme } = useSettings();
  const { login } = useAuth();
  const [forgotOpen, setforgotOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticatedState] = useState(false);
  const url = import.meta.env.VITE_NODE_ENV == "production" ? 'api' : 'api';
  const [searchParams] = useSearchParams();

  const vaildateUser = async (redirectUrl?: string) => {
    // debugger;  
    console.log('Validating user with token:', localStorage.getItem('token'));
    try {
      const result = await axios.post(`/${url}/v1/user/auth`, {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (result.data.status === 201) {
        navigate(redirectUrl || '/dashboard');
        
        setAuthenticated(true);
        setAuthenticatedState(true);

        if (result?.data?.data) {
          localStorage.setItem('UserInformation', JSON.stringify(result.data.data));
        }
      }
    } catch (error: any) {
      console.log("error", error);
      toast.error(error.response?.data?.message || 'Validation failed');
    }
  };

  const addLoginSession = async (val: any) => {
    console.log('Adding login session for user:', val);
    try {
      const result = await axios.post(`/${url}/v1/session/add`, {
        user: val,
        device: (navigator as any)?.userAgentData?.brands?.[0]?.brand,
        OS: (navigator as any)?.userAgentData?.platform,
        status: 1,
        isActiveNow: 1
      });

      console.log('Session add response:', result.data);
      if (result.data.status === 201) {
        localStorage.setItem('UserInformation', JSON.stringify(result.data.data));
        localStorage.setItem('usersessionid', result.data.data._id);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Session error');
      console.log("Login api error", error);
    }
  };

  const HandleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    console.log('Attempting login with email:', email);

    try {
      if (!validate("email", email) && !validate("password", password)) {
        const result = await axios.post(`/${url}/v1/user/login`, { email, password });

        console.log('Login response:', result.data);
        if (result.status === 200) {
          await addLoginSession(result.data.data._id);
          toast.success(`${result.data.data.name} is Logged In Successfully!!!`);
          login(result.data.token);
          authenticateDSUser(result.data.data);
          navigate("/dashboard")
        }
      } else {
        if (validate("email", email)) {
          toast.error(errors.email || 'Email error');
        }
        if (validate("password", password)) {
          toast.error(errors.password || 'Password error');
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login error');
      console.log("Login api error", error);
    } finally {
      setLoading(false);
    }
  };

  const checkExistingSession = async () => {
    if (searchParams.get('token')) {
      try {
        const decodedToken: any = jwtDecode(searchParams.get('token') || '')
        const redirectUrl = `/digital-signature/placeholder-sign/${decodedToken?.data?.documentId}` || '/dashboard';

        localStorage.setItem('token', searchParams.get('token') || '');
        localStorage.setItem('source', decodedToken?.data?.source || '');

        return vaildateUser(redirectUrl);
      } catch (error) {
        toast.error('Invalid Token');
        console.log("Invalid Token", error);
      }
    }

    if (localStorage.getItem('token')) {
      return vaildateUser();
    }
  }

  useEffect(() => {
    checkExistingSession();
  }, []);

  return (
    <Box className="login-container">
      <Box className="login-left-container">

      </Box>

      <Box className="login-right-container">
        <Box className="login-box">
          <Typography
            variant="h5"
            className="login-title"
            sx={{ color: (theme) => theme.palette.navbar.text }}
          >
            Welcome Back
          </Typography>
          <Typography variant="body1" className="login-subtitle" style={{ color: theme.palette.text.gray }}>
            Sign-in to your account and start the journey
          </Typography>

          <form className="login-form" onSubmit={HandleLogin} autoComplete='off'>
            <CustomInput
              required
              name="email"
              label="Email Address"
              type="email"
              variant="outlined"
              fullWidth
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="new-email"
            />
            <CustomPassword
              required
              name="password"
              label="Password"
              type="password"
              variant="outlined"
              fullWidth
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="new-password"
            />
            <Box className="remember-forgot-container">
              <FormControlLabel
                control={<Checkbox size="small" />}
                label="Remember me"
                className="remember-label"
                sx={{ color: theme => theme.palette.text.primary }}
              />
              <Link
                to="/forgot-password"
                className="forgot-link"
                style={{ color: theme.palette.navbar.text }}
                onClick={() => setforgotOpen(true)}
              >
                Forgot password?
              </Link>
              <ForgotPasswordModal
                open={forgotOpen}
                onClose={() => setforgotOpen(false)}
              />
            </Box>
            <CustomButton
              type="submit"
              fullWidth
              loading={loading}
              onClick={HandleLogin}
            >
              SIGN IN
            </CustomButton>
          </form>

          <Box className="login-form-footer" style={{ color: theme.palette.text.gray }}>
            <p>
              New on our platform?{' '}
              <a href="/register" className="signup-link" style={{ color: theme.palette.navbar.text }}>
                Create an account
              </a>
            </p>
            <Typography variant="caption" className="copyright-text" style={{ color: theme.palette.text.gray }}>
              © Quick Cash 2025.
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default UserLogin;

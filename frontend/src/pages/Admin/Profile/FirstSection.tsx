import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Typography,
  Avatar,
  IconButton,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Edit } from 'lucide-react';
import CustomButton from '@/components/CustomButton';
import { jwtDecode } from 'jwt-decode';
import admin from '@/helpers/adminApiHelper';
import { showToast } from '@/utils/toastContainer';
import { TextField } from '@mui/material';
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
const FirstSection = () => {
  const theme = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [imageName, setImageName] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageFront1, setImageFront1] = useState<File | null>(null);

  const [fname, setFname] = useState('');
  const [lname, setLname] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFront1(file);
      setImageName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditClick = () => {
    fileInputRef.current?.click();
  };


  const profileUpdate = async () => {
    const token = localStorage.getItem('admin');
    if (!token) return;

    const accountId = jwtDecode<JwtPayload>(token);

    const formData = new FormData();
    formData.append('fname', fname);
    formData.append('lname', lname);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('user_id', accountId?.data?.id);
    if (imageFront1) {
      formData.append('profileAvatar', imageFront1);
    }

    try {
      const result = await admin.patch(`/${url}/v1/admin/update-profile`, formData);

      if (result.data.status === 201) {
        showToast(result.data.message, 'success');
        // getProfileDetails();
      }
    } catch (error: any) {
      console.error('error', error);
      showToast(error?.response?.data?.message || 'Update failed', 'error');
    }
  };

  // const getProfileDetails = async () => {
  //   try {
  //     const result = await admin.get(`/${url}/v1/admin/auth`);
  //     console.log("Fetched profile data:", result.data.data);

  //     if (result.data.status === 201) {
  //       const data = result.data.data;

  //       setFname(data?.fname || '');
  //       setLname(data?.lname || '');
  //       setEmail(data?.email || '');
  //       setMobile(data?.mobile || '');
  //       setPassword('');
  //       if (data?.profileAvatar) {
  //         setSelectedImage(data.profileAvatar);
  //       }
  //     }

  //   } catch (error) {
  //     console.error('Error fetching profile details:', error);
  //       console.log('email state:', email);
  // console.log('password state:', password);
  //   }
  // };

  // useEffect(() => {
  //   getProfileDetails();
  // }, []);



  return (
    <Box
      sx={{
        p: 3,
        borderBottom: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.default,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: 4,
          alignItems: isMobile ? 'center' : 'flex-start',
        }}
      >
        {/* Profile Picture Section */}
        <Box
          sx={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Avatar
            src={selectedImage || undefined}
            sx={{
              width: 120,
              height: 120,
              backgroundColor: theme.palette.grey[400],
              fontSize: '3rem',
            }}
          >
            {!selectedImage && '👤'}
          </Avatar>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleImageUpload}
          />
          {imageName && (
            <Typography
              variant="caption"
              sx={{ mt: 1, color: theme.palette.text.secondary }}
            >
              {imageName}
            </Typography>
          )}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              mt: 1,
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            <CustomButton
              variant="contained"
              size="small"
              onClick={profileUpdate}
            >
              UPDATE
            </CustomButton>

            <IconButton
              onClick={handleEditClick}
              sx={{
                backgroundColor: '#483594',
                color: 'white',
                width: 36,
                height: 36,
                '&:hover': {
                  backgroundColor: '#3d2a7a',
                },
              }}
            >
              <Edit size={14} />
            </IconButton>
          </Box>
        </Box>

        {/* Admin Details Section */}
        <Box sx={{ flex: 1, width: '100%' }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
              gap: 2,
            }}
          >
            <TextField
              fullWidth
              label="First Name"
              value={fname}
              onChange={(e) => setFname(e.target.value)}
            />
            <TextField
              fullWidth
              label="Last Name"
              value={lname}
              onChange={(e) => setLname(e.target.value)}
            />
            <TextField
              fullWidth
              label="Email"
              // value={email}
              onChange={(e) => setEmail(e.target.value)}
                autoComplete="off"
            />
            <TextField
              fullWidth
              label="Mobile"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              // value={password}
              onChange={(e) => setPassword(e.target.value)}
                autoComplete="off"
            />
          </Box>

        </Box>
      </Box>
    </Box>
  );
};

export default FirstSection;

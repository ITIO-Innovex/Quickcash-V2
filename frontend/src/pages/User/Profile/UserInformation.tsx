import React, { useRef, useState, useEffect } from 'react';
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
import api from '@/helpers/apiHelper';
import {jwtDecode} from 'jwt-decode';
import useValidation from '@/helpers/userValidation';
import { useAppToast } from '@/utils/toast';
const url = import.meta.env.VITE_NODE_ENV === "production" ? "api" : "api";

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

interface User {
  firstName: string;
  lastName?: string;
  email: string;
  mobile: string;
  address: string;
  defaultCurrency: string;
  profilePic: string;
}

const UserInformation: React.FC = () => {
  const theme = useTheme();
  const { errors, validate } = useValidation();
  const accountId = jwtDecode<JwtPayload>(localStorage.getItem('token') as string);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageName, setImageName] = useState<string>('');
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageProfile, setImageProfile] = useState<{ raw: File | null }>({ raw: null });
  const toast = useAppToast();

  const [user, setUser] = useState<User>({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    address: '',
    defaultCurrency: '',
    profilePic: '',
  });
  const [loader, setLoader] = useState(true);

  // Fetch user details
  const getUserDetails = async () => {
    try {
      const result = await api.post(
        `/${url}/v1/user/auth`,
        {},
       
      );
      if (result?.data?.status === 201) {
        const data = result.data.data;
        setUser({
          firstName: data.name|| '',
          email: data.email || '',
          mobile: "+" + (data.mobile || ''),
          address: data.address || '',
          defaultCurrency: data.defaultCurrency || '',
          profilePic: data.ownerProfile || '',
        });
      }
    } catch (error) {
      console.log("error", error);
    } finally {
      setLoader(false);
    }
  };

  useEffect(() => {
    getUserDetails();
    // eslint-disable-next-line
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageName(file.name);
      setImageProfile({ raw: file });
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

  const SaveUserProfilePic = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error("User not authenticated");
      return;
    }
    if (imageProfile?.raw && !validate('file', imageProfile.raw)) {
      const formData = new FormData();
      formData.append('ownerProfile', imageProfile.raw);

      await api.patch(`/${url}/v1/user/update-profile`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      })
        .then(result => {
          if (result.data.status == 201) {
            const updatedUser = result.data.data;
            const newProfilePic = updatedUser.ownerProfile
              ? `${updatedUser.ownerProfile}?t=${Date.now()}`
              : '';
            setUser(prev => ({
              ...prev,
              profilePic: newProfilePic
            }));
            getUserDetails();
            setSelectedImage(newProfilePic || null);
            setImageProfile({ raw: null });
            setImageName('');
            toast.success("Profile picture updated successfully");
          }
        })
        .catch(error => {
          console.error("error", error);
        });
    } else {
      if (imageProfile?.raw && validate('file', imageProfile.raw)) {
        validate('files[]', imageProfile.raw);
      } else {
        console.error("Please select Image");
      }
    }
  };

  const handleUpdateClick = () => {
    SaveUserProfilePic();
  };

  const userDetails = [
    { label: 'USER NAME:', value: user.firstName || '-' },
    { label: 'EMAIL:', value: user.email || '-' },
    { label: 'MOBILE:', value: user.mobile || '-' },
    { label: 'ADDRESS:', value: user.address || '-' },
    { label: 'DEFAULT CURRENCY:', value: user.defaultCurrency || '-' },
  ];

  if (loader) return <div>Loading...</div>;

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
            src={(() => {
              // If user.profilePic is a full URL, use it directly
              if (user.profilePic && (user.profilePic.startsWith('http') || user.profilePic.startsWith('/'))) {
                return user.profilePic;
              }
              // If user.profilePic is just a filename, build the path
              if (user.profilePic && accountId?.data?.id) {
                return `${import.meta.env.VITE_PUBLIC_URL || ''}/storage/profile/${accountId.data.id}/${user.profilePic}`;
              }
              // If a new image is selected, show preview
              if (selectedImage) return selectedImage;
              return undefined;
            })()}
            sx={{
              width: 120,
              height: 120,
              backgroundColor: theme.palette.grey[400],
              fontSize: '3rem',
            }}
          >
            {!(selectedImage || user.profilePic) && '👤'}
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
              onClick={handleUpdateClick}
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
            {userDetails.map((detail, index) => (
              <Box key={index}>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 600,
                    color: theme.palette.text.primary,
                    display: 'block',
                    mb: 0.5,
                  }}
                >
                  {detail.label}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color:
                      detail.value === '-'
                        ? theme.palette.text.disabled
                        : theme.palette.text.primary,
                    mb: 1,
                  }}
                >
                  {detail.value}
                </Typography>
                <Box
                  component="hr"
                  sx={{
                    border: 0,
                    borderTop: `1px solid ${theme.palette.divider}`,
                    mb: 1,
                  }}
                />
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default UserInformation;

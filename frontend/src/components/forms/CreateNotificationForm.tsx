import ReactQuill from 'react-quill-new';
import 'quill/dist/quill.snow.css';
import React, { useState } from 'react';
import CustomButton from '../CustomButton';
import CustomInput from '@/components/CustomInputField';
import { Box, Divider, MenuItem, Select, Typography, useTheme } from '@mui/material';
import { jwtDecode } from 'jwt-decode';
import { useAppToast } from '@/utils/toast'; 
import { useUser } from '@/hooks/useUsers';
import admin from '@/helpers/adminApiHelper';
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
const url = import.meta.env.VITE_NODE_ENV === "production" ? 'api' : 'api';

interface Props {
  onClose: () => void;
   onAdded?: () => void;
}

const CreateNotificationForm: React.FC<Props> = ({ onClose, onAdded }) => {
  const theme = useTheme();
  const toast = useAppToast(); 
  const [user, setUser] = useState('');
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState('');
  const [image, setImage] = useState<{ preview: string; raw: File | null }>({ preview: '', raw: null });
  const [content, setContent] = useState('');
  const { userList } = useUser();
  // Image upload handler
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImage({
        preview: URL.createObjectURL(e.target.files[0]),
        raw: e.target.files[0],
      });
    }
  };

  // Main API submission logic
  const handleSaveNotification = async () => {
    const accountId = jwtDecode<JwtPayload>(localStorage.getItem('admin') as string);
    const formData = new FormData();

    formData.append('user', user || accountId?.data?.id);
    formData.append('title', title);
    formData.append('tags', tags);
    if (image.raw) formData.append('attachment', image.raw);
    formData.append('message', content);
    formData.append('notifyFrom', 'admin');
    formData.append('notifyType', user ? 'user' : 'all');

    try {
      const result = await admin.post(`/${url}/v1/admin/notification/add`, formData
       );

      if (result?.data?.status === 201) {
        setUser('');
        setTitle('');
        setTags('');
        setImage({ preview: '', raw: null });
        setContent('');
        toast.success(result?.data?.message);
        onAdded?.();
        onClose();
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="subtitle2" sx={{ color: theme.palette.text.primary }}>User (Optional)</Typography>
      <Select
        fullWidth
        value={user}
        onChange={(e) => setUser(e.target.value)}
        displayEmpty
      
      >
        <MenuItem value="">
          <em>Select a user</em>
        </MenuItem>
        {userList?.map((item: any, index: number) => (
          <MenuItem key={index} value={item._id}>
            {item.name}
          </MenuItem>
        ))}
      </Select>

      <CustomInput label="Title" value={title} onChange={(e) => setTitle(e.target.value)} fullWidth />
      <CustomInput label="tags" value={tags} onChange={(e) => setTags(e.target.value)} fullWidth />

      <Typography variant="subtitle2" sx={{ color: theme.palette.text.primary }}>Upload Image</Typography>
      <input type="file" onChange={handleImageChange} />
      {image.preview && (
        <img
          src={image.preview}
          alt="preview"
          width="300px"
          height="200px"
          style={{ marginBottom: '12px' }}
          onError={({ currentTarget }) => {
            currentTarget.onerror = null;
            currentTarget.src = `${import.meta.env.VITE_APP_URL}/otherdocs.png`;
          }}
        />
      )}

      <Box>
        <Typography variant="subtitle2" sx={{ color: theme.palette.text.primary }}>Content</Typography>
        <ReactQuill theme="snow" value={content} onChange={setContent} />
        <Divider sx={{ mt: 1 }} />
      </Box>

      <Box sx={{ display: 'flex', gap: 2 }}>
        <CustomButton onClick={handleSaveNotification}>Send</CustomButton>
        <CustomButton onClick={onClose}>Close</CustomButton>
      </Box>
    </Box>
  );
};

export default CreateNotificationForm;

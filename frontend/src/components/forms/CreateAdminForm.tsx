import React, { useState } from 'react';
import CustomButton from '../CustomButton';
import { Box, MenuItem, Select, useTheme } from '@mui/material';
import CommonDateInput from '../CustomDateInput';
import CustomInput from '@/components/CustomInputField';
import admin from '@/helpers/adminApiHelper';

interface Props {
  onClose: () => void;
  onAdminAdded?: () => void;
}
const url = import.meta.env.VITE_NODE_ENV == "production" ? 'api' : 'api';

const CreateAdminForm: React.FC<Props> = ({ onClose, onAdminAdded }) => {
  const theme = useTheme();
  const [editId, setEditId] = useState<string | null>(null);
  const [fname, setFname] = useState('');
  const [lname, setLname] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [status, setStatus] = useState('true');
  const [autoResetTime, setAutoResetTime] = useState('');

  const handleSubmit = async () => {
    if (editId) {
      // Update
      try {
        const result = await admin.patch(`/${url}/v1/admin/update-profile`, {
          user_id: editId,
          fname,
          lname,
          email,
          mobile,
          autoResetTime,
          status,
        });
        if (result.data.status == 201) {
          if (onAdminAdded) onAdminAdded();
          onClose();
          setEditId(null);
        }
      } catch (error: any) {
        alert(error?.response?.data?.message || 'Update failed');
      }
    } else {
      // Create
      try {
        const result = await admin.post(`/${url}/v1/admin/register`, {
          fname,
          lname,
          email,
          mobile,
          autoResetTime,
          status: true,
          password: Math.random().toString(36).slice(2, 7),
        });
        if (result.data.status == 201) {
          if (onAdminAdded) onAdminAdded();
          onClose();
        }
      } catch (error: any) {
        alert(error?.response?.data?.message || 'Create failed');
      }
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <CustomInput
        label="FirstName"
        fullWidth
        value={fname}
        onChange={(e) => setFname(e.target.value)}
      ></CustomInput>

      <CustomInput
        label="LastName"
        fullWidth
        value={lname}
        onChange={(e) => setLname(e.target.value)}
      ></CustomInput>

      <CustomInput
        label="Email"
        fullWidth
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      ></CustomInput>

      <CustomInput
        label="Mobile"
        fullWidth
        value={mobile}
        onChange={(e) => setMobile(e.target.value)}
      ></CustomInput>

      <CommonDateInput
        label="Auto Reset-Password Date"
        type="date"
        value={autoResetTime}
        onChange={(e) => setAutoResetTime(e.target.value)}
        InputLabelProps={{ shrink: true }}
        fullWidth
      />
      <Select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        fullWidth
      >
        <MenuItem value={"true"}>Active</MenuItem>
        <MenuItem value={"false"}>Inactive</MenuItem>
      </Select>
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
        <CustomButton onClick={handleSubmit}>{editId ? 'Update' : 'Create'}</CustomButton>
        <CustomButton onClick={onClose}>Close</CustomButton>
      </Box>
    </Box>
  );
};

export default CreateAdminForm;

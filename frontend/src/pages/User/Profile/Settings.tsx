import { useEffect, useState } from 'react';
import { Box, FormControl, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import api from '@/helpers/apiHelper';
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

const Settings = () => {
  const theme = useTheme();
  const toast = useAppToast();
   const [emailStatement, setEmailStatement] = useState(false);
  const handleEmailStatementChange = async (e) => {
    const newValue = e.target.checked;
      setEmailStatement(newValue);

    try {
      const response  = await api.patch(`${url}/v1/user/update-email-statement`,
        { emailStatement: newValue }
      );
      console.log("Response", response);  
      if (response.status === 200) {
          toast.success('Email statement updated successfully');
        console.log("Email statement updated successfully");
      } else {
        toast.error('Something went wrong while updating email statement');
        console.error("Failed to update email statement");
      }
    } catch (err) {
      toast.error('Something went wrong while updating email statement');
      console.error("Update failed", err);
    }
  };
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchUserSettings = async () => {
      try {
        const response = await api.get(`${url}/v1/user/get-user-details`);
        if (response.status === 201) {
          console.log("User settings fetched successfully:", response.data);
          setEmailStatement(response.data.data.emailStatement);
        } else {
          console.error("Failed to fetch user settings");
        }
      } catch (error) {
        console.error("Error fetching user settings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserSettings();
  }, []);

  return (
    <Box className="update-details-container">
      <Typography variant="h6" className="update-details-title">
        Settings
      </Typography>

      <Box component="form"  sx={{ maxWidth: 600, border: '1px solid #ccc', borderRadius: 2, p: 3, mt: 2 }}>
        <Typography variant="body1" sx={{ mb: 2 }}>
          <span style={{fontWeight:"bold"}}>Note: </span>Click below checkbox to receive email statement every month
        </Typography>   
        <FormControl>
{!loading && (
            <input
                 type="checkbox"
                  id="emailStatement"
                  name="emailStatement"
                  checked={emailStatement}
                  onChange={handleEmailStatementChange}
                style={{ marginRight: 8 }}
            />
)}
        </FormControl>
        {/* Add form fields or settings options here */}

      </Box>

    </Box>
  );
};

export default Settings;

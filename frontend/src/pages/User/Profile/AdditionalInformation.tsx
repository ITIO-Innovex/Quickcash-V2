import { Box, Grid, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import api from '@/helpers/apiHelper';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import copy from "copy-to-clipboard";
import React from 'react';

const url = import.meta.env.VITE_NODE_ENV === "production" ? "api" : "api";

const AdditionalInformation = () => {
  const theme = useTheme();

  const [loader, setLoader] = useState(true);
  const [userDetails, setUserDetails] = useState<any>(null);

  const getUserDetails = async () => {
    try {
      const result = await api.post(
        `/${url}/v1/user/auth`,
        {},
       
      );
      // console.log("User Details:", result.data);
      if (result?.data?.status === 201) {
        setUserDetails(result.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch user details", error);
    } finally {
      setLoader(false);
    }
  };

  useEffect(() => {
    getUserDetails();
  }, []);
  const [openAlert, setOpenAlert] = React.useState(false);
  const contentCopy = (wid: string) => {
    copy(wid);
    setOpenAlert(true);
    setTimeout(() => {
      setOpenAlert(false);
    }, 900);
  };
  return (
    <Box
      sx={{
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.primary,
        p: 3,
        borderRadius: 1,
      }}
    >
      {/* <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }} >
        Additional Information
      </Typography> */}

      {loader ? (
        <Typography variant="body2" sx={{ textAlign: 'center' }}>
          Loading...
        </Typography>
      ) : userDetails ? (
        <Box>
          <Box sx={{ display: 'flex', mb: 1 }}>
            <Typography variant="body1" sx={{ minWidth: 250, fontWeight: 500 }}>
              City:
            </Typography>
            <Typography variant="body1">{userDetails.city?.name}</Typography>
          </Box>
          <Box sx={{ display: 'flex', mb: 1 }}>
            <Typography variant="body1" sx={{ minWidth: 250, fontWeight: 500 }}>
              State:
            </Typography>
            <Typography variant="body1">{userDetails.state?.name}</Typography>
          </Box>
          <Box sx={{ display: 'flex', mb: 1 }}>
            <Typography variant="body1" sx={{ minWidth: 250, fontWeight: 500 }}>
              Zip Code:
            </Typography>
            <Typography variant="body1">{userDetails.postalcode}</Typography>
          </Box>
          <Box sx={{ display: 'flex', mb: 1 }}>
            <Typography variant="body1" sx={{ minWidth: 250, fontWeight: 500 }}>
              Document Submitted:
            </Typography>
            <Typography variant="body1">{userDetails.owneridofindividual}</Typography>
          </Box>
          <Box sx={{ display: 'flex', mb: 1 }}>
            <Typography variant="body1" sx={{ minWidth: 250, fontWeight: 500 }}>
              Document Number:
            </Typography>
            <Typography variant="body1">{userDetails.ownertaxid}</Typography>
          </Box>

          <Box sx={{ display: 'flex', mb: 1 }}>
            <Typography variant="body1" sx={{ minWidth: 250, fontWeight: 500 }}>
              Referal Link:
            </Typography>
            <Typography variant="body1"> {
              userDetails?.referalDetails?.length > 0 ?
                <>
                  <Grid>{`${import.meta.env.VITE_APP_URL}/register?code=${userDetails?.referalDetails?.[0]?.referral_code}`} <ContentCopyOutlinedIcon sx={{ cursor: 'pointer' }} onClick={() => contentCopy(`${import.meta.env.VITE_APP_URL}/register?code=${userDetails?.referalDetails?.[0]?.referral_code}`)} /></Grid>
                </>
                :
                null
            }</Typography>
          </Box>
        </Box>
      ) : (
        <Typography variant="body2" sx={{ textAlign: 'center' }}>
          No additional information available
        </Typography>
      )}
    </Box>
  );
};

export default AdditionalInformation;

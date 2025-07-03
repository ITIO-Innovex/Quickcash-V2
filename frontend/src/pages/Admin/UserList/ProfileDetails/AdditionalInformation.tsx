import { Box, Grid, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import copy from "copy-to-clipboard";
import React, { useState } from 'react';
import CommonTooltip from '@/components/common/toolTip';

interface AdditionalInformationProps {
  userDetails: any;
}

const AdditionalInformation = ({ userDetails }: AdditionalInformationProps) => {
  const theme = useTheme();
  const [copied, setCopied] = useState(false);
  const [openAlert, setOpenAlert] = useState(false);

  const contentCopy = (wid: string) => {
    copy(wid);
    setCopied(true);
    setTimeout(() => setCopied(false), 900);
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
      <Box>
        <Box sx={{ display: 'flex', mb: 1 }}>
          <Typography variant="body1" sx={{ minWidth: 250, fontWeight: 500 }}>
            City:
          </Typography>
          <Typography variant="body1">{userDetails.city}</Typography>
        </Box>

        <Box sx={{ display: 'flex', mb: 1 }}>
          <Typography variant="body1" sx={{ minWidth: 250, fontWeight: 500 }}>
            State:
          </Typography>
          <Typography variant="body1">{userDetails.state}</Typography>
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
            Referral Link:
          </Typography>
          <Typography variant="body1">
            {
              userDetails?.referalDetails?.length > 0 &&
              <Grid>
                {`${import.meta.env.VITE_APP_URL}/register?code=${userDetails.referalDetails[0].referral_code}`}
               <CommonTooltip title={copied ? 'Copied' : 'Copy referral link'} arrow>
                <ContentCopyOutlinedIcon
                  sx={{ cursor: 'pointer', ml: 1 }}
                  onClick={() => contentCopy(`${import.meta.env.VITE_APP_URL}/register?code=${userDetails.referalDetails[0].referral_code}`)}
                />
              </CommonTooltip>
              </Grid>
            }
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default AdditionalInformation;

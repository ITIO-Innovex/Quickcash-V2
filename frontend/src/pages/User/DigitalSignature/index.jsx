import React, { useEffect } from 'react';
import Title from '../../../components/common/Title';
import { Box, Button, Grid } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import { purple } from '@mui/material/colors';
import CreateIcon from '@mui/icons-material/Create';
import SendIcon from '@mui/icons-material/Send';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import SendAndArchiveIcon from '@mui/icons-material/SendAndArchive';
import DrawIcon from '@mui/icons-material/Draw';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { useNavigate } from 'react-router-dom';
import DocumentsTable from './DocumentsTable';
import { TourProvider, useTour } from '@reactour/tour';
import InProgressDocumentsTable from './InProgressDocumentsTable';
import CompletedDocumentsTable from './CompletedDocumentsTable';
import DraftDocumentsTable from './DraftDocumentsTable';

const StyledButton = styled(Button)(({ theme }) => ({
  color: theme.palette.getContrastText(purple[500]),
  backgroundColor: '#483594',
  padding: '12px 24px',
  '&:hover': {
    backgroundColor: '#3c2c7a',
  },
}));

const buttonList = [
  {
    label: 'Sign yourself',
    redirectId: 'sHAnZphf69',
    redirectType: 'Form',
    icon: <CreateIcon />,
    path: '/digital-signature/sign-yourself-form'
  },
  {
    label: 'Request signature',
    redirectId: 'request-signature',
    redirectType: 'Form',
    icon: <SendIcon />,
    path: '/digital-signature/request-signature'
  },
];

const steps = [
  {
    selector: '[data-tut="tourbutton"]',
    content: 'Here you can choose to sign a document yourself or request signatures from others.',
  },
  {
    selector: '[data-tut="tourcards"]',
    content: 'These tables show documents that are currently in progress or saved as drafts.',
  },
  {
    selector: '[data-tut="tourtable"]',
    content: 'View and manage all your completed documents in this table. You can check their status and take relevant actions.',
  },
];

const DashboardContent = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { setIsOpen } = useTour();

  useEffect(() => {
    // Add a small delay to ensure the DOM is fully rendered
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, [setIsOpen]);

  return (
    <Box
      className="dashboard-container"
      sx={{ backgroundColor: theme.palette.background.default }}
    >
      <Title title="Dashboard" />
      <Box sx={{ mt: 5 }}>
        <Grid container spacing={2} data-tut="tourbutton">
          {buttonList.map((btn) => (
            <Grid item xs={12} md={6} key={btn.label}>
              <StyledButton
                fullWidth
                variant="contained"
                startIcon={btn.icon}
                onClick={() => {
                  navigate(btn.path);
                }}
              >
                {btn.label}
              </StyledButton>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* New cards section */}
      <Box sx={{ mt: 5 }} data-tut="tourcards">
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <InProgressDocumentsTable/>
          </Grid>
          <Grid item xs={12} md={6}>
            <DraftDocumentsTable/>
          </Grid>
        </Grid>
      </Box>

      {/* Table section */}
      <Box data-tut="tourtable">
        {/* <DocumentsTable /> */}
        <CompletedDocumentsTable/>
      </Box>
    </Box>
  );
};

const Dashboard = () => {
  return (
    <TourProvider
      steps={steps}
      showNavigation={true}
      showBadge={false}
      styles={{
        popover: (base) => ({
          ...base,
          backgroundColor: '#fff',
          color: '#000',
          borderRadius: '8px',
          padding: '20px',
        }),
        dot: (base) => ({
          ...base,
          backgroundColor: '#483594',
        }),
      }}
    >
      <DashboardContent />
    </TourProvider>
  );
};

export default Dashboard;

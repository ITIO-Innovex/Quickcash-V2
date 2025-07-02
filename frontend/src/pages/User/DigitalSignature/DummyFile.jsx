import React, { useEffect, useState } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Stack,
  Avatar,
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import GroupIcon from '@mui/icons-material/Group';
import AddIcon from '@mui/icons-material/Add';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SendIcon from '@mui/icons-material/Send';
import BarChartIcon from '@mui/icons-material/BarChart';
import DesignServicesIcon from '@mui/icons-material/DesignServices';
import QuickActionCard from './components/QuickActionCard';
import StatsRow from './components/StatsRow';
import RecentEnvelopes from './components/RecentEnvelopes';
import CompletionRateChart from './components/CompletionRateChart';
import { useNavigate } from 'react-router-dom';
import AnalyticsData from './AnalyticsData';
import axios from 'axios';
import { API_ROUTES } from '../constant/apiRoutes'; // adjust path as needed
import { getBearerToken } from '../constant/Utils'; // adjust path as needed

const DigitalDashboard = () => {
  const navigate = useNavigate();
  const mainThemeColor = '#483594';
  const lightThemeColor = '#ede9f7'; // a light version for backgrounds

  const [stats, setStats] = useState([
    // initial dummy values, will be replaced after fetch
    { label: 'Total Documents', value: 0, icon: <DescriptionIcon />, change: '', changeColor: 'success.main' },
    { label: 'Completed Signature', value: 0, icon: <CheckCircleIcon />, change: '', changeColor: 'success.main' },
    { label: 'Pending Signatures', value: 0, icon: <AccessTimeIcon />, change: '', changeColor: 'error.main' },
    { label: 'Active Signers', value: 0, icon: <GroupIcon />, change: '', changeColor: 'success.main' },
  ]);

  const [completedPending, setCompletedPending] = useState({ completed: 0, pending: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('UserInformation'));
        const userId = userInfo?.user;
        const payload = { limit: 1000, userid: userId, skip: 0, search: '' };
        const headers = { headers: { Authorization: getBearerToken() } };
        const response = await axios.post(API_ROUTES.GET_REPORT_LISTING, payload, headers);
        const documents = response?.data?.data?.documents || [];

        // Calculate stats
        const totalDocuments = documents.length;
        const completed = documents.filter(doc => doc.IsCompleted).length;
        const pending = documents.filter(doc => !doc.IsCompleted).length;
        const allSigners = documents.flatMap(doc => doc.Signers || []);
        const uniqueSigners = new Set(allSigners.map(s => s?.Email || s?.email)).size;

        setStats([
          {
            label: 'Total Documents',
            value: totalDocuments,
            icon: <DescriptionIcon sx={{ fontSize: 32, color: mainThemeColor }} />,
            change: '',
            changeColor: 'success.main',
          },
          {
            label: 'Completed Signature',
            value: completed,
            icon: <CheckCircleIcon sx={{ fontSize: 32, color: mainThemeColor }} />,
            change: '',
            changeColor: 'success.main',
          },
          {
            label: 'Pending Signatures',
            value: pending,
            icon: <AccessTimeIcon sx={{ fontSize: 32, color: mainThemeColor }} />,
            change: '',
            changeColor: 'error.main',
          },
          {
            label: 'Active Signers',
            value: uniqueSigners,
            icon: <GroupIcon sx={{ fontSize: 32, color: mainThemeColor }} />,
            change: '',
            changeColor: 'success.main',
          },
        ]);
        setCompletedPending({ completed, pending });
      } catch (err) {
        // handle error
      }
    };

    fetchStats();
  }, []);

  // Quick Actions with navigation for View Analytics
  const quickActions = [
    {
      icon: <AddIcon sx={{ fontSize: 32, color: '#fff' }} />,
      title: 'Create Document',
      desc: 'Start a new document signing process',
      onClick: () => navigate('/digital-signature/request-signature'),
    },
    {
      icon: <CloudUploadIcon sx={{ fontSize: 32, color: mainThemeColor }} />,
      title: 'Upload Documents',
      desc: 'Upload and prepare documents for signing',
      onClick: () => navigate('/digital-signature/request-signature'),
    },
    {
      icon: <BarChartIcon sx={{ fontSize: 32, color: mainThemeColor }} />,
      title: 'View Analytics',
      desc: 'Track your document signing metrics',
      onClick: () => navigate('/digital-signature/analytic-data'),
    },
    {
      icon: <DesignServicesIcon sx={{ fontSize: 32, color: mainThemeColor }} />,
      title: 'Templates',
      desc: 'Use document templates',
      onClick: () => navigate('/digital-signature/templates'),
    },
  ];

  return (
    <Box sx={{ p: { xs: 1, md: 3 }, minHeight: '100vh' }}>
      {/* Page Title */}
      <Typography
        variant="h4"
        sx={{
          fontWeight: 700,
          mb: 3,
          color: '#111827',
          fontSize: { xs: '1.75rem', md: '2.125rem' },
        }}
      >
        Digital Signature Dashboard
      </Typography>

      {/* Stats Row */}
      <StatsRow stats={stats} />

      {/* Main Content Row */}
      <Grid container spacing={2} sx={{ mt: 5 }}>
        {/* Quick Actions */}
        <Grid item xs={12} md={8}>
          <Paper
            elevation={0}
            sx={{ p: 3, borderRadius: 1, mb: 2, border: '1px solid #e5e7eb' }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
              Quick Actions
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Common tasks to get you started
            </Typography>
            <Grid container spacing={2}>
              {quickActions.map((action, idx) => (
                <Grid item xs={12} sm={6} key={idx}>
                  <QuickActionCard
                    icon={action.icon}
                    title={action.title}
                    description={action.desc}
                    descriptionColor={'#111'}
                    color={idx === 0 ? mainThemeColor : lightThemeColor}
                    selected={idx === 0}
                    onClick={action.onClick}
                  />
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
        {/* Recent Envelopes */}
        <Grid item xs={12} md={4}>
          {/* Completion Rate Chart at the bottom */}
          <Box
            sx={{ p: 3, borderRadius: 1, mb: 2, border: '1px solid #e5e7eb' }}
          >
            <CompletionRateChart completed={completedPending.completed} pending={completedPending.pending} />
          </Box>
        </Grid>
      </Grid>
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          borderRadius: 1,
          border: '1px solid #e5e7eb',
        }}
      >
        <AnalyticsData />
      </Paper>
    </Box>
  );
};

export default DigitalDashboard;

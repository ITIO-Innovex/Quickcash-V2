import {Box, Typography, Grid, Paper, useTheme,} from '@mui/material';
import {CircularProgressbarWithChildren, buildStyles,} from 'react-circular-progressbar';
import { ArrowDownward, ArrowUpward, Person } from '@mui/icons-material';
import { DollarSign } from 'lucide-react';
import React, { useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '@/helpers/apiHelper';
import { JwtPayload } from '@/types/jwt';

//Set the API URL based on the environment
const url = import.meta.env.VITE_NODE_ENV === "production" ? "api" : "api";

export default function DashboardStats() {
    const theme = useTheme();
    const [dashboardData, setDashboardData] = React.useState<any>("");//Holds the dashboard data
    // Fetch the dashboard data when the component mounts
        useEffect(() => {
        if (localStorage.getItem("token")) {
            const accountId = jwtDecode<JwtPayload>(
            localStorage.getItem("token") as string
            );
            getDashboardData(accountId.data.id);
        }
        }, []);
    // Function to fetch dashboard data
    const getDashboardData = async (id: any) => {
        try {
            const result = await api.get(`/${url}/v1/admin/revenue/dashboard/${id}`);
            if (result.data.status == "201") {
                setDashboardData(result.data.data);
            }
            } catch (error) {
                console.error("Dashboard fetch error:", error);
            }
        };
    // Define the stats to be displayed
    const stats = [
        {
            label: 'Credit',
            value: dashboardData?.depositTotal? parseFloat(dashboardData?.depositTotal).toFixed(2) : 0,
            percent: dashboardData?.depositTotal > 0? parseFloat(((dashboardData?.depositTotal / (dashboardData?.depositTotal +dashboardData?.debitTotal)) *100).toFixed(2)): 0,
            color: '#2dd4bf',
            icon: <ArrowUpward sx={{ fontSize: 32, color: '#2dd4bf' }} />,
        },
        {
            label: 'Debit',
            value: dashboardData?.debitTotal? parseFloat(dashboardData?.debitTotal).toFixed(2) : 0,
            percent: dashboardData?.debitTotal > 0? parseFloat(((dashboardData?.debitTotal /(dashboardData?.depositTotal +dashboardData?.debitTotal)) *100).toFixed(2)): 0,
            color: '#f97316',
            icon: <ArrowDownward sx={{ fontSize: 32, color: '#f97316' }} />,
        },
        {
            label: 'Investing',
            value: dashboardData?.investingTotal? parseFloat(dashboardData?.investingTotal).toFixed(2) : 0,
            percent: dashboardData?.investingTotal > 0? parseFloat(((dashboardData?.investingTotal /(dashboardData?.investingTotal +dashboardData?.earningTotal)) *100).toFixed(2)): 0,
            color: '#8b5cf6',
            icon: <DollarSign size={32} color="#8b5cf6" />,
        },
        {
            label: 'Earning',
            value: dashboardData?.earningTotal? parseFloat(dashboardData?.earningTotal).toFixed(2) : 0,
            percent: dashboardData?.earningTotal > 0? parseFloat(((dashboardData?.earningTotal /(dashboardData?.investingTotal +dashboardData?.earningTotal)) *100).toFixed(2)): 0,
            color: '#4d7c0f',
            icon: <DollarSign size={32} color="#4d7c0f" />,
        },
    ];
    return (
        <Box className='innerWrapper' sx={{ '& > :not(style)': { mb: 3 } }}>
            <Box className='greeting-text'>
                <Typography
                    variant="body1"
                    sx={{ fontWeight: 'bold', color: 'text.primary', mb: { xs: 1, sm: 0 } }}
                >
                    Welcome, Jean-Pierre!
                </Typography>
                <Typography
                    variant="body2"
                    sx={{ display: 'flex', alignItems: 'center' }}
                >
                    <Person sx={{ width: 16, height: 16, mr: 0.5 }} />
                    You were last logged in on 5 February 2025.
                </Typography>
            </Box>
            <Box sx={{ p: { xs: 2, md: 4 } }}>
                <Grid container spacing={{ xs: 2, sm: 4 }}>
                    {stats.map((stat) => (
                        <Grid key={stat.label} item xs={12} sm={6} md={6} lg={3}>
                            <Paper className='top-charts'sx={{backgroundColor:theme.palette.background.default}}
                                elevation={3}>
                                <Box className='chart-start'>
                                    <CircularProgressbarWithChildren
                                        value={stat.percent}
                                        strokeWidth={10}
                                        styles={buildStyles({
                                            pathColor: stat.color,
                                            trailColor: '#e5e7eb',
                                        })}
                                    >
                                        <Box display="flex" flexDirection="column" alignItems="center" mt={1}>
                                            {stat.icon}
                                            <Typography variant="subtitle2" fontWeight="bold" mt={1}>
                                                {stat.label}
                                            </Typography>
                                            <Typography variant="body2" fontWeight="bold">
                                                ${stat.value.toLocaleString()}
                                            </Typography>
                                        </Box>
                                    </CircularProgressbarWithChildren>
                                </Box>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            </Box>
        </Box>
    );
}

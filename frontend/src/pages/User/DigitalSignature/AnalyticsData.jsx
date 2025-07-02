import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Tab,
  Box,
  Tabs,
  Chip,
  Paper,
  Stack,
  Table,
  Select,
  Avatar,
  Button,
  Divider,
  Tooltip,
  MenuItem,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
  InputBase,
  InputLabel,
  IconButton,
  Typography,
  FormControl,
  LinearProgress,
  TablePagination
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ShareIcon from '@mui/icons-material/Share';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FilterListIcon from '@mui/icons-material/FilterList';
import { API_ROUTES } from '@/pages/User/constant/apiRoutes';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';

import { getBearerToken, getDocumentStatus, getDocumentStatusChip } from '../constant/Utils';
import { Loader, LoaderCircle } from 'lucide-react';
import moment from 'moment';
import { DATE_FORMAT, DATE_FORMAT_WITH_TIME, DOCUMENT_STATUS } from '../constant/const';
import { getDocumentCompletedRedirectionURL, getDocumentViewRedirectionURL } from '@/utils/digitalSignature';
import { DeleteDocumentModal } from './components/DeleteDocumentModal';
import { ShareLinkModal } from '@/pages/User/DigitalSignature/components/ShareLinkModal';

const statusColor = {
  Completed: 'success',
  Pending: 'warning',
  'In Progress': 'info',
  Expired: 'default',
};

const getTabCounts = (envelopes) => ({
  All: envelopes.length,
  Draft: envelopes.filter(e => e.status === 'Draft').length,
  Sent: envelopes.filter(e => e.status === 'Sent').length,
  Completed: envelopes.filter(e => e.status === 'Completed').length,
  Expired: envelopes.filter(e => e.status === 'Expired').length,
});

const tabOrder = ['All', 'Draft', 'Sent', 'Completed',/*  'Expired' */];

const tabStatusMap = {
  0: null,
  1: 'draft',
  2: 'inProgress',
  3: 'completed',
  // 4: 'Expired',
};

const initialModalsValue = {
  delete: { open: false, data: null },
  shareLink: { open: false, data: null }
};

const AnalyticsData = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const defaultTab = tabOrder.indexOf(queryParams.get('tab')) !== -1 ? tabOrder.indexOf(queryParams.get('tab')) : 0;

  const [tab, setTab] = useState(defaultTab);
  const [search, setSearch] = useState("");
  const [data, setData] = useState({
    page: 0,
    limit: 5,
    documents: [],
    totalCount: 0,
    hasMore: false,
    isLoading: true
  });
  const [modals, setModals] = useState(initialModalsValue);

  const handleTabChange = (e, v) => {
    setTab(v);
    setData(prev => ({ ...prev, page: 0, documents: [] }));

    const tabLabel = tabOrder[v];
    queryParams.set('tab', tabLabel);
    navigate({ search: queryParams.toString() }, { replace: true });
  };

  const handleChangePage = (event, newPage) => {
    setData(prev => ({ ...prev, page: newPage }));
  };

  const handleChangeRowsPerPage = (event) => {
    setData(prev => ({
      ...prev,
      page: 0,
      limit: parseInt(event.target.value, 10)
    }));
  };

  const getDocumentProgress = (document) => {
    const signedUsers = document?.AuditTrail?.filter?.((item) => item?.Activity === 'Signed');

    return Math.round((signedUsers?.length / document?.Signers?.length) * 100);
  }

  const getSignerStatusAvatar = (signer, documentDetails) => {
    const details = documentDetails?.AuditTrail?.find(
      (item) => item?.UserDetails?.Email === signer?.Email
    );

    if (details?.Activity === 'Signed') {
      const toolTipText = (
        <>
          <Typography variant="body2">{details?.UserDetails?.Email}</Typography>
          <Typography variant="caption">Status: Signed</Typography>
        </>
      );

      return (
        <Tooltip key={details?.UserDetails?.Email} title={toolTipText} arrow>
          <Avatar sx={{ width: 28, height: 28, fontSize: 14, bgcolor: '#22c55e', color: '#fff', fontWeight: 700 }}>
            {details?.UserDetails?.Email?.[0]?.toUpperCase()}
          </Avatar>
        </Tooltip>
      );
    }

    const hasViewed = documentDetails?.Viewers?.find?.(item => item.signerId === signer._id);
    if (hasViewed && hasViewed?.viewedAt) {
      const toolTipText = (
        <>
          <Typography variant="body2">{signer?.Email}</Typography>
          <Typography variant="caption">Viewed at: {moment(hasViewed.viewedAt).format(DATE_FORMAT_WITH_TIME)}</Typography>
        </>
      );

      return (
        <Tooltip key={signer?.Email} title={toolTipText} arrow>
          <Avatar sx={{ width: 28, height: 28, fontSize: 14, bgcolor: '#0288d1', color: '#fff', fontWeight: 700 }}>
            {signer?.Email?.[0]?.toUpperCase()}
          </Avatar>
        </Tooltip>
      );
    }

    const toolTipText = (
      <>
        <Typography variant="body2">{signer?.Email}</Typography>
        <Typography variant="caption">Status: Pending</Typography>
      </>
    );

    return (
      <Tooltip key={signer?.Email} title={toolTipText} arrow>
        <Avatar sx={{ width: 28, height: 28, fontSize: 14, fontWeight: 700 }}>
          {signer?.Email?.[0]?.toUpperCase()}
        </Avatar>
      </Tooltip>
    );
  };

  const handleOpenModal = (key, documentDetails) => {
    setModals((prev) => ({
      ...initialModalsValue,
      [key]: { open: true, data: documentDetails }
    }))
  }

  const handleCloseModal = (key) => {
    setModals((prev) => ({
      ...initialModalsValue,
      [key]: { open: false, data: null }
    }))
  }

  const getReportListing = async () => {
    if (!data.isLoading) {
      setData((prev) => ({ ...prev, isLoading: true }));
    }

    try {
      const userInfo = JSON.parse(localStorage.getItem('UserInformation'));
      const userId = userInfo?.user;
      if (!userId) {
        throw new Error('User ID not found');
      }

      const { page, limit } = data;
      const payload = {
        limit,
        userid: userId,
        skip: page * limit,
        search: search.trim()
      };
      const headers = { headers: { Authorization: getBearerToken() } };
      const response = await axios.post(API_ROUTES.GET_REPORT_LISTING + `?statusFilter=${tabStatusMap[tab]}&searchQuery=${search}`, payload, headers);

      const { documents, pagination } = response?.data?.data || {};
      setData(prev => ({
        ...prev,
        documents,
        totalCount: pagination.total,
        hasMore: pagination.hasMore,
      }));
    } catch (error) {
      console.error("Failed to fetch reports:", error);
    } finally {
      setData((prev) => ({ ...prev, isLoading: false }));
    }
  };

  useEffect(() => {
    getReportListing();
  }, [data.page, data.limit, tab, search]);

  return (
    <Box sx={{ p: { xs: 2, md: 5 }, minHeight: '100vh' }}>
      <Typography variant="h4" sx={{ fontWeight: 800, color: '#111827', mb: 1 }}>
        Analytic Data
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Manage your document envelopes and track their progress.
      </Typography>

      <Paper elevation={0} sx={{ display: 'flex', alignItems: 'center', p: 1.5, mb: 3, borderRadius: 1, border: '1px solid #e5e7eb' }}>
        <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
        <InputBase
          placeholder="Search by document name, note"
          sx={{ flex: 1, fontSize: 16 }}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </Paper>

      <Tabs value={tab} onChange={handleTabChange} sx={{ mb: 3 }}>
        {tabOrder.map((label) => (
          <Tab
            key={label}
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {label}
                {/* <Chip label={data.totalCount || 0} size="small" sx={{ fontSize: 12, height: 20, bgcolor: '#f3f4f6' }} /> */}
              </Box>
            }
            sx={{ textTransform: 'none', fontWeight: 600, fontSize: 16, minWidth: 120 }}
          />
        ))}
      </Tabs>

      <Paper elevation={0} sx={{ borderRadius: 1, border: '1px solid #e5e7eb', bgcolor: '#fff', width: '100%', overflowX: 'auto' }}>
        <Box sx={{ height: 2 }}>
          {data.isLoading && <LinearProgress />}
        </Box>

        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, width: 400 }}>DOCUMENT</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>STATUS</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>PROGRESS</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>SIGNERS</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>CREATED</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>ACTIONS</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.documents.length === 0 &&
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body2" color="text.secondary" align="center">
                    {data.isLoading && "Still Loading..."}
                    {!data.isLoading && !data.totalCount && "No document found for this tab."}
                  </Typography>
                </TableCell>
              </TableRow>
            }

            {
              data.documents.map((item) => {
                const documentStatus = getDocumentStatus(item);

                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ bgcolor: '#e0e7ff', color: '#3730a3', width: 36, height: 36, fontWeight: 700 }}>
                          <SearchIcon />
                        </Avatar>
                        <Box>
                          <Tooltip title={item?.Name?.length > 40 && item?.Name}>
                            <Typography
                              variant="subtitle2"
                              sx={{
                                maxWidth: 300,
                                fontWeight: 700,
                                overflow: 'hidden',
                                whiteSpace: 'nowrap',
                                textOverflow: 'ellipsis'
                              }}>
                              {item?.Name}
                            </Typography>
                          </Tooltip>

                          <Tooltip title={item?.Note?.length > 40 && item?.Note}>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                fontSize: 13,
                                maxWidth: 300,
                                overflow: 'hidden',
                                whiteSpace: 'nowrap',
                                textOverflow: 'ellipsis'
                              }}>
                              {item?.Note}
                            </Typography>
                          </Tooltip>
                        </Box>
                      </Box>
                    </TableCell>

                    {/* Status */}
                    <TableCell> {getDocumentStatusChip(item)} </TableCell>

                    {/* Progress */}
                    <TableCell>
                      <Box sx={{ minWidth: 90 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LinearProgress variant="determinate" value={getDocumentProgress(item)} sx={{ flex: 1, height: 8, borderRadius: 5, bgcolor: '#f3f4f6', mr: 1 }} />
                          <Typography variant="body2" sx={{ minWidth: 32 }}>{getDocumentProgress(item)}%</Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {item?.AuditTrail?.length || 0}/{item?.Signers?.length || 0} signed
                        </Typography>
                      </Box>
                    </TableCell>
                    {/* Signers */}
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {item?.Signers?.map((signer) => getSignerStatusAvatar(signer, item))}
                      </Box>
                    </TableCell>

                    {/* Created */}
                    <TableCell>
                      <Typography variant="body2">{moment(item.createdAt).format(DATE_FORMAT)}</Typography>
                    </TableCell>

                    {/* Actions */}
                    <TableCell>
                      <Stack direction="row" justifyContent="center">
                        {
                          documentStatus === DOCUMENT_STATUS.draft && (
                            <>
                              <Tooltip title="View Document" arrow>
                                <IconButton size="small" onClick={() => navigate(getDocumentViewRedirectionURL(item))}><VisibilityIcon /></IconButton>
                              </Tooltip>

                              <Tooltip title="Delete" arrow>
                                <IconButton size="small" onClick={() => handleOpenModal('delete', item)}><DeleteIcon /></IconButton>
                              </Tooltip>
                            </>
                          )
                        }

                        {
                          documentStatus === DOCUMENT_STATUS.inProgress && (
                            <>
                              <Tooltip title="Share" arrow>
                                <IconButton title="Share" onClick={() => handleOpenModal('shareLink', item)}>
                                  <ShareIcon />
                                </IconButton>
                              </Tooltip>

                              <Tooltip title="View Document" arrow>
                                <IconButton size="small" onClick={() => navigate(getDocumentCompletedRedirectionURL(item))}>
                                  <VisibilityIcon />
                                </IconButton>
                              </Tooltip>
                            </>
                          )
                        }

                        {
                          documentStatus === DOCUMENT_STATUS.completed && (
                            <>
                              <Tooltip title="View Document" arrow>
                                <IconButton size="small" onClick={() => navigate(getDocumentCompletedRedirectionURL(item))}><VisibilityIcon /></IconButton>
                              </Tooltip>

                              <Tooltip title="View Signed Document">
                                <IconButton onClick={() => window.open(item.SignedUrl, '_blank')}>
                                <PictureAsPdfIcon />
                                  {/* <VisibilityIcon /> */}
                                </IconButton>
                              </Tooltip>

                              <Tooltip title="View Certificate">
                                <IconButton onClick={() => window.open(item.CertificateUrl, '_blank')}>
                                  <WorkspacePremiumIcon />
                                </IconButton>
                              </Tooltip>

                              <Tooltip title="Delete" arrow>
                                <IconButton size="small" onClick={() => handleOpenModal('delete', item)}>
                                  <DeleteIcon />
                                </IconButton>
                              </Tooltip>
                            </>
                          )
                        }

                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })
            }
          </TableBody>
        </Table>

        <TablePagination
          component="div"
          page={data.page}
          count={data.totalCount}
          rowsPerPage={data.limit}
          onPageChange={handleChangePage}
          rowsPerPageOptions={[5, 10, 25]}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      <DeleteDocumentModal
        onDelete={getReportListing}
        openDeleteModal={modals.delete.open}
        documentDetails={modals.delete.data}
        handleCloseDeleteModal={() => handleCloseModal('delete')}
      />

      <ShareLinkModal
        openShareModal={modals.shareLink.open}
        documentDetails={modals.shareLink.data}
        handleCloseShareModal={() => handleCloseModal('shareLink')}
      />
    </Box>
  );
};

export default AnalyticsData; 
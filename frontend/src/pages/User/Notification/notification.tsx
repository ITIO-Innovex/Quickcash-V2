import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import CustomModal from '@/components/CustomModal';
import CustomButton from '@/components/CustomButton';
import { Box, Typography, useTheme } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import GenericTable from '../../../components/common/genericTable';
import { KeyValueDisplay } from '@/components/KeyValueDisplay';
import axios from 'axios';
import moment from 'moment';
import { jwtDecode } from 'jwt-decode';

const url = import.meta.env.VITE_NODE_ENV == "production" ? 'api' : 'api';
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
const UserNotification = forwardRef((props, ref) => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any | null>(null);
  const [list, setList] = useState<any>([]);

  // Fetch user notifications only
  const getListData = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    let user: JwtPayload | null = null;
    try {
      user = jwtDecode<JwtPayload>(token);
    } catch (e) {
      user = null;
    }
    await axios.get(`/${url}/v1/admin/notification/user-all`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(result => {
      if(result.data.status == 201) {
        // Only show notifications for this user or notifyType 'all'
        const filtered = (result?.data?.data || []).filter((item: any) =>
          (item?.user === user?.data?.id) || item?.notifyType === 'all'
        );
        setList(filtered);
      }
    })
    .catch(error => {
      console.log("error", error);
    });
  }

  useEffect(() => {
    getListData();
  }, []);

  const handleActionClick = (row: any) => {
    setSelectedRow(row);
    setOpen(true);
  };
  useImperativeHandle(ref, () => ({
    refreshData: getListData
  }));
  const handleClose = () => {
    setOpen(false);
    setSelectedRow(null);
  };

  const columns = [
    {
      field: 'createdAt',
      headerName: 'Date',
      render: (row: any) => row.createdAt ? moment(row.createdAt).format('YYYY-MM-DD') : '',
    },
    { field: 'title', headerName: 'Message' },
    {
      field: 'notifyType',
      headerName: 'Type',
      render: (row: any) => (
        <span className="type-chip">
          {row.notifyType}
        </span>
      ),
    },
    {
      field: 'action',
      headerName: 'Action',
      render: (row: any) => (
        <VisibilityIcon
          style={{ cursor: 'pointer' }}
          onClick={() => handleActionClick(row)}
        />
      ),
    },
  ];

  return (
    <Box>
      {list && list.length > 0 ? (
        <GenericTable columns={columns} data={list} />
      ) : (
        <Typography variant="body1" sx={{ mt: 2 }}>
          No data found.
        </Typography>
      )}
      {/* Modal */}
      <CustomModal open={open} onClose={handleClose} sx={{ backgroundColor: theme.palette.background.default }} title={''}   >
        {selectedRow && (
          <>
            <Typography className="section-title">Notification Details</Typography>
            <KeyValueDisplay
              data={{
                'Date': selectedRow.createdAt ? moment(selectedRow.createdAt).format('YYYY-MM-DD') : '-',
                'Title': selectedRow.title || '-',
                'Message': selectedRow.message || '-',
                'Message Type': selectedRow.notifyType || '-',
                'Attachment': selectedRow.attachment || 'N/A',
              }}
            />
            <Typography className="section-title">Tags</Typography>
            <KeyValueDisplay
              data={{ 'Tags': selectedRow.tags ? selectedRow.tags.join(', ') : '-' }}/>
            <Box display="flex" justifyContent="flex-end" gap={2} >
              <CustomButton onClick={handleClose}>Close</CustomButton>
            </Box>
          </>
        )}
      </CustomModal>
    </Box>
  );
});

export default UserNotification;

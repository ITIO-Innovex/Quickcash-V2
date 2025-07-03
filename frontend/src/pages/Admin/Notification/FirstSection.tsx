import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import CustomModal from '@/components/CustomModal';
import CustomButton from '@/components/CustomButton';
import { Box, Typography, useTheme } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import GenericTable from '../../../components/common/genericTable';
import { KeyValueDisplay } from '@/components/KeyValueDisplay';
import CustomFormModal from '@/components/CustomFormModal';
import admin from '@/helpers/adminApiHelper';
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
const FirstSection = forwardRef((props, ref) => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any | null>(null);
  const [list, setList] = useState<any>();

  const getListData = async (status: any) => {
    const accountId = jwtDecode<JwtPayload>(localStorage.getItem('admin') as string);
    await admin.get(`/${url}/v1/admin/notification/list/${accountId?.data?.id}`
    )
      .then(result => {
        if (result.data.status == 201) {
          setList(result.data.data);
        }
      })
      .catch(error => {
        console.log("error", error);
      })
  }
  useEffect(() => {
    getListData(status);
  }, [status]);
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
      render: (row: any) => row.createdAt ? row.createdAt.slice(0, 10) : '',
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

    {list ? (
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
                'Date': selectedRow.createdAt ? selectedRow.createdAt.slice(0, 10) : '-',
                'Title': selectedRow.title || '-',
                'Message': selectedRow.message || '-',
                'Message Type': selectedRow.notifyType || '-',
                'Attachment': selectedRow.attachment || 'N/A',
                // 'Read': selectedRow.read !== undefined ? (selectedRow.read ? 'Yes' : 'No') : '-',
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

export default FirstSection;

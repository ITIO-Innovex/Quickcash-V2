import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import CustomModal from '@/components/CustomModal';
import VisibilityIcon from '@mui/icons-material/Visibility';
import GenericTable from '../../../components/common/genericTable';

import CustomButton from '@/components/CustomButton';
import { Box, Button, Typography, useTheme, Tooltip } from '@mui/material';
import admin from '@/helpers/adminApiHelper';
import ReactCountryFlag from 'react-country-flag'; // or 'react-country-flag'
import { showToast } from '@/utils/toastContainer';
import { Delete } from '@mui/icons-material';
const url = import.meta.env.VITE_NODE_ENV == "production" ? 'api' : 'api';

const FirstSection = forwardRef((props, ref) => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any | null>(null);
  const [list, setList] = useState<any>();

  useEffect(() => {
    getListData();
  }, []);

  const getListData = async () => {
    await admin.get(`/${url}/v1/currency/list`)
      .then(result => {
        if (result.data.status == 201) {
          setList(result?.data?.data);
          setCurrentData(result?.data?.data);
        }
      })
      .catch(error => {
        console.log("error", error);
      })
  }
  useImperativeHandle(ref, () => ({
    refreshData: getListData
  }));
  const [currentData, setCurrentData] = useState(list);

  const handleActionClick = (row: any) => {
    setSelectedRow(row);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedRow(null);
  };

  const deleteCurrencyFromRecord = async (val: any, baseCode: any) => {
    var sureDelete = confirm("Are you sure to delete currency");
    if (sureDelete == true) {
      await admin.post(`/${url}/v1/currency/delete/${val}`, {
        "base_code": baseCode
      },)
        .then(result => {
          if (result.data.status == 201) {
            getListData();
            showToast(result?.data?.message, "success");
          }
        })
        .catch(error => {
          console.log("error", error);
          showToast(error?.response?.data?.message, "error");
        })
    }
  }
  const handleChange = async (id: string, isDefault: boolean) => {
    try {
      const result = await admin.patch(`/${url}/v1/currency/update/${id}`, {
        isDefault,
      });

      if (result.data.status === 201) {
        showToast(result.data.message, "success");
        getListData();
      }
    } catch (error) {
      console.log("error", error);
      showToast(error.response?.data?.message || "Something went wrong", "error");
    }
  };


  const columns = [
    {
      field: 'createdAt',
      headerName: 'Date',
      render: (row: any) => row.createdAt ? row.createdAt.slice(0, 10) : '',
    },
    {
      field: 'base_code',
      headerName: 'Currency',
      render: (row: any) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ReactCountryFlag
            countryCode={row?.base_code?.slice(0, 2).toUpperCase()}
            svg
            style={{
              width: '2em',
              height: '2em',
              borderRadius: '50%',
            }}
            cdnUrl="https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.4.3/flags/1x1/"
            cdnSuffix="svg"
            title={row?.base_code?.slice(0, 2).toUpperCase()}
          />
          <span >
            {row?.base_code?.toUpperCase() || 'N/A'}
          </span>
        </div>
      ),
    },

    {
      field: 'defaultc',
      headerName: 'Default',
      render: (row: any) => (
        <label className="switch">
          <input
            type="checkbox"
            checked={row.defaultc}
            onChange={(e) => handleChange(row._id, e.target.checked)}
          />
          <span className="slider"></span>
        </label>
      )
    },
    {
      field: 'action',
      headerName: 'Action',
      render: (row: any) => (
        <div style={{ display: 'flex', gap: '10px' }}>
          <Tooltip title="View Details">
            <VisibilityIcon className="action-icon" onClick={() => handleActionClick(row)} />
          </Tooltip>
          <Delete
            style={{ cursor: 'pointer', color: 'red' }}
            onClick={() => deleteCurrencyFromRecord(row._id, row.base_code)}
          />

        </div>

      )
    }
  ];

  return (
    <Box>

      {currentData ? (
        <GenericTable columns={columns} data={currentData} />
      ) : (
        <Typography variant="body1" sx={{ mt: 2 }}>
          No data found.
        </Typography>
      )}

      <CustomModal
        open={open}
        onClose={handleClose}
        title="Statement Details"
        sx={{ backgroundColor: theme.palette.background.default }}
      >
        <div className="header-divider" />

        <Box sx={{ mt: 2 }}>
          <Box display="flex" justifyContent="space-between" mb={2}>
            <Typography><strong>Date:</strong></Typography>
            <Typography>{selectedRow?.createdAt.slice(0, 10)}</Typography>
          </Box>

          <Box display="flex" justifyContent="space-between" mb={2}>
            <Typography><strong>Currency:</strong></Typography>
            <Typography>{selectedRow?.base_code}</Typography>
          </Box>

          <Box display="flex" justifyContent="space-between" mb={2}>
            <Typography><strong>Default:</strong></Typography>
            <Typography>
              {selectedRow?.defaultc ? '✅ Yes' : '❌ No'}
            </Typography>
          </Box>

          <Box display="flex" justifyContent="flex-end" gap={2} >
          <CustomButton onClick={handleClose}>Close</CustomButton>
          </Box>
        </Box>
      </CustomModal>
    </Box>
  );
});

export default FirstSection;

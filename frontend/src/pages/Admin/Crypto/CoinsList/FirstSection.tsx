import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import CustomModal from '@/components/CustomModal';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { FileSpreadsheet, FileText } from 'lucide-react';
import GenericTable from '../../../../components/common/genericTable';
import { Box, Button, Typography, useTheme } from '@mui/material';
import CustomButton from '@/components/CustomButton';
import admin from '@/helpers/adminApiHelper';
import { useAppToast } from '@/utils/toast'; 
import { Delete } from '@mui/icons-material';
const url = import.meta.env.VITE_NODE_ENV == "production" ? 'api' : 'api';
interface Coin {
  id: string;
  assetId?: string;
  type?: string;
  coin: string;
  name: string;
  network: string;
  logo?: string;
  _id?: string;
  logoName: string;
  isDefault?: boolean;
}
const FirstSection = forwardRef((props, ref) => {
  const theme = useTheme();
  const toast = useAppToast(); 
  const [open, setOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any | null>(null);
  const [coinsAPI2, setCoinsAPI2] = useState<Coin[]>([]);
  // Fetch coins from API 2 (for table)
  const fetchCoinsFromDB = async () => {
    try {
      const token = localStorage.getItem("admin");
      if (!token) return;
      const response = await admin.get(
        `/${url}/v1/admin/coin`,
      );

      if (response.data.success && Array.isArray(response.data.data)) {
        setCoinsAPI2(response.data.data);
        setCurrentData(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching coins from API 2:", error);
    }
  };
  useEffect(() => {
    fetchCoinsFromDB();
  }, []);
  const [currentData, setCurrentData] = useState<Coin[]>([]);
  const handleActionClick = (row: any) => {
    setSelectedRow(row);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedRow(null);
  };
  const handleChange = async (_event: React.ChangeEvent<HTMLInputElement>, coinId?: string) => {
    const path = `/${url}/v1/admin/coin/set-default/${coinId}`;

    if (!coinId) {
      console.warn(" Coin ID is missing!");
      return;
    }
    try {
      const result = await admin.patch(path, {});

      if (result.data.success) {
        toast.success(result.data.message);

        setCoinsAPI2(prevCoins =>
          prevCoins.map(coin => ({
            ...coin,
            isDefault: coin._id === coinId
          }))
        );

        setCurrentData(prevData =>
          prevData.map(coin => ({
            ...coin,
            isDefault: coin._id === coinId
          }))
        );
      }

    } catch (error: any) {
      console.log("error", error);
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };
  useImperativeHandle(ref, () => ({
    refreshData: fetchCoinsFromDB
  }));
  const deleteCoin = async (coinId: string) => {
    if (!window.confirm("Are you sure you want to delete this coin?")) return;

    try {
      const response = await admin.delete(
        `/${url}/v1/admin/coin/delete/${coinId}`
      );

      if (response.data.success) {
        alert("Coin deleted successfully!"); // Alert on successful deletion
        fetchCoinsFromDB(); // Refresh the list after deletion
        setCoinsAPI2((prevCoins) => prevCoins.filter((coin) => coin._id !== coinId));
      } else {
        alert("Failed to delete the coin.");
      }
    } catch (error) {
      console.error("Error deleting coin:", error);
      alert("Something went wrong while deleting the coin.");
    }
  };
  const columns = [
    {
      field: 'coin',
      headerName: 'Coin',
      render: (row: any) => (
        <Box display="flex" alignItems="center" gap={1}>
          <img
            src={`https://assets.coincap.io/assets/icons/${row.coin.toLowerCase()}@2x.png`}
            alt={row.coin}
            width={20}
            height={20}
            style={{ objectFit: 'contain' }}
            onError={(e) => (e.currentTarget.style.display = 'none')}
          />
          <span>{row.coin}</span>
        </Box>
      )
    },
    { field: 'name', headerName: 'Name' },
    { field: 'logoName', headerName: 'Coin Name' },
    { field: 'network', headerName: 'Network' },
    {
      field: 'isDefault',
      headerName: 'Default',
      render: (row: any) => (
        <label className="switch">
          <input
            type="checkbox"
            checked={row.isDefault}
            onChange={(e) => handleChange(e, row?._id)}
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
          <VisibilityIcon
            className="action-icon"
            onClick={() => handleActionClick(row)}
            style={{ cursor: 'pointer' }}
          />
          <Delete
            style={{ cursor: 'pointer', color: 'red' }}
            onClick={() => deleteCoin(row._id!)} // Corrected: use row._id instead of coin._id
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
      <CustomModal open={open} onClose={handleClose} title="Coin Details" sx={{ backgroundColor: theme.palette.background.default }}>
        <div className="header-divider" />
        <Box sx={{ mt: 2 }}>
          {selectedRow && (
            <>
              <Box display="flex" justifyContent="space-between" mb={2}>
                <Typography><strong>Coin:</strong></Typography>
                <Typography>{selectedRow.coin}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" mb={2}>
                <Typography><strong>Name:</strong></Typography>
                <Typography>{selectedRow.name}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" mb={2}>
                <Typography><strong>Network:</strong></Typography>
                <Typography>{selectedRow.network}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" mb={2}>
                <Typography><strong>Default:</strong></Typography>
                <Typography>{selectedRow.isDefault ? 'Yes' : 'No'}</Typography>
              </Box>

            </>
          )}

          <Box display="flex" justifyContent="flex-end" gap={2} >
          <CustomButton onClick={handleClose}>Close</CustomButton>
          </Box>
        </Box>
      </CustomModal>
    </Box>
  );
});

export default FirstSection;

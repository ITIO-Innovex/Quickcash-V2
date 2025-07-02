import React, { useEffect, useState } from 'react';
import {
  Card,
  Typography,
  FormControl,
  Select,
  MenuItem,
  Box,
  Chip,
  IconButton,
  useTheme
} from '@mui/material';
import axios from 'axios';
import EditCardForm from './EditForm';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-toastify';
import { Delete, Edit } from '@mui/icons-material';
import CustomModal from '@/components/CustomModal';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import GenericTable from '@/components/common/genericTable';
import api from '@/helpers/apiHelper';

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
const CardList = () => {
  const theme = useTheme();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [cardData, setCardData] = useState([]);

  const url = import.meta.env.VITE_NODE_ENV == "production" ? "api" : "api";

  const getDecodedToken = () => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
      return jwtDecode(token);
    } catch (e) {
      toast.error("Invalid token");
      return null;
    }
  };

  const getCardsList = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return toast.error("No token found");

      const decoded = jwtDecode<JwtPayload>(token);
      const accountId = decoded.data.id;

      const res = await api.get(`/${url}/v1/card/list/${accountId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("Fetched cards:", res.data.data); // <-- DEBUG
      if (res.data.status === 201) {
        setCardData(res.data.data);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to fetch card list");
    }
  };

  const getCardDetails = async (id) => {
    try {
      const res = await api.get(`/${url}/v1/card/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      if (res.data.status === 201) {
        const card = res.data.data;
        console.log(card, 'card')
        setSelectedCard({
          id: card._id,
          createdDate: card.createdAt,
          name: card.name,
          cardNumber: card.cardNumber,
          currency: card.currency || "USD",
          cvv: card.cvv,
          expiryDate: card.expiry,
          status: card.status ? 'ACTIVE' : 'INACTIVE',

        });
        setModalOpen(true);
      } else {
        toast.error("Card not found");
      }
    } catch (error) {
      console.log("error", error);
      toast.error("Failed to fetch card details");
    }
  };

  const deleteCard = async (id) => {
    if (!confirm("Want to delete?")) return;
    try {
      const res = await api.delete(`/${url}/v1/card/delete/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      if (res.data.status === 201) {
        toast.success("Card deleted successfully");
        getCardsList();
      } else {
        toast.error("Failed to delete");
      }
    } catch (error) {
      console.log("error", error);
      toast.error(error.response?.data?.message || "Delete failed");
    }
  };

  const handleSave = async (updatedCard) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("No token found");
      return;
    }

    let decoded: JwtPayload;
    try {
      decoded = jwtDecode<JwtPayload>(token);
    } catch (error) {
      toast.error("Invalid token");
      return;
    }

    try {
      const res = await api.patch(
        `/${url}/v1/card/update/${updatedCard.id}`,
        {
          name: updatedCard.name,
          card_id: updatedCard.id,
          user: decoded.data.id,
          cardnumber: updatedCard.cardNumber,
          expiry: updatedCard.expiryDate,
          cvv: updatedCard.cvv,
          status: updatedCard.status === 'ACTIVE',
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (res.data.status === 201) {
        toast.success(res.data.message);
        setModalOpen(false);
        getCardsList();
      } else {
        toast.error("Failed to update card");
      }
    } catch (error) {
      console.error("error", error);
      toast.error(error.response?.data?.message || "Update failed");
    }
  };


  useEffect(() => {
    getCardsList();
  }, []);

  const getCurrencyColor = (currency) => {
    const map = {
      INR: 'primary',
      GBP: 'success',
      USD: 'secondary',
      AUD: 'warning',
      EUR: 'error'
    };
    return map[currency] || 'primary';
  };

  const formatCardNumber = (cardNumber) =>
    cardNumber.replace(/(.{4})/g, '$1 ').trim();

  const columns = [
    { id: 'createdDate', label: 'Created Date' },
    { id: 'name', label: 'Name' },
    { id: 'cardNumber', label: 'Card Number' },
    { id: 'currency', label: 'Currency' },
    { id: 'cvv', label: 'CVV' },
    { id: 'expiryDate', label: 'Expiry Date' },
    { id: 'status', label: 'Status' },
    { id: 'action', label: 'Action', align: 'center' as 'center' }
  ];

  const transformedColumns = columns.map((col) => {
    if (col.id === 'status') {
      return {
        field: col.id,
        headerName: col.label,
        render: (row: any) => {
          const statusText = row.status ? 'Active' : 'Inactive';
          const statusClass = row.status ? 'active' : 'inactive';

          return (
            <span className={`status-chip ${statusClass}`}>
              {statusText}
            </span>
          );
        }
      };
    }

    if (col.id === 'action') {
      return {
        field: col.id,
        headerName: col.label,
        align: 'center',
        render: (row: any) => (
          <Box display="flex" gap={1}>
            <VisibilityIcon fontSize="small" sx={{ cursor: 'pointer' }} onClick={() => getCardDetails(row.action)} />
            <DeleteIcon fontSize="small" sx={{ cursor: 'pointer' }} onClick={() => deleteCard(row.action)} />
          </Box>
        )
      };
    }

    return {
      field: col.id,
      headerName: col.label,
    };
  });


  const rows = cardData.map(card => ({
    id: card._id, // important for keys & actions
    createdDate: new Date(card.createdAt).toLocaleDateString(),
    name: card.name,
    cardNumber: (
      <Typography fontFamily="monospace">
        {formatCardNumber(card.cardNumber)}
      </Typography>
    ),
    currency: (
      <Chip label={card.currency || 'USD'} color={getCurrencyColor(card.currency)} />
    ),
    cvv: card.cvv,
    expiryDate: card.expiry,
    // status: (
    //   <Chip label={card.status ? 'Active' : 'Inactive'} color={card.status ? 'success' : 'default'} />
    // ),
    // action: (
    //   <Box display="flex" gap={1}>
    //     <IconButton size="small" onClick={() => getCardDetails(card._id)}>
    //       <Edit fontSize="small" />
    //     </IconButton>
    //     <IconButton size="small" onClick={() => deleteCard(card._id)}>
    //       <Delete fontSize="small" />
    //     </IconButton>
    //   </Box>
    // )
    status: card.status,
    action: card._id
  }));
  useEffect(() => {
    console.log("Updated cardData:", cardData);
  }, [cardData]);

  return (
    <Box sx={{ padding: 3 }} style={{ backgroundColor: theme.palette.background.default }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Card List</Typography>
        <Box display="flex" alignItems="center" gap={2}>
          <Typography variant="body2">Rows per page:</Typography>
          <FormControl size="small">
            <Select
              value={rowsPerPage.toString()} // ✅ convert to string
              onChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10)); // still parse as number
                setPage(0);
              }}
            >

              {[5, 10, 20].map((count) => (
                <MenuItem key={count} value={count}>
                  {count}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Typography variant="body2">
            {`${page * rowsPerPage + 1}–${Math.min((page + 1) * rowsPerPage, rows.length)} of ${rows.length}`}
          </Typography>
        </Box>
      </Box>

      {/* <CustomTable
        columns={columns}
        rows={rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={(_, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
      /> */}
      <GenericTable
        columns={transformedColumns}
        data={rows}
      />


      {isModalOpen && selectedCard && (
        <CustomModal
          open={isModalOpen}
          onClose={() => setModalOpen(false)}
          title="Edit Card"
          sx={{ backgroundColor: theme.palette.background.default }}
        >
          <EditCardForm
            card={selectedCard}
            onClose={() => setModalOpen(false)}
            onSave={handleSave}
          />
        </CustomModal>
      )}
    </Box>
  );
};

export default CardList;

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
import { useAppToast } from '@/utils/toast'; 
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
const CardList = ({ cardList = [], onRefresh, loading }) => {
  const theme = useTheme();
  const toast = useAppToast(); 
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  // Remove cardData state and fetching logic
  // Use cardList prop directly

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

  // Add normalization function
  const normalizeCard = (card) => ({
    ...card,
    cardNumber: card.cardNumber || card.cardnumber || '',
    cardType: card.cardType || card.type || '',
    expiry: card.expiry,
    id: card._id || card.card_id || '',
  });

  const getCardDetails = async (id) => {
    try {
      const res = await api.get(`/${url}/v1/card/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      if (res.data.status === 201) {
        const card = res.data.data;
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
        onRefresh(); // Call onRefresh to refresh the parent's list
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
        onRefresh(); // Call onRefresh to refresh the parent's list
      } else {
        toast.error("Failed to update card");
      }
    } catch (error) {
      console.error("error", error);
      toast.error(error.response?.data?.message || "Update failed");
    }
  };


  // Remove getCardsList and useEffect for fetching

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

  const formatCardNumber = (cardNumber, showFull = false) => {
    if (!cardNumber) return '';
    if (showFull) {
      return cardNumber.replace(/(.{4})/g, '$1 ').trim();
    }
    // Mask all but last 4 digits
    const digitsOnly = cardNumber.replace(/\D/g, '');
    const maskedSection = '*'.repeat(digitsOnly.length - 4);
    const visibleSection = digitsOnly.slice(-4);
    const combined = maskedSection + visibleSection;
    return combined.replace(/(.{4})/g, '$1 ').trim();
  };

  const columns = [
    { id: 'createdDate', label: 'Created Date' },
    { id: 'name', label: 'Name' },
    { id: 'cardNumber', label: 'Card Number' },
    { id: 'currency', label: 'Currency' },
    // { id: 'cvv', label: 'CVV' },
    // { id: 'expiryDate', label: 'Expiry Date' },
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


  const rows = cardList.map((card, idx) => ({
    id: card._id || card.card_id || card.id, // support all possible ids
    createdDate: new Date(card.createdAt).toLocaleDateString(),
    name: card.name,
    cardNumber: (
      <Typography
        fontFamily="monospace"
        onMouseEnter={() => setHoveredRow(idx)}
        onMouseLeave={() => setHoveredRow(null)}
        sx={{ cursor: 'pointer', userSelect: 'none' }}
      >
        {formatCardNumber(card.cardNumber || card.cardnumber, hoveredRow === idx)}
      </Typography>
    ),
    currency: (
      <Chip label={card.currency || 'USD'} color={getCurrencyColor(card.currency)} />
    ),
    cvv: card.cvv,
    expiryDate: card.expiry,
    status: card.status,
    action: card._id || card.card_id || card.id
  }));
 

  return (
    <Box sx={{ padding: 3 }} style={{ backgroundColor: theme.palette.background.default }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Card List</Typography>
       
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

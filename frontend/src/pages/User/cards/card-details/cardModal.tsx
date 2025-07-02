import { CreditCard, Plus } from 'lucide-react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Typography,
  Box,
  Stack
} from '@mui/material';

interface CardModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'add' | 'get-virtual' | 'get-physical';
}

const CardModal = ({ isOpen, onClose, type }: CardModalProps) => {
  const getModalContent = () => {
    switch (type) {
      case 'add':
        return {
          title: 'Add New Card',
          description: 'Choose the type of card you want to add to your account.',
          icon: <Plus size={32} color="#9333ea" />, // Purple
          actions: (
            <Stack spacing={2}>
              <Button
                variant="contained"
                fullWidth
                sx={{ backgroundColor: '#2563eb', '&:hover': { backgroundColor: '#1d4ed8' } }}
              >
                Add Virtual Card
              </Button>
              <Button
                variant="contained"
                fullWidth
                sx={{ backgroundColor: '#9333ea', '&:hover': { backgroundColor: '#7e22ce' } }}
              >
                Add Physical Card
              </Button>
            </Stack>
          )
        };
      case 'get-virtual':
        return {
          title: 'Get Virtual Card',
          description: 'Your virtual card will be ready instantly for online payments and transactions.',
          icon: <CreditCard size={32} color="#2563eb" />, // Blue
          actions: (
            <Stack spacing={2}>
              <Button
                variant="contained"
                fullWidth
                sx={{ backgroundColor: '#2563eb', '&:hover': { backgroundColor: '#1d4ed8' } }}
              >
                Create Virtual Card
              </Button>
              <Button variant="outlined" fullWidth onClick={onClose}>
                Cancel
              </Button>
            </Stack>
          )
        };
      case 'get-physical':
        return {
          title: 'Get Physical Card',
          description: 'Your physical card will be delivered to your address within 3-5 business days.',
          icon: <CreditCard size={32} color="#9333ea" />, // Purple
          actions: (
            <Stack spacing={2}>
              <Button
                variant="contained"
                fullWidth
                sx={{ backgroundColor: '#9333ea', '&:hover': { backgroundColor: '#7e22ce' } }}
              >
                Order Physical Card
              </Button>
              <Button variant="outlined" fullWidth onClick={onClose}>
                Cancel
              </Button>
            </Stack>
          )
        };
      default:
        return null;
    }
  };

  const content = getModalContent();
  if (!content) return null;

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogContent>
        <Box display="flex" justifyContent="center" mb={2}>
          {content.icon}
        </Box>
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 600, fontSize: '1.25rem' }}>
          {content.title}
        </DialogTitle>
        <Typography
          variant="body2"
          color="text.secondary"
          textAlign="center"
          mb={3}
          sx={{ px: 2 }}
        >
          {content.description}
        </Typography>
        {content.actions}
      </DialogContent>
    </Dialog>
  );
};

export default CardModal;

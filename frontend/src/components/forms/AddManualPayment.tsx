import React, { useState } from 'react';
import { Box, TextField, Typography, MenuItem, IconButton } from '@mui/material';
import CustomButton from '../CustomButton';
import { Refresh } from '@mui/icons-material';
import CustomTextField from '../CustomTextField';

interface AddManualPaymentProps {
  onSave: (data: {
    invoiceNo: string;
    dueAmount: string;
    paidAmount: string;
    paymentDate: string;
    amount: string;
    paymentMode: string;
    notes: string;
  }) => void;
  onCancel: () => void;
}

const AddManualPayment: React.FC<AddManualPaymentProps> = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    invoiceNo: '',
    dueAmount: '',
    paidAmount: '',
    paymentDate: '',
    amount: '',
    paymentMode: '',
    notes: ''
  });

  const categories = ['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports'];

  const generateDueAmount = () => {
    const code = Math.random().toString(36).substring(2, 15).toUpperCase();
    setFormData(prev => ({ ...prev, dueAmount: code }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.invoiceNo.trim() && formData.dueAmount && formData.paidAmount) {
      onSave(formData);
      setFormData({
        invoiceNo: '',
        dueAmount: '',
        paidAmount: '',
        paymentDate: '',
        amount: '',
        paymentMode: '',
        notes: ''
      });
    }
  };

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const isFormValid = formData.invoiceNo.trim() && formData.dueAmount && formData.paidAmount;

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, mb: 3 }}>
        <Box>
          {/* <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
            Invoice No <span style={{ color: 'red' }}>*</span>
          </Typography> */}
          <CustomTextField
          label="Invoice No"
            fullWidth
            value={formData.invoiceNo}
            onChange={handleChange('invoiceNo')}
            placeholder="Invoice No"
            required
            variant="outlined"
          />
        </Box>

        <Box>
          <CustomTextField
          label="Due Amount"
            fullWidth
            value={formData.dueAmount}
            onChange={handleChange('dueAmount')}
            placeholder="Due amount"
            variant="outlined"
          />
        </Box>

        <Box>
         <CustomTextField
          label="Paid Amount"
            fullWidth
            select
            value={formData.paidAmount}
            onChange={handleChange('paidAmount')}
            variant="outlined"
            required
          >
            {categories.map((category) => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </CustomTextField>
        </Box>

        <Box>

        <CustomTextField
          label="Payment Amount"
            fullWidth
            type="text"
            value={formData.paymentDate}
            onChange={handleChange('paymentDate')}
            placeholder="YYYY-MM-DD"
            required
            variant="outlined"
          />
        </Box>

        <Box>
          <CustomTextField
          label="Amount"
            fullWidth
            type="number"
            value={formData.amount}
            onChange={handleChange('amount')}
            placeholder="Amount"
            required
            variant="outlined"
          />
        </Box>

        <Box>
          <CustomTextField
          label="Payment Mode"
            fullWidth
            type="text"
            value={formData.paymentMode}
            onChange={handleChange('paymentMode')}
            placeholder="Payment Mode"
            required
            variant="outlined"
          />
        </Box>
      </Box>

      <Box sx={{ mb: 3 }}>
        <CustomTextField
          label="Motes"
          fullWidth
          multiline
          rows={4}
          value={formData.notes}
          onChange={handleChange('notes')}
          placeholder="Write any additional information..."
          variant="outlined"
        />
      </Box>

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <CustomButton
          variant="contained"
          onClick={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent)}
          disabled={!isFormValid}
        >
          SAVE
        </CustomButton>
        <CustomButton
          variant="outlined"
          onClick={onCancel}
          sx={{
            backgroundColor: 'black',
            color: 'white',
            borderColor: 'black',
            '&:hover': {
              backgroundColor: '#333',
              borderColor: '#333',
            },
          }}
        >
          DISCARD
        </CustomButton>
      </Box>
    </Box>
  );
};

export default AddManualPayment;

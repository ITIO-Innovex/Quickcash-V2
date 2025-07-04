
import React, { useEffect, useState } from 'react';
import ReactQuill from 'react-quill-new';
import 'quill/dist/quill.snow.css';
import {
  Box,
  FormControlLabel,
  FormLabel,
  Grid,
  Radio,
  RadioGroup,
  useTheme,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import PageHeader from '@/components/common/pageHeader';
import CustomInput from '@/components/CustomInputField';
import CustomButton from '@/components/CustomButton';
import CustomSelect from '@/components/CustomDropdown';
import { toast } from 'react-toastify';

const AddQuote = () => {
  const theme = useTheme();
  const [note, setNote] = useState('');
  const [terms, setTerms] = useState('');
  const [quoteData, setquoteData] = useState({
    invoice_number: 'INV1234',
    invoice_date: '2025-07-04',
    due_date: '2025-07-14',
    status: 'Draft',
    currency_text: '$',
    currency: 'USD',
    payment_qr_code: 'xyz123',
  });
  const [receiverType, setReceiverType] = useState('member');
  const [isRecurring, setIsRecurring] = useState('no');
  const [recurringCycle, setRecurringCycle] = useState('');
  const [showNotesTerms, setShowNotesTerms] = useState(true);
  const [receiverDetails, setReceiverDetails] = useState({ name: '', email: '', address: '' });
  const [discountType, setDiscountType] = useState('Fixed');
  const [discountValue, setDiscountValue] = useState(0);
  const [selectedTax, setSelectedTax] = useState({ name: 'Ganesh', rate: 35 });
  const taxOptions = [
    { name: 'Ganesh', rate: 35 },
    { name: 'GST', rate: 18 },
    { name: 'No Tax', rate: 0 },
  ];

  const [items, setItems] = useState([
    { id: 1, product: '', qty: '', unitPrice: '', amount: '', isAdded: false },
  ]);

  const subtotal = items.filter(i => i.isAdded).reduce((sum, i) => sum + parseFloat(i.amount || '0'), 0);
  const discountAmount = discountType === 'Fixed' ? discountValue : (subtotal * discountValue) / 100;
  const taxAmount = ((subtotal - discountAmount) * selectedTax.rate) / 100;
  const total = subtotal - discountAmount + taxAmount;

  const handleAddRow = () => {
    const updated = [...items];
    const lastItem = updated[updated.length - 1];

    if (!lastItem.product.trim() || !lastItem.qty || !lastItem.unitPrice) {
      toast.error('Please fill in all fields before adding.');
      return;
    }

    lastItem.isAdded = true;
    updated.push({ id: Date.now(), product: '', qty: '', unitPrice: '', amount: '', isAdded: false });
    setItems(updated);
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;

    if (field === 'qty' || field === 'unitPrice') {
      const qty = parseFloat(updated[index].qty) || 0;
      const price = parseFloat(updated[index].unitPrice) || 0;
      updated[index].amount = (qty * price).toFixed(2);
    }
    setItems(updated);
  };

  const handleDeleteRow = (id) => {
    if (items.length <= 1) return;
    const updatedItems = items.filter(item => item.id !== id);
    setItems(updatedItems);
  };

  return (
    <Box className="dashboard-container" sx={{ p: 3 }}>
      <PageHeader title={`Add Quote`} />
      <Grid container spacing={2} mt={2}>
        <Grid item xs={12} md={6}><CustomInput label="Quote #" value={quoteData.invoice_number} disabled /></Grid>
        <Grid item xs={12} md={6}>
          <FormLabel sx={{ fontWeight: 600, color: '#483594' }}>Select Type</FormLabel>
          <RadioGroup row value={receiverType} onChange={(e) => setReceiverType(e.target.value)}>
            <FormControlLabel value="member" control={<Radio />} label="Member" />
            <FormControlLabel value="other" control={<Radio />} label="Other" />
          </RadioGroup>
        </Grid>
        {receiverType === 'other' && (
          <>
            <Grid item xs={12} md={6}><CustomInput label="Receiver Name" value={receiverDetails.name} onChange={(e) => setReceiverDetails({ ...receiverDetails, name: e.target.value })} /></Grid>
            <Grid item xs={12} md={6}><CustomInput label="Receiver Email" value={receiverDetails.email} onChange={(e) => setReceiverDetails({ ...receiverDetails, email: e.target.value })} /></Grid>
            <Grid item xs={12} md={6}><CustomInput label="Receiver Address" value={receiverDetails.address} onChange={(e) => setReceiverDetails({ ...receiverDetails, address: e.target.value })} /></Grid>
          </>
        )}
        <Grid item xs={12} md={6}><CustomInput label="Select Member" value={quoteData.invoice_date}/></Grid>
        <Grid item xs={12} md={6}><CustomInput label="Quote Date" type="date" value={quoteData.due_date}  /></Grid>
        <Grid item xs={12} md={6}><CustomInput label="Due Date" type="date" value={quoteData.due_date} /></Grid>
        <Grid item xs={12} md={6}><CustomInput label="Invoice Template" value={quoteData.status} disabled /></Grid>
        {/* <Grid item xs={12} md={6}><CustomInput label="Payment QR Code" value={quoteData.payment_qr_code} disabled /></Grid> */}
       <Grid item xs={12} md={6}>
            <CustomSelect
                label="Currency"
                value={quoteData.currency || ''}
                onChange={(e) =>
                  setquoteData({
                    ...quoteData,
                    status: (e.target as HTMLSelectElement).value,
                  })
                }
                options={[
                  { label: 'USD', value: 'a' },
                  { label: 'INR', value: 'b' },
                  { label: 'EUR', value: 'c' },
                  { label: 'CAN', value: 'd' },
                ]}
              />
                </Grid>

      </Grid>

        <Grid item xs={12}>
                  <Grid container spacing={2}
                    sx={{ fontWeight: 'bold', pb: 2, mt: 4, backgroundColor: '#483594', color: theme.palette.text.primary,}} >
      
                    <Grid item xs={1}> # </Grid>
      
                    <Grid item xs={3}> Product </Grid>
      
                    <Grid item xs={2}> Qty </Grid>
      
                    <Grid item xs={2}>Unit Price </Grid>
      
                    <Grid item xs={2}> Amount</Grid>
      
                    <Grid item xs={2}>Action </Grid>
      
                  </Grid>
                </Grid>

      <Grid container spacing={2} mt={4}>
        {items.map((item, index) => (
          <Grid item xs={12} key={item.id}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={1}>{index + 1}</Grid>
              <Grid item xs={3}>{item.isAdded ? <span>{item.product}</span> : <CustomInput value={item.product} onChange={(e) => handleItemChange(index, 'product', e.target.value)} />}</Grid>
              <Grid item xs={2}>{item.isAdded ? <span>{item.qty}</span> : <CustomInput type="number" value={item.qty} onChange={(e) => handleItemChange(index, 'qty', e.target.value)} />}</Grid>
              <Grid item xs={2}>{item.isAdded ? <span>{item.unitPrice}</span> : <CustomInput type="number" value={item.unitPrice} onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)} />}</Grid>
              <Grid item xs={2}><span>{item.amount}</span></Grid>
              <Grid item xs={2}>{index !== 0 && <DeleteIcon sx={{ cursor: 'pointer', color: '#FF0000' }} onClick={() => handleDeleteRow(item.id)} />}</Grid>
            </Grid>
          </Grid>
        ))}
        <Grid item xs={12} display="flex" justifyContent="flex-end"><CustomButton onClick={handleAddRow}>ADD</CustomButton></Grid>
      </Grid>

      <Grid container spacing={2} mt={4}>
        <Grid item xs={12} md={6}>
          <Box display="flex" gap={2} mb={2}>
            <CustomInput label="Discount" type="number" value={discountValue} onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)} />
            <select value={discountType} onChange={(e) => setDiscountType(e.target.value)} style={{ padding: '12px', border: '1px solid #ccc', borderRadius: '6px' }}>
              <option value="Fixed">Fixed</option>
              <option value="Percentage">Percentage</option>
            </select>
          </Box>
          <select value={selectedTax.name} onChange={(e) => {
            const tax = taxOptions.find(t => t.name === e.target.value);
            if (tax) setSelectedTax(tax);
          }} style={{ padding: '12px', width: '100%', borderRadius: '6px', border: '1px solid #ccc' }}>
            {taxOptions.map(tax => <option key={tax.name} value={tax.name}>{tax.name} - {tax.rate}</option>)}
          </select>
        </Grid>

        <Grid item xs={12} md={6}>
          <Box display="flex" flexDirection="column" gap={1}>
            <Box display="flex" justifyContent="space-between"><span>Sub Total:</span><span>${subtotal.toFixed(2)}</span></Box>
            <Box display="flex" justifyContent="space-between"><span>Discount:</span><span>${discountAmount.toFixed(2)}</span></Box>
            <Box display="flex" justifyContent="space-between"><span>Tax:</span><span>${taxAmount.toFixed(2)}</span></Box>
            <Box display="flex" justifyContent="space-between" fontWeight="bold"><span>Total:</span><span>${total.toFixed(2)}</span></Box>
          </Box>
        </Grid>
      </Grid>

      <Box mt={4}>
        {showNotesTerms ? (
          <>
            <Box mb={2}><button onClick={() => setShowNotesTerms(false)} className="toggle-button remove-btn">− REMOVE NOTE & TERMS</button></Box>
            <Box mb={2}><label>Note:</label><ReactQuill theme="snow" value={note} onChange={setNote} /></Box>
            <Box><label>Terms:</label><ReactQuill theme="snow" value={terms} onChange={setTerms} /></Box>
          </>
        ) : (
          <Box><button onClick={() => setShowNotesTerms(true)} className="toggle-button add-btn">+ ADD NOTE & TERMS</button></Box>
        )}
      </Box>

      <CustomButton>Save</CustomButton>
    </Box>
  );
};

export default AddQuote;
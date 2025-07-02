import ReactQuill from 'react-quill-new';
import 'quill/dist/quill.snow.css';
import api from '@/helpers/apiHelper';
import 'quill/dist/quill.snow.css';
import { Box, Grid, useTheme } from '@mui/material';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import PageHeader from '@/components/common/pageHeader';
import CustomInput from '@/components/CustomInputField';
import GenericTable from '@/components/common/genericTable';
import CustomButton from '@/components/CustomButton';

const EditInvoice = () => {
  const theme = useTheme();
  const { id } = useParams();
  const [note, setNote] = useState('');
  const [terms, setTerms] = useState('');
  const [invoiceData, setInvoiceData] = useState<any>(null);
  const [showNotesTerms, setShowNotesTerms] = useState(true);
  const [discountType, setDiscountType] = useState<'Fixed' | 'Percentage'>( 'Fixed');
  const [discountValue, setDiscountValue] = useState(0);
  const url = import.meta.env.VITE_NODE_ENV === 'production' ? 'api' : 'api';

  //  After all useState declarations
  const [selectedTax, setSelectedTax] = useState({ name: 'Ganesh', rate: 35 });

  const taxOptions = [
    { name: 'Ganesh', rate: 35 },
    { name: 'GST', rate: 18 },
    { name: 'No Tax', rate: 0 },
  ];
  const [items, setItems] = useState([
    { id: 1, product: '', qty: '', unitPrice: '',amount: '', isAdded: false,},]);

  // ✅ Derived values (auto-updates on change)
  const subtotal = items
    .filter((item) => item.isAdded)
    .reduce((sum, item) => sum + parseFloat(item.amount || '0'), 0);

  const discountAmount =
    discountType === 'Fixed' ? discountValue : (subtotal * discountValue) / 100;

  const taxAmount = ((subtotal - discountAmount) * selectedTax.rate) / 100;

  const total = subtotal - discountAmount + taxAmount;

  const handleAddRow = () => {
    const updated = [...items];
    const lastItem = updated[updated.length - 1];
    if (!lastItem.product || !lastItem.qty || !lastItem.unitPrice) {
      alert('Please fill in all fields before adding.');
      return;
    }
    lastItem.isAdded = true;

    updated.push({
      id: updated.length + 1,
      product: '',
      qty: '',
      unitPrice: '',
      amount: '',
      isAdded: false,
    });

    setItems(updated);
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;

    // Calculate amount = qty * unitPrice
    if (field === 'qty' || field === 'unitPrice') {
      const qty = parseFloat(updated[index].qty) || 0;
      const price = parseFloat(updated[index].unitPrice) || 0;
      updated[index].amount = (qty * price).toFixed(2);
    }

    setItems(updated);
  };

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const result = await api.get(`/${url}/v1/invoice/getinv/info/${id}`);
        const data = result.data.data;
        setInvoiceData(data);
        setNote(data?.note || '');
        setTerms(data?.terms || '');
      } catch (err) {
        console.error('Error fetching invoice:', err);
      }
    };

    if (id) fetchInvoice();
  }, [id]);

  const columns = [
    { field: 'id', headerName: '#' },
    { field: 'product', headerName: 'Product' },
    { field: 'qty', headerName: 'Qty' },
    { field: 'unitPrice', headerName: 'Unit Price' },
    { field: 'amount', headerName: 'Amount' },
    {
      field: 'action',
      headerName: 'Actions',
      render: (row: any) => (
        <Box display="flex" gap={1}>
          <DeleteIcon
            sx={{ cursor: 'pointer', color: '#FF0000' }}
            onClick={() => handleDelete(row)}
          />
        </Box>
      ),
    },
  ];

  const handleDeleteRow = (id) => {
    const updated = items.filter((item) => item.id !== id);
    setItems(updated);
  };

  return (
    <Box className="dashboard-container" sx={{ p: 3 }}>
      <PageHeader title={`Edit Invoice / ${id}`} />

      {invoiceData && (
        <>
          <Grid container spacing={2} mt={2}>
            <Grid item xs={12} md={6}>
              <CustomInput label="Invoice #" value={invoiceData.invoice_number || ''} disabled />
            </Grid>

            <Grid item xs={12} md={6}>
              <CustomInput label="Invoice Date" value={invoiceData.invoice_date || ''} disabled />
            </Grid>

            <Grid item xs={12} md={6}>
              <CustomInput label="Due Date" value={invoiceData.due_date || ''} disabled />
            </Grid>

            <Grid item xs={12} md={6}>
              <CustomInput label="Status" value={invoiceData.status || ''} disabled />
            </Grid>

            <Grid item xs={12} md={6}>
              <CustomInput label="Invoice Template" value="Default" disabled />
            </Grid>

            <Grid item xs={12} md={6}>
              <CustomInput label="Payment QR Code" value={invoiceData.payment_qr_code || ''} disabled />
            </Grid>

            <Grid item xs={12} md={6}>
              <CustomInput label="Select Currency" value={`${invoiceData.currency_text} ${invoiceData.currency}`} disabled  />
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

          <Grid container spacing={2} mt={3}>
            {items.map((item, index) => (
              <Grid item xs={12} key={item.id}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={1}> {index + 1} </Grid>

                  <Grid item xs={3}>
                    {item.isAdded ? (
                      <span>{item.product}</span>
                    ) : (
                      <CustomInput type="text" value={item.product}
                        onChange={(e) => handleItemChange(index, 'product', e.target.value) }
                        fullWidth
                      />
                    )}
                  </Grid>

                  <Grid item xs={2}>
                    {item.isAdded ? (
                      <span>{item.qty}</span>
                    ) : (
                      <CustomInput type="number" value={item.qty}
                        onChange={(e) => handleItemChange(index, 'qty', e.target.value)}
                        fullWidth
                      />
                    )}
                  </Grid>

                  <Grid item xs={2}>
                    {item.isAdded ? (
                      <span>{item.unitPrice}</span>
                    ) : (
                      <CustomInput type="number" value={item.unitPrice}
                       onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                        fullWidth
                      />
                    )}
                  </Grid>

                  <Grid item xs={2}>
                    <span>{item.amount}</span>
                  </Grid>

                  <Grid item xs={2}>
                    {index !== 0 && (
                      <DeleteIcon
                        sx={{ cursor: 'pointer', color: '#FF0000' }}
                        onClick={() => handleDeleteRow(item.id)}
                      />
                    )}
                  </Grid>
                </Grid>
              </Grid>
            ))}
            <Grid container spacing={2} mt={4}>
              {/* Left side: Inputs */}
              <Grid item xs={12} md={6}>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <CustomInput label="Discount" type="number" value={discountValue}
                    onChange={(e) =>
                      setDiscountValue(parseFloat(e.target.value) || 0)
                    }
                  />
                  <select
                    value={discountType}
                    onChange={(e) =>
                      setDiscountType(e.target.value as 'Fixed' | 'Percentage')
                    }
                    style={{ padding: '12px', border: '1px solid #ccc', borderRadius: '6px',
                    }}
                  >
                    <option value="Fixed">Fixed</option>
                    <option value="Percentage">Percentage</option>
                  </select>
                </Box>

                <Box mt={2}>
                  <select
                    value={selectedTax.name}
                    onChange={(e) => {
                      const selected = taxOptions.find(
                        (t) => t.name === e.target.value
                      );
                      if (selected) setSelectedTax(selected);
                    }}
                    style={{ padding: '12px', width: '100%', borderRadius: '6px',}}
                  >
                    {taxOptions.map((tax) => (
                      <option key={tax.name} value={tax.name}>
                        {tax.name} - {tax.rate}
                      </option>
                    ))}
                  </select>
                </Box>
              </Grid>

              {/* Right side: Summary Display */}
              <Grid item xs={12} md={6}>
                <Box display="flex" flexDirection="column" gap={1}>
                  <Box display="flex" justifyContent="space-between">
                    <span>Sub Total:</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <span>Discount:</span>
                    <span>${discountAmount.toFixed(2)}</span>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <span>Tax:</span>
                    <span>${taxAmount.toFixed(2)}</span>
                  </Box>
                  <Box display="flex" justifyContent="space-between" fontWeight="bold">
                    <span>Total:</span>
                    <span>${total.toFixed(2)}</span>
                  </Box>
                </Box>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <CustomButton onClick={handleAddRow}>Add</CustomButton>
            </Grid>
          </Grid>

          {/* 🔽 Notes & Terms Section */}
          <Box className="notes-terms-wrapper">
            {showNotesTerms ? (
              <>
                <Box className="toggle-button-wrapper">
                  <button
                    onClick={() => setShowNotesTerms(false)}
                    className="toggle-button remove-btn"
                  >
                    − REMOVE NOTE & TERMS
                  </button>
                </Box>

                <Box className="section-margin">
                  <label className="label">Note:</label>
                  <ReactQuill theme="snow" value={note} onChange={setNote} />
                </Box>

                <Box className="section-margin">
                  <label className="label">Terms:</label>
                  <ReactQuill theme="snow" value={terms} onChange={setTerms} />
                </Box>
              </>
            ) : (
              <Box className="toggle-button-wrapper">
                <button
                  onClick={() => setShowNotesTerms(true)}
                  className="toggle-button add-btn"
                >
                  + ADD NOTE & TERMS
                </button>
              </Box>
            )}
          </Box>
        </>
      )}
    </Box>
  );
};

export default EditInvoice;
function handleDelete(row: any): void {
  throw new Error('Function not implemented.');
}

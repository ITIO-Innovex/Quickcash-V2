
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
import api from '@/helpers/apiHelper';
import { jwtDecode } from 'jwt-decode';
import getSymbolFromCurrency from 'currency-symbol-map';
import { useCurrency } from '@/hooks/useCurrency';
import { useNavigate } from 'react-router-dom';
import { useAppToast } from '@/utils/toast';
import useValidation from '@/helpers/userValidation';
import axios from 'axios';
import CryptoJS from 'crypto-js';

const AddQuote = () => {
  const theme = useTheme();
  const toast = useAppToast();
  const { errors, validate } = useValidation();
  const navigate = useNavigate();

  const { currencyList } = useCurrency();
  const [note, setNote] = useState('');
  const [terms, setTerms] = useState('');
  const [quoteNumber, setQuoteNumber] = useState('');
  const [productList, setProductList] = useState<any[]>([]);
  const [userId, setUserId] = useState('');
  const [memberList, setMemberList] = useState<any[]>([]);
  const [currency, setCurrency] = useState('');
  const [taxList, setTaxList] = useState<any[]>([]);
  const [overAllTax, setOverAllTax] = useState(''); // single tax selection
  const [inputs, setInputs] = useState([{ productName: '', productId: '', qty: '', price: '', tax: 0, taxValue: 0, amount: 0 }]);
  const [discountType, setDiscountType] = useState('');
  const [OverAllDiscount, setOverAllDiscount] = useState(0);
  const [subTotal, setSubTotal] = useState(0);
  const [disCountGiven, setDiscountGiven] = useState(0);
  const [tax, setTax] = useState(0);
  const [total, setTotal] = useState(0);
  const [invoiceOption, setInvoiceOption] = useState('Default');
  const [InvoiceDate, setInvoiceDate] = useState(new Date().toISOString().substring(0, 10));
  const [InvoiceDueDate, setInvoiceDueDate] = useState(new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().substring(0, 10));
  const [otherinputs, setOtherInputs] = useState([{ email: '', name: '', address: '' }]);
  const [memberType, setMemberType] = useState('member');
  const [noteandTerms, setnoteandTerms] = useState(false);
  const [today] = useState(new Date().toISOString().split('T')[0]);
  const [discountValue, setDiscountValue] = useState(0);

  useEffect(() => {
    const accountId = jwtDecode(localStorage.getItem('token') as string) as any;
    const url = import.meta.env.VITE_NODE_ENV === 'production' ? 'api' : 'api';
    // Quote number and product list
    axios.get(`/${url}/v1/invoice/generate/inv`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    }).then(res => {
      if (res.data.status === 201) {
        setQuoteNumber(res.data.data);
        setProductList(res.data.productData);
      }
    });
    // Member list
    axios.get(`/${url}/v1/client/list/${accountId?.data?.id}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    }).then(res => {
      if (res.data.status === 201) setMemberList(res.data.data);
    });
    // Tax list
    axios.get(`/${url}/v1/tax/list/${accountId?.data?.id}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    }).then(res => {
      if (res.data.status === 201) setTaxList(res.data.data);
    });
  }, []);

  useEffect(() => {
    let subTotal = 0;
    inputs.forEach(itm => {
      if (itm.qty && itm.price) {
        subTotal += parseFloat(itm.qty) * parseFloat(itm.price);
      }
    });
    setSubTotal(subTotal);

    // Discount
    let discount = 0;
    if (discountType === 'fixed') {
      discount = OverAllDiscount;
    } else if (discountType === 'percentage') {
      discount = (subTotal * OverAllDiscount) / 100;
    }
    setDiscountGiven(discount);

    // Tax
    const taxRate = parseFloat(overAllTax) || 0;
    const taxVal = ((subTotal - discount) * taxRate) / 100;
    setTax(taxVal);

    // Total
    setTotal(subTotal - discount + taxVal);
  }, [inputs, discountType, OverAllDiscount, overAllTax]);

  const handleAddInput = () => {
    setInputs([...inputs, { productName: '', productId: '', qty: '', price: '', tax: 0, taxValue: 0, amount: 0 }]);
  };

  const handleChange2 = async (event: any, index: number) => {
    let { name, value } = event.target;
    if (name === 'qty') {
      const updated = [...inputs];
      updated[index].qty = value;
      if (updated[index].qty && updated[index].price) {
        updated[index].amount = parseFloat(updated[index].qty) * parseFloat(updated[index].price);
        updated[index].taxValue = updated[index].amount * updated[index].tax / 100;
      }
      setInputs(updated);
    } else if (name === 'productName') {
      const selectedProduct = productList.find(p => p._id === value);
      if (selectedProduct) {
        const updated = [...inputs];
        updated[index].productName = selectedProduct.name;
        updated[index].productId = selectedProduct._id;
        updated[index].price = selectedProduct.unitPrice;
        updated[index].qty = '1';
        updated[index].amount = parseFloat(updated[index].qty) * parseFloat(updated[index].price);
        updated[index].taxValue = updated[index].amount * updated[index].tax / 100;
        setInputs(updated);
      }
    }
  };

  const HandleAddQuote = async () => {
    const reference = Math.floor(Math.random() * 10000000);
    const ciphertext = CryptoJS.AES.encrypt(`${reference}`, 'ganesh').toString();
    const accountId = jwtDecode(localStorage.getItem('token') as string) as any;
    const url = import.meta.env.VITE_NODE_ENV === 'production' ? 'api' : 'api';
    const payload = {
      user: accountId?.data?.id,
      reference,
      url: `${import.meta.env.VITE_APP_URL}/invoice-pay?code=${ciphertext}`,
      userid: userId,
      othersInfo: otherinputs,
      quote_number: quoteNumber,
      invoice_country: invoiceOption,
      invoice_date: InvoiceDate,
      due_date: InvoiceDueDate,
      currency,
      productsInfo: inputs,
      discount: OverAllDiscount.toFixed(2),
      discount_type: discountType,
      tax: overAllTax,
      subTotal: subTotal.toFixed(2),
      sub_discount: disCountGiven.toFixed(2),
      sub_tax: tax,
      total: total.toFixed(2),
      note,
      terms,
      currency_text: getSymbolFromCurrency(currency),
    };
    await axios.post(`/${url}/v1/quote/add`, payload, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    }).then(result => {
      if (result.data.status === 201) {
        toast.success(result.data.message);
        navigate('/invoice-quotes');
      }
    }).catch(error => {
      toast.error(error.response.data.message);
    });
  };

  return (
    <Box className="dashboard-container" sx={{ p: 3 }}>
      <PageHeader title={`Add Quote`} />
      <Grid container spacing={2} mt={2}>
        <Grid item xs={12} md={6}><CustomInput label="Quote #" value={quoteNumber} disabled /></Grid>
        <Grid item xs={12} md={6}>
          <FormLabel sx={{ fontWeight: 600, color: '#483594' }}>Select Type</FormLabel>
          <RadioGroup row value={memberType} onChange={(e) => setMemberType(e.target.value)}>
            <FormControlLabel value="member" control={<Radio />} label="Member" />
            <FormControlLabel value="other" control={<Radio />} label="Other" />
          </RadioGroup>
        </Grid>
        {memberType === 'other' && (
          <>
            <Grid item xs={12} md={6}><CustomInput label="Receiver Name" value={otherinputs[0].name} onChange={(e) => setOtherInputs([{ ...otherinputs[0], name: e.target.value }])} /></Grid>
            <Grid item xs={12} md={6}><CustomInput label="Receiver Email" value={otherinputs[0].email} onChange={(e) => setOtherInputs([{ ...otherinputs[0], email: e.target.value }])} /></Grid>
            <Grid item xs={12} md={6}><CustomInput label="Receiver Address" value={otherinputs[0].address} onChange={(e) => setOtherInputs([{ ...otherinputs[0], address: e.target.value }])} /></Grid>
          </>
        )}
        {/* Replace quoteData fields with correct state variables */}
        <Grid item xs={12} md={6}>
          <CustomSelect
            label="Select Member"
            value={userId}
            onChange={(e) => setUserId(String(e.target.value))}
            options={
              memberList?.map((item: any) => ({
                label: `${item?.firstName} ${item?.lastName}`,
                value: item?._id
              })) || []
            }
          />
        </Grid>
        <Grid item xs={12} md={6}><CustomInput label="Quote Date" type="date" value={InvoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} /></Grid>
        <Grid item xs={12} md={6}><CustomInput label="Due Date" type="date" value={InvoiceDueDate} onChange={(e) => setInvoiceDueDate(e.target.value)} /></Grid>
        <Grid item xs={12} md={6}><CustomInput label="Invoice Template" value={invoiceOption} onChange={(e) => setInvoiceOption(e.target.value)} /></Grid>
        {/* <Grid item xs={12} md={6}><CustomInput label="Payment QR Code" value={quoteData.payment_qr_code} disabled /></Grid> */}
        <Grid item xs={12} md={6}>
          <CustomSelect
            label="Select Currency"
            value={currency}
            onChange={e => setCurrency(String(e.target.value))}
            options={currencyList?.map((item: any) => ({
              label: `${getSymbolFromCurrency(item.base_code)} ${item.base_code}`,
              value: item.base_code
            })) || []}
          />
        </Grid>

      </Grid>

      <Grid item xs={12}>
        <Grid container spacing={2}
          sx={{ fontWeight: 'bold', pb: 2, mt: 4, backgroundColor: '#483594', color: theme.palette.text.primary, }} >

          <Grid item xs={1}> # </Grid>

          <Grid item xs={3}> Product </Grid>

          <Grid item xs={2}> Qty </Grid>

          <Grid item xs={2}>Unit Price </Grid>

          <Grid item xs={2}> Amount</Grid>

          <Grid item xs={2}>Action </Grid>

        </Grid>
      </Grid>

      <Grid container spacing={2} mt={4}>
        {inputs.map((item, index) => (
          <Grid item xs={12} key={index}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={1}>{index + 1}</Grid>
              <Grid item xs={3}>
                <CustomSelect
                  label="Product"
                  value={item.productId}
                  onChange={e => handleChange2({ target: { name: 'productName', value: e.target.value } }, index)}
                  options={productList.map(p => ({ label: p.name, value: p._id }))}
                />
              </Grid>
              <Grid item xs={2}>
                <CustomInput
                  type="number"
                  value={item.qty}
                  onChange={(e) => handleChange2(e, index)}
                />
              </Grid>
              <Grid item xs={2}>
                <CustomInput
                  type="number"
                  value={item.price}
                  disabled
                />
              </Grid>
              <Grid item xs={2}>
                <span>{item.amount}</span>
              </Grid>
              <Grid item xs={2}>
                {index !== 0 && <DeleteIcon sx={{ cursor: 'pointer', color: '#FF0000' }} onClick={() => setInputs(inputs.filter((_, i) => i !== index))} />}
              </Grid>
            </Grid>
          </Grid>
        ))}
        <Grid item xs={12} display="flex" justifyContent="flex-end"><CustomButton onClick={handleAddInput}>ADD</CustomButton></Grid>
      </Grid>

      <Grid container spacing={2} mt={4}>
        <Grid item xs={12} md={6}>
          <Box display="flex" gap={2} mb={2}>
            <CustomInput label="Discount" type="number" value={OverAllDiscount} onChange={(e) => setOverAllDiscount(parseFloat(e.target.value) || 0)} />
            <select value={discountType} onChange={(e) => setDiscountType(e.target.value)} style={{ padding: '12px', border: '1px solid #ccc', borderRadius: '6px' }}>
              <option value="fixed">Fixed</option>
              <option value="percentage">Percentage</option>
            </select>
          </Box>
          <select
            value={overAllTax}
            onChange={(e) => setOverAllTax(e.target.value)}
            style={{ padding: '12px', width: '100%', borderRadius: '6px', border: '1px solid #ccc' }}
          >
            {taxList.map(tax => (
              <option key={tax._id} value={tax.taxvalue}>
                {tax.Name} - {tax.taxvalue}
              </option>
            ))}
          </select>
        </Grid>

        <Grid item xs={12} md={6}>
          <Box display="flex" flexDirection="column" gap={1}>
            <Box display="flex" justifyContent="space-between"><span>Sub Total:</span><span>{subTotal.toFixed(2)}</span></Box>
            <Box display="flex" justifyContent="space-between"><span>Discount:</span><span>{disCountGiven.toFixed(2)}</span></Box>
            <Box display="flex" justifyContent="space-between"><span>Tax:</span><span>{tax.toFixed(2)}</span></Box>
            <Box display="flex" justifyContent="space-between" fontWeight="bold"><span>Total:</span><span>{total.toFixed(2)}</span></Box>
          </Box>
        </Grid>
      </Grid>

      <Box mt={4}>
        {noteandTerms ? (
          <>
            <Box mb={2}><button onClick={() => setnoteandTerms(false)} className="toggle-button remove-btn">− REMOVE NOTE & TERMS</button></Box>
            <Box mb={2}><label>Note:</label><ReactQuill theme="snow" value={note} onChange={setNote} /></Box>
            <Box><label>Terms:</label><ReactQuill theme="snow" value={terms} onChange={setTerms} /></Box>
          </>
        ) : (
          <Box><button onClick={() => setnoteandTerms(true)} className="toggle-button add-btn">+ ADD NOTE & TERMS</button></Box>
        )}
      </Box>

      <CustomButton onClick={HandleAddQuote}>Save</CustomButton>
    </Box>
  );
};

export default AddQuote;
import FirstSection from './FirstSection';
import { Box, useTheme } from '@mui/material';
import PageHeader from '@/components/common/pageHeader';
import { useState, useEffect } from 'react';
import CustomModal from '@/components/CustomModal';
import AddManualPayment from '@/components/forms/AddManualPayment';
import axios from 'axios';

const Main = () => {
  const theme = useTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [unpaidInvoice, setUnpaidInvoice] = useState<any[]>([]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const url = import.meta.env.VITE_NODE_ENV == "production" ? 'api' : 'api';

  const fetchUnpaidInvoices = async () => {
    setLoadingInvoices(true);
    try {
      const result = await axios.get(`/${url}/v1/manualPayment/list`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (result?.data?.status === 201) {
        console.log("[Main] raw API data:", result.data.data);
        console.log("[Main] all statuses:", (result.data.data || []).map((item: any) => item.status));
        if (result.data.data && result.data.data.length > 0) {
          console.log("[Main] first API object:", result.data.data[0]);
        }
        const mapped = (result.data.data || []).map((item: any) => ({
          invoice_number: item?.invoiceDetails?.[0]?.invoice_number || '',
          _id: item?.invoice || '',
          ...item
        }));
        setUnpaidInvoice(mapped);
        console.log("[Main] unpaidInvoice (mapped, no filter):", mapped);
        console.log("[Main] mapped invoiceDetails[0]:", mapped.map(i => i.invoiceDetails?.[0]));
        console.log("[Main] mapped _id:", mapped.map(i => i._id));
        console.log("[Main] mapped invoice:", mapped.map(i => i.invoice));
      } else {
        setUnpaidInvoice([]);
        console.log("[Main] No unpaid invoices found.");
      }
    } catch (error) {
      setUnpaidInvoice([]);
      console.log("[Main] Error fetching unpaid invoices:", error);
    }
    setLoadingInvoices(false);
  };

  const handleOpen = () => {
    setIsModalOpen(true);
    fetchUnpaidInvoices();
  };

  const handleClose = () => {
    setIsModalOpen(false);
  };

  const handleSave = (data: {
    invoiceNo: string;
    dueAmount: string;
    paidAmount: string;
    paymentDate: string;
    amount: string;
    paymentMode: string;
    notes: string;
  }) => {
    console.log('Saved Data:', data);
  };

  return (
    <Box
      className="clients-container dashboard-container"
      sx={{ backgroundColor: theme.palette.background.default }}
    >
      <PageHeader title={'Invoice-manual payment'} buttonText='payment' onButtonClick={handleOpen} />
      <FirstSection />

      <CustomModal
        open={isModalOpen}
        onClose={handleClose}
        title="Add manual payemnt"
        maxWidth="md"
      >
        {loadingInvoices ? (
          <div>Loading invoices...</div>
        ) : (
          <>
            {console.log("[Render] unpaidInvoice:", unpaidInvoice)}
            <AddManualPayment onSave={handleSave} onCancel={handleClose} unpaidInvoice={unpaidInvoice} />
          </>
        )}
      </CustomModal>
    </Box>
  );
};

export default Main;

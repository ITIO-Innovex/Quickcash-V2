import React, { useEffect, useState } from 'react';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CustomModal from '../../../../components/CustomModal';
import { Box, Button, Typography, useTheme } from '@mui/material';
import GenericTable from '../../../../components/common/genericTable';
import CustomButton from '@/components/CustomButton';
import { KeyValueDisplay } from '@/components/KeyValueDisplay';
import CustomInput from '@/components/CustomInputField';
import admin from '@/helpers/adminApiHelper';
import { showToast } from '@/utils/toastContainer';

const url = import.meta.env.VITE_NODE_ENV == "production" ? 'api' : 'api';

const FirstSection = () => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any | null>(null);
  const [tempPurpose, setTempPurpose] = useState(selectedRow?.description || '');
  const [finalPurpose, setFinalPurpose] = useState(selectedRow?.description || '');

  const handleOpen = (row: any) => {
    setSelectedRow(row);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedRow(null);
  };
  const [list, setList] = React.useState<any>();
  const [status, setStatus] = React.useState<any>('');
  const [transtatus, setTranStatus] = React.useState<any>('');
  const [currentData, setCurrentData] = useState<any[]>([]);
  const [details, setDetails] = React.useState<any>([]);
  const [comment, setComment] = React.useState<any>('');
  const [id, setId] = React.useState<any>('');
  const [amount, setAmount] = React.useState<any>('');
  const [account, setAccount] = React.useState<any>('');
  const [openDetails, setOpenDetails] = useState(false);
  const [openComment, setOpenComment] = useState(false);
  const translist = async () => {
    await admin.get(`/${url}/v1/transaction/admin/list`,
    )
      .then(result => {
        if (result.data.status == 201) {
          setList(result.data.data);
          setCurrentData(result.data.data);
        }
      })
      .catch(error => {
        console.log(error);
      })
  }
  useEffect(() => {
    translist();
  }, [])
  const getDetailsOfTransactions = async (id: any) => {
    await admin.get(`/${url}/v1/transaction/tr/${id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('admintoken')}`
      }
    })
      .then(result => {
        if (result.data.status == "201") {
          setDetails(result.data.data)
        }
      })
      .catch(error => {
        console.log("error", error);
      })
  }

  const HandleUpdateStatus = async (id: any, acct: any, amount: any) => {
    await admin.patch(`/${url}/v1/transaction/admin/status/update/${id}`, {
      status,
      source_account: acct,
      amount: amount,
      comment: comment
    },
    )
      .then(result => {
        if (result.data.status == 201) {
          setId('');
          setAmount('');
          setAccount('');
          setComment('');
          setOpenDetails(false);
          showToast(result.data.message, "success");
          translist();
        }
      })
      .catch(error => {
        console.log(error);
        showToast(error.response.data.message, "error");
      })
  }
  const columns = [
    {
      field: 'createdAt',
      headerName: 'Date',
      render: (row: any) => row.createdAt ? row.createdAt.slice(0, 10) : '',
    },
    {
      field: 'userDetails?.name',
      headerName: 'Username',
      render: (row: any) => row.userDetails?.[0]?.name || 'N/A',
    },
    {
      field: 'userDetails?.email',
      headerName: 'Email',
      render: (row: any) => row.userDetails?.[0]?.email || 'N/A',
    },
    {
      field: 'amount',
      headerName: 'Amount',
      render: (row: any) => `${row.amount < 0 ? '-' : '+'}${Math.abs(row.amount)}`
    },
    {
      field: 'mobile',
      headerName: 'Mobile',
      render: (row: any) => row.userDetails?.[0]?.mobile || 'N/A',
    },
    {
      field: 'status',
      headerName: 'Status',
      render: (row: any) => (
        <span className={`status-chip ${row.status.toLowerCase()}`}>
          {row.status}
        </span>
      )
    },
    {
      field: 'action',
      headerName: 'Action',
      render: (row: any) => (
        <VisibilityIcon
          sx={{ cursor: 'pointer' }}
          onClick={() => handleOpen(row)}
        />
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

      {/* Modal */}
     <CustomModal open={open} onClose={handleClose} sx={{ backgroundColor: theme.palette.background.default }} title={''}   >

        {selectedRow && (
          <>
            <Typography className="section-title">Transaction Info</Typography>
            <KeyValueDisplay
              data={{ 'Trx. Id': selectedRow.id, 'Requested Date': selectedRow.date, 'Fee': '$2.00','Bill Amount': selectedRow.amount, 'Transaction Type': 'credit /Add Money',}}/>

            <Typography className="section-title">Sender Info</Typography>
            <KeyValueDisplay
              data={{ 'Sender Name': 'John Doe', 'Account No': '1234567890', 'Sender Address': '123 Main St, City', 'BIC/IFSC Code':'XXXXX'}}/>

            <Typography className="section-title">Receiver Info</Typography>
            <KeyValueDisplay
              data={{ 'Receiver Name': 'Jane Smith', 'Account No': '0987654321','Bank Name': 'HDFC', 'BIC/IFSC Code ':'XXXXX'}}/>

            <Typography className="section-title">Bank Info</Typography>
            <KeyValueDisplay
              data={{ 'Bank Name':'IDFC', 'Bank Address':'ZZZZ', 'Transfer Amount': `$${Math.abs(selectedRow.amount)}`, 'Settle Amount': '$100.00',  'Transfer Status': selectedRow.status,'Transfer Description/Purpose': finalPurpose || 'No description' }}/>
            
            <Box mt={3}>
              <Typography className="section-title"> Update Purpose / Description </Typography>
               <CustomInput value={tempPurpose} onChange={(e) => setTempPurpose(e.target.value)} placeholder="Enter purpose / reason"/>
            </Box>

            <Box display="flex" justifyContent="flex-end" gap={2} >
              <CustomButton onClick={() => setFinalPurpose(tempPurpose)}> Update </CustomButton>
          <CustomButton onClick={handleClose}>Close</CustomButton>
          </Box>
          </>
        )}
      </CustomModal>
    </Box>
  );
};

export default FirstSection;

import React, { useEffect, useState } from 'react';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CustomModal from '../../../../components/CustomModal';
import { Box, Button, Typography, useTheme } from '@mui/material';
import GenericTable from '../../../../components/common/genericTable';
import CustomButton from '@/components/CustomButton';
import { KeyValueDisplay } from '@/components/KeyValueDisplay';
import CustomInput from '@/components/CustomInputField';
import admin from '@/helpers/adminApiHelper';
import { useAppToast } from '@/utils/toast'; 
import CustomSelect from '@/components/CustomDropdown';

const url = import.meta.env.VITE_NODE_ENV == "production" ? 'api' : 'api';

const FirstSection = () => {
  const theme = useTheme();
  const toast = useAppToast(); 
  const [open, setOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any | null>(null);
  const [tempPurpose, setTempPurpose] = useState('');
  const [finalPurpose, setFinalPurpose] = useState('');
  const [details, setDetails] = useState<any[]>([]);

  const handleOpen = async (row: any) => {
    setSelectedRow(row);
    setOpen(true);
    // Fetch transaction details
    try {
      const result = await admin.get(`/${url}/v1/transaction/tr/${row._id}`);
      if (result.data.status == 201) {
        setDetails(result.data.data);
        setTempPurpose(result.data.data?.[0]?.info || '');
        setFinalPurpose(result.data.data?.[0]?.info || '');
      } else {
        setDetails([]);
        setTempPurpose(row.info || '');
        setFinalPurpose(row.info || '');
      }
    } catch (error) {
      setDetails([]);
      setTempPurpose(row.info || '');
      setFinalPurpose(row.info || '');
    }
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedRow(null);
  };
  const [list, setList] = React.useState<any>();
  const [status, setStatus] = React.useState<any>('');
  const [transtatus, setTranStatus] = React.useState<any>('');
  const [currentData, setCurrentData] = useState<any[]>([]);
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
    await admin.get(`/${url}/v1/transaction/tr/${id}`)
      .then(result => {
        if (result.data.status == 201) {
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
          toast.success(result.data.message);
          translist();
          handleClose();
        }
      })
      .catch(error => {
        console.log(error);
        toast.error(error.response.data.message);
      })
  }

  const formatAmount = (num) => {
    if (Number.isInteger(num)) {
      return num;
    }
    return num.toFixed(2);
  };

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
      render: (row: any) => row?.amountText || 'N/A'
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
        {(details && details[0]) ? (
          <>
            <Typography className="section-title">Transaction Info</Typography>
            <KeyValueDisplay
              data={{
                'Trx. Id': details[0].trx || '-',
                'Requested Date': details[0].createdAt ? details[0].createdAt.slice(0, 10) : '-',
                'Fee': details[0].fee !== undefined ? `$${details[0].fee}` : '-',
                'Bill Amount': details[0].amount !== undefined ? `$${details[0].amount}` : '-',
                'Transaction Type': `${details[0].extraType || '-'}${details[0].trans_type ? ' - ' + details[0].trans_type : ''}`,
              }}
            />
            <Typography className="section-title">Sender Info</Typography>
            <KeyValueDisplay
              data={{
                'Sender Name': (details[0].tr_type !== "UPI" && details[0].tr_type === "bank-transfer")
                  ? (details[0].receipient ? details[0].senderAccountDetails?.[0]?.name : details[0].senderAccountDetails?.[0]?.name)
                  : (details[0].extraType === "credit"
                    ? details[0].transferAccountDetails?.[0]?.name
                    : details[0].senderAccountDetails?.[0]?.name) || '-',
                'Account No': (details[0].tr_type !== "UPI" && details[0].tr_type === "bank-transfer")
                  ? (details[0].receipient ? details[0].senderAccountDetails?.[0]?.iban : details[0].senderAccountDetails?.[0]?.iban)
                  : (details[0].extraType === "credit"
                    ? details[0].transferAccountDetails?.[0]?.iban
                    : details[0].senderAccountDetails?.[0]?.iban) || '-',
                'Sender Email': selectedRow?.userDetails?.[0]?.email || '-',
                'Sender Mobile': selectedRow?.userDetails?.[0]?.mobile || '-',
                'BIC/IFSC Code': (details[0].tr_type !== "UPI" && details[0].tr_type === "bank-transfer")
                  ? (details[0].receipient ? details[0].senderAccountDetails?.[0]?.bic_code : details[0].senderAccountDetails?.[0]?.bic_code)
                  : (details[0].extraType === "credit"
                    ? details[0].transferAccountDetails?.[0]?.bic_code
                    : details[0].senderAccountDetails?.[0]?.bic_code) || '-',
              }}
            />
            <Typography className="section-title">Receiver Info</Typography>
            <KeyValueDisplay
              data={{
                'Receiver Name': (details[0].extraType === "credit")
                  ? details[0].senderAccountDetails?.[0]?.name
                  : (details[0].receipient
                    ? details[0].recAccountDetails?.[0]?.name
                    : details[0].transferAccountDetails?.[0]?.name) || '-',
                'Account No': (details[0].extraType === "credit")
                  ? details[0].senderAccountDetails?.[0]?.iban
                  : (details[0].receipient
                    ? details[0].recAccountDetails?.[0]?.iban
                    : details[0].transferAccountDetails?.[0]?.iban) || '-',
                'Bank Name': (details[0].extraType === "credit")
                  ? details[0].senderAccountDetails?.[0]?.bankName
                  : (details[0].receipient
                    ? details[0].recAccountDetails?.[0]?.bankName
                    : details[0].transferAccountDetails?.[0]?.bankName) || '-',
                'BIC/IFSC Code': (details[0].extraType === "credit")
                  ? details[0].senderAccountDetails?.[0]?.bic_code
                  : (details[0].receipient
                    ? details[0].recAccountDetails?.[0]?.bic_code
                    : details[0].transferAccountDetails?.[0]?.bic_code) || '-',
              }}
            />
            <Typography className="section-title">Bank Info</Typography>
            <KeyValueDisplay
              data={{
                'Bank Name': (details[0].extraType === "credit")
                  ? details[0].senderAccountDetails?.[0]?.bankName
                  : (details[0].receipient
                    ? details[0].recAccountDetails?.[0]?.bankName
                    : details[0].transferAccountDetails?.[0]?.bankName) || '-',
                'Bank Address': (details[0].extraType === "credit")
                  ? details[0].senderAccountDetails?.[0]?.address
                  : (details[0].receipient
                    ? details[0].recAccountDetails?.[0]?.address
                    : details[0].transferAccountDetails?.[0]?.address) || '-',
                'Transfer Amount': details[0].amount !== undefined ? `$${details[0].amount}` : '-',
                'Settle Amount': details[0].settle_amount !== undefined ? `$${details[0].settle_amount}` : '-',
                'Transfer Status': details[0].status || '-',
                'Transfer Description/Purpose': finalPurpose || details[0].info || 'No description',
              }}
            />
            
            <Box mt={3}>
              <Typography className="section-title"> Update Purpose / Description </Typography>
               <Box mt={2}>
              {/* <Typography>Status</Typography> */}
              <CustomSelect
                label="Status"
                value={status}
                onChange={e => setStatus(e.target.value)}
                options={[
                  { label: 'Pending', value: 'pending' },
                  { label: 'Success', value: 'success' },
                  { label: 'Failed', value: 'failed' },
                ]}
                style={{ width: '100%', padding: '8px', marginTop: '4px' }}
              />
            </Box>
              <CustomInput value={tempPurpose} onChange={(e) => setTempPurpose(e.target.value)} placeholder="Enter purpose / reason" />
            </Box>
           
            <Box display="flex" justifyContent="flex-end" gap={2} >
              <CustomButton
                onClick={() => {
                  if (!status) {
                    toast.error('Please select a status');
                    return;
                  }
                  if (details && details[0]) {
                    HandleUpdateStatus(details[0]._id, details[0].source_account, details[0].amount);
                  }
                }}
              >
                Update Status
              </CustomButton>
              <CustomButton onClick={handleClose}>Close</CustomButton>
            </Box>
          </>
        ) : selectedRow ? (
          <>
            <Typography className="section-title">Transaction Info</Typography>
            <KeyValueDisplay
              data={{
                'Trx. Id': selectedRow.trx || '-',
                'Requested Date': selectedRow.createdAt ? selectedRow.createdAt.slice(0, 10) : '-',
                'Fee': selectedRow.fee !== undefined ? `$${selectedRow.fee}` : '-',
                'Bill Amount': selectedRow.amount !== undefined ? `$${selectedRow.amount}` : '-',
                'Transaction Type': selectedRow.trans_type || '-',
              }}
            />
            <Typography className="section-title">Sender Info</Typography>
            <KeyValueDisplay
              data={{
                'Sender Name': selectedRow.userDetails?.[0]?.name || '-',
                'Account No': selectedRow.source_account || '-',
                'Sender Email': selectedRow.userDetails?.[0]?.email || '-',
                'Sender Mobile': selectedRow.userDetails?.[0]?.mobile || '-',
                'BIC/IFSC Code': selectedRow.bic || '-',
              }}
            />
            <Typography className="section-title">Receiver Info</Typography>
            <KeyValueDisplay
              data={{
                'Receiver Name': selectedRow.receipient || '-',
                'Account No': selectedRow.transfer_account || '-',
                'Bank Name': selectedRow.bank_name || '-',
                'BIC/IFSC Code': selectedRow.bic || '-',
              }}
            />
            <Typography className="section-title">Bank Info</Typography>
            <KeyValueDisplay
              data={{
                'Bank Name': selectedRow.bank_name || '-',
                'Bank Address': selectedRow.bank_address || '-',
                'Transfer Amount': selectedRow.amount !== undefined ? `$${selectedRow.amount}` : '-',
                'Settle Amount': selectedRow.settle_amount !== undefined ? `$${selectedRow.settle_amount}` : '-',
                'Transfer Status': selectedRow.status || '-',
                'Transfer Description/Purpose': finalPurpose || selectedRow.info || 'No description',
              }}
            />
            <Box mt={3}>
              <Typography className="section-title"> Update Purpose / Description </Typography>
              <CustomInput value={tempPurpose} onChange={(e) => setTempPurpose(e.target.value)} placeholder="Enter purpose / reason" />
            </Box>
            <Box display="flex" justifyContent="flex-end" gap={2} >
              <CustomButton onClick={() => setFinalPurpose(tempPurpose)}> Update </CustomButton>
              <CustomButton onClick={handleClose}>Close</CustomButton>
            </Box>
          </>
        ) : null}
      </CustomModal>
    </Box>
  );
};

export default FirstSection;

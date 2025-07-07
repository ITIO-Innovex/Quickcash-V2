import React, { useEffect, useState } from 'react';
import CommonFilter from '@/components/CustomFilter';
import CustomButton from '@/components/CustomButton';
import { downloadPDF } from '../../../../utils/downloadPDF';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { KeyValueDisplay } from '@/components/KeyValueDisplay';
import CustomModal from '../../../../components/CustomModal';
import { downloadExcel } from '../../../../utils/downloadExcel';
import { FileSpreadsheet, FileText, Filter } from 'lucide-react';
import { Box, Button, Typography, useTheme } from '@mui/material';
import GenericTable from '../../../../components/common/genericTable';
import TransactionDetailModal from '../../../../components/common/transactionDetailModal';
import admin from '@/helpers/adminApiHelper';
import moment from 'moment';
import getSymbolFromCurrency from 'currency-symbol-map';
const url = import.meta.env.VITE_NODE_ENV == "production" ? 'api' : 'api';

const FirstSection = () => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any | null>(null);
  const [details, setDetails] = useState<any[]>([]);

  const handleFilter = () => {
    setShowFilter((prev) => !prev);
  };
  const handleOpen = async (row: any) => {
    setSelectedRow(row);
    setOpen(true);
    try {
      const result = await admin.get(`/${url}/v1/transaction/tr/${row._id}`);
      if (result.data.status == 201) {
        setDetails(result.data.data);
      } else {
        setDetails([]);
      }
    } catch (error) {
      setDetails([]);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedRow(null);
  };
  const [list, setList] = useState<any[]>([]);
  const [currentData, setCurrentData] = useState<any[]>([]);

  const [listOne, setListOne] = React.useState<any>();
  // const { toPDF, targetRef } = usePDF({filename: 'transactionList.pdf'});

  useEffect(() => {
    getTransactionsList();
  }, [location])

  const getTransactionsList = async () => {
    await admin.get(`/${url}/v1/transaction/admin/listall`,
    )
      .then(result => {
        if (result.data.status == 201) {
          setList(result.data.data);
          setCurrentData(result.data.data);
        }
      })
      .catch(error => {
        console.log("error", error);
      })
  }
  const getListById = async (id: any) => {
    await admin.get(`/${url}/v1/transaction/tr/${id}`)
      .then(result => {
        if (result.data.status == 201) {
          setListOne(result.data.data)
          console.log("List One", result.data.data);
        }
      })
      .catch(error => {
        console.log("error", error);
      })
  }

  const handleExcelDownload = () => {
    const formattedData = currentData.map((row) => ({
      'Created Date': row.createdAt ? row.createdAt.slice(0, 10) : '',
      ID: row.trx,
      Type: row.trans_type,
      Amount: `$${Math.abs(row.conversionAmount)}`,
      Details: row.info,
      Status: row.status,
    }));

    downloadExcel(formattedData, 'TransactionsList.xlsx', 'TransactionsList');
  };

  const handleDownloadPDF = () => {
    const headers = [
      'Date',
      'Transaction ID',
      'Type',
      'Amount',
      'Details',
      'Status',
    ];
    const formattedData = currentData.map((row) => ({
      'Date': row.createdAt ? row.createdAt.slice(0, 10) : '',
      'Transaction ID': row.trx,
      Type: row.trans_type,
      Amount: `$${Math.abs(row.conversionAmount)}`,
      Details: row.info,
      Status: row.status,
    }));

    downloadPDF(
      formattedData,
      headers,
      'TransactionsList.pdf',
      'Transactions List'
    );
  };

  const handleGlobalSearch = (text: string) => {
    setFilterText(text);

    if (text.trim() === '') {
      setCurrentData(list);
      return;
    }

    const lower = text.toLowerCase();

    const filtered = list.filter((row) =>
      Object.values(row).some((val) =>
        String(val).toLowerCase().includes(lower)
      )
    );

    setCurrentData(filtered);
    // console.log('Filtering by:', text, '→ Found:', filtered.length, 'items');
  };

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
    { field: 'trx', headerName: 'Transaction ID' },
    { field: 'trans_type', headerName: 'Type' },
    {
      field: 'conversionAmount',
      headerName: 'Amount',
      render: (row: any) => {
        let sign = '+';
        let symbol = '';
        let amount = 0;
        let style = {
          color: 'green',
          fontWeight: '700',
        };

        if (row?.extraType === 'debit') {
          amount = parseFloat(row?.amount || 0) + parseFloat(row?.fee || 0);
          symbol = getSymbolFromCurrency(row?.from_currency);
          sign = '-';
          style.color = 'red';
        } else if (row?.cAmount) {
          amount = parseFloat(row?.cAmount);
          if (row?.tr_type === 'Stripe') {
            symbol = getSymbolFromCurrency(row?.from_currency);
          } else {
            symbol = getSymbolFromCurrency(row?.to_currency);
          }
        } else if (row?.conversionAmount) {
          amount = parseFloat(row?.conversionAmount);
          symbol = getSymbolFromCurrency(row?.to_currency);
        } else {
          amount = parseFloat(row?.amount || 0);
          symbol = getSymbolFromCurrency(row?.to_currency);
        }

        const value = `${sign}${symbol}${formatAmount(Math.abs(amount))}`;
        return <span style={style}>{value}</span>;
      }
    },
    {
      field: 'info',
      headerName: 'details',
      render: (row: any) => `${row.info}`,
    },
    {
      field: 'status',
      headerName: 'Status',
      render: (row: any) => {
        const rawStatus = row.status?.toLowerCase();

        const isSuccess = ['succeeded', 'success', 'complete', 'successful'].includes(rawStatus);
        const displayText = isSuccess ? 'Success' : row.status;
        const statusClass = isSuccess ? 'success' : rawStatus; // force same class for all success types

        return (
          <span className={`status-chip ${statusClass}`}>
            {displayText}
          </span>
        );
      }
    },

    {
      field: 'action',
      headerName: 'Action',
      render: (row: any) => (
        <VisibilityIcon
          sx={{ cursor: 'pointer' }}
          onClick={() => handleOpen(row)}
        />
      ),
    },
  ];

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          mb: 3,
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <Button startIcon={<FileSpreadsheet size={20} />}
          sx={{ color: theme.palette.navbar.text }}
          onClick={handleExcelDownload}
          disabled={!currentData?.length}
        >
          Download Excel
        </Button>

        <Button
          startIcon={<FileText size={20} />}
          sx={{ color: theme.palette.navbar.text }}
          onClick={handleDownloadPDF}
          disabled={!currentData?.length}
        >
          {' '}
          Download PDF
        </Button>

        <Button
          startIcon={<Filter size={20} />}
          onClick={handleFilter}
          sx={{ color: theme.palette.navbar.text }}
        >
          {' '}
          Filter{' '}
        </Button>
      </Box>

      {showFilter && (
        <CommonFilter
          label="Search any field"
          value={filterText}
          onChange={handleGlobalSearch}
          width="200px"
        />
      )}
      {currentData ? (
        <GenericTable columns={columns} data={currentData} />
      ) : (
        <Typography variant="body1" sx={{ mt: 2 }}>
          No data found.
        </Typography>
      )}

      {/* Modal */}
      <CustomModal open={open} onClose={handleClose} sx={{ backgroundColor: theme.palette.background.default }} title={''}>
        {(details && details[0]) ? (
          <>
            <Typography className="section-title">Transaction Info</Typography>
            <KeyValueDisplay
              data={{
                'Trx. Id': details[0]?.trx || '-',
                'Requested Date': details[0]?.createdAt ? moment(details[0]?.createdAt).format('YYYY-MM-DD hh:mm:ss:A') : '-',
                'Fee':
                  details[0]?.extraType === 'debit'
                    ? `${getSymbolFromCurrency(details[0]?.from_currency)}${parseFloat(details[0]?.fee).toFixed(2)}`
                    : details[0]?.tr_type === 'Stripe'
                      ? `${getSymbolFromCurrency(details[0]?.to_currency)}${parseFloat(details[0]?.fee).toFixed(2)}`
                      : details[0]?.trans_type === 'Exchange'
                        ? `${getSymbolFromCurrency(details[0]?.from_currency)}${parseFloat(details[0]?.fee).toFixed(2)}`
                        : details[0]?.fee !== undefined
                          ? `${getSymbolFromCurrency(details[0]?.from_currency)}${parseFloat(details[0]?.fee).toFixed(2)}`
                          : '-',
                'Bill Amount':
                  details[0]?.extraType === 'debit'
                    ? `${getSymbolFromCurrency(details[0]?.from_currency)}${(
                      parseFloat(details[0]?.amount) + parseFloat(details[0]?.fee)
                    ).toFixed(2)}`
                    : details[0]?.tr_type === 'Stripe'
                      ? `${getSymbolFromCurrency(details[0]?.to_currency)}${(
                        parseFloat(details[0]?.amount) + parseFloat(details[0]?.fee)
                      ).toFixed(2)}`
                      : details[0]?.trans_type === 'Exchange'
                        ? `${getSymbolFromCurrency(details[0]?.from_currency)}${(
                          parseFloat(details[0]?.amount) + parseFloat(details[0]?.fee)
                        ).toFixed(2)}`
                        : details[0]?.amount !== undefined
                          ? `${getSymbolFromCurrency(details[0]?.from_currency)}${(
                            parseFloat(details[0]?.amount) + parseFloat(details[0]?.fee)
                          ).toFixed(2)}`
                          : '-',
                'Transaction Type': details[0]?.receipient
                  ? 'Transfer Money'
                  : `${details[0]?.extraType || '-'} - ${details[0]?.trans_type || '-'}`
              }}
            />

            <Typography className="section-title">Sender Info</Typography>
            <KeyValueDisplay
              data={{
                'Sender Name': (details[0]?.tr_type !== "UPI" && details[0]?.tr_type === "bank-transfer")
                  ? (details[0]?.receipient ? details[0]?.senderAccountDetails?.[0]?.name : details[0]?.senderAccountDetails?.[0]?.name)
                  : (details[0]?.extraType === "credit"
                    ? details[0]?.transferAccountDetails?.[0]?.name
                    : details[0]?.senderAccountDetails?.[0]?.name) || '-',
                'Account No': (details[0]?.tr_type !== "UPI" && details[0]?.tr_type === "bank-transfer")
                  ? (details[0]?.receipient ? details[0]?.senderAccountDetails?.[0]?.iban : details[0]?.senderAccountDetails?.[0]?.iban)
                  : (details[0]?.extraType === "credit"
                    ? details[0]?.transferAccountDetails?.[0]?.iban
                    : details[0]?.senderAccountDetails?.[0]?.iban) || '-',
                'Sender Address': (details[0]?.tr_type !== "UPI" && details[0]?.tr_type === "bank-transfer")
                  ? (details[0]?.receipient ? details[0]?.senderAccountDetails?.[0]?.address : details[0]?.senderAccountDetails?.[0]?.address)
                  : (details[0]?.extraType === "credit"
                    ? details[0]?.transferAccountDetails?.[0]?.address
                    : details[0]?.senderAccountDetails?.[0]?.address) || '-',
              }}
            />

            <Typography className="section-title">Receiver Info</Typography>
            <KeyValueDisplay
              data={{
                'Receiver Name': (details[0]?.extraType === "credit")
                  ? details[0]?.senderAccountDetails?.[0]?.name
                  : (details[0]?.receipient
                    ? details[0]?.recAccountDetails?.[0]?.name
                    : details[0]?.transferAccountDetails?.[0]?.name) || '-',
                'Account No': (details[0]?.extraType === "credit")
                  ? details[0]?.senderAccountDetails?.[0]?.iban
                  : (details[0]?.receipient
                    ? details[0]?.recAccountDetails?.[0]?.iban
                    : details[0]?.transferAccountDetails?.[0]?.iban) || '-',
                'Receiver Address': (details[0]?.extraType === "credit")
                  ? details[0]?.senderAccountDetails?.[0]?.address
                  : (details[0]?.receipient
                    ? details[0]?.recAccountDetails?.[0]?.address
                    : details[0]?.transferAccountDetails?.[0]?.address) || '-',
              }}
            />   
            <Typography className="section-title">Bank Status</Typography>
            <KeyValueDisplay
              data={{
                'Trx': details[0]?.trx || '-',
                'Transfer Amount': details[0]?.amount !== undefined ? `$${details[0]?.amount} (${details[0]?.info || '-'})` : '-',
                'Settle Date': moment(details[0]?.createdAt).format('YYYY-MM-DD hh:mm:ss A'),
                'Transaction Status': details[0]?.status || '-',
              }}
            />

            <Box display="flex" justifyContent="flex-end" gap={2}>
              <CustomButton onClick={handleClose}>Close</CustomButton>
            </Box>
          </>
        ) : selectedRow ? (
          <>
            <Typography className="section-title">Transaction Info</Typography>
            <KeyValueDisplay
              data={{
                'Trx. Id': selectedRow?.trx || '-',
                'Requested Date': selectedRow?.createdAt
                  ? moment(selectedRow?.createdAt).format('YYYY-MM-DD hh:mm:ss:A')
                  : '-',
                'Fee':
                  selectedRow?.extraType === 'debit'
                    ? `${getSymbolFromCurrency(selectedRow?.from_currency)}${parseFloat(selectedRow?.fee).toFixed(2)}`
                    : selectedRow?.tr_type === 'Stripe'
                      ? `${getSymbolFromCurrency(selectedRow?.to_currency)}${parseFloat(selectedRow?.fee).toFixed(2)}`
                      : selectedRow?.trans_type === 'Exchange'
                        ? `${getSymbolFromCurrency(selectedRow?.from_currency)}${parseFloat(selectedRow?.fee).toFixed(2)}`
                        : selectedRow?.fee !== undefined
                          ? `${getSymbolFromCurrency(selectedRow?.from_currency)}${parseFloat(selectedRow?.fee).toFixed(2)}`
                          : '-',
                'Bill Amount':
                  selectedRow?.extraType === 'debit'
                    ? `${getSymbolFromCurrency(selectedRow?.from_currency)}${(
                      parseFloat(selectedRow?.amount) + parseFloat(selectedRow?.fee)
                    ).toFixed(2)}`
                    : selectedRow?.tr_type === 'Stripe'
                      ? `${getSymbolFromCurrency(selectedRow?.to_currency)}${(
                        parseFloat(selectedRow?.amount) + parseFloat(selectedRow?.fee)
                      ).toFixed(2)}`
                      : selectedRow?.trans_type === 'Exchange'
                        ? `${getSymbolFromCurrency(selectedRow?.from_currency)}${(
                          parseFloat(selectedRow?.amount) + parseFloat(selectedRow?.fee)
                        ).toFixed(2)}`
                        : selectedRow?.amount !== undefined
                          ? `${getSymbolFromCurrency(selectedRow?.from_currency)}${(
                            parseFloat(selectedRow?.amount) + parseFloat(selectedRow?.fee)
                          ).toFixed(2)}`
                          : '-',
                'Transaction Type': selectedRow?.receipient
                  ? 'Transfer Money'
                  : `${selectedRow?.extraType || '-'} - ${selectedRow?.trans_type || '-'}`
              }}
            />

            <Typography className="section-title">Sender Info</Typography>
            <KeyValueDisplay
              data={{
                'Sender Name': selectedRow.senderAccountDetails?.[0]?.name || '-',
                'Account No': selectedRow.senderAccountDetails?.[0]?.iban || '-',
                'Sender Address': selectedRow.senderAccountDetails?.[0]?.address || '-',
              }}
            />

            <Typography className="section-title">Receiver Info</Typography>
            <KeyValueDisplay
              data={{
                'Receiver Name': selectedRow.transferAccountDetails?.[0]?.name || '-',
                'Account No': selectedRow.transferAccountDetails?.[0]?.iban || '-',
                'Receiver Address': selectedRow.transferAccountDetails?.[0]?.address || '-',
              }}
            />

            <div className="header-divider" />
            <Box display="flex" justifyContent="space-between" mb={2} mt={4}>
              <Typography>
                <strong>Date:</strong>
              </Typography>
              <Typography>{selectedRow.createdAt?.slice(0, 10)}</Typography>
            </Box>

            <Box display="flex" justifyContent="space-between" mb={2}>
              <Typography>
                <strong>Transaction ID:</strong>
              </Typography>
              <Typography>{selectedRow.trx || '-'}</Typography>
            </Box>

            <Box display="flex" justifyContent="space-between" mb={2}>
              <Typography>
                <strong>Type:</strong>
              </Typography>
              <Typography>{selectedRow.trans_type || '-'}</Typography>
            </Box>

            <Box display="flex" justifyContent="space-between" mb={2}>
              <Typography>
                <strong>Amount:</strong>
              </Typography>
              <Typography>{selectedRow.conversionAmount !== undefined ? selectedRow.conversionAmount : '-'}</Typography>
            </Box>

            <Box display="flex" justifyContent="space-between" mb={2}>
              <Typography>
                <strong>details:</strong>
              </Typography>
              <Typography>{selectedRow.info || '-'}</Typography>
            </Box>
            <Typography>{selectedRow.createdAt?.slice(0, 10) || '-'}</Typography>
            <Typography className="section-title">Bank Status</Typography>
            <KeyValueDisplay
              data={{
                'Trx': selectedRow.trx || '-',
                'Transfer Amount': selectedRow.amount !== undefined ? `$${selectedRow.amount}` : '-',
                'Settle Amount': selectedRow.conversionAmount !== undefined ? `$${selectedRow.conversionAmount}` : '-',
                'TransactionStatus': selectedRow.status || '-',
              }}
            />

            <Box display="flex" justifyContent="flex-end" gap={2}>
              <CustomButton onClick={handleClose}>Close</CustomButton>
            </Box>
          </>
        ) : null}
      </CustomModal>
    </Box>
  );
}

export default FirstSection;

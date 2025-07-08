import { Button, MenuItem, Select } from '@mui/material';
import { Box, Typography, useTheme } from '@mui/material';
import ReactCountryFlag from 'react-country-flag';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import React, { useEffect, useState } from 'react';
import autoTable from 'jspdf-autotable';
import { FileSpreadsheet, FileText } from 'lucide-react';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CustomModal from '../../../../components/CustomModal';
import GenericTable from '../../../../components/common/genericTable';
import { useAppToast } from '@/utils/toast';

import CustomButton from '@/components/CustomButton';
import admin from '@/helpers/adminApiHelper';
import axios from 'axios';
import getSymbolFromCurrency from 'currency-symbol-map';
import api from '@/helpers/apiHelper';
import { toast } from 'sonner';
const url = import.meta.env.VITE_NODE_ENV == "production" ? 'api' : 'api';

const FirstSection = () => {
  const theme = useTheme();
  const toast = useAppToast();
  const [open, setOpen] = useState(false);
  const [modalStatus, setModalStatus] = useState('completed');
  const [selectedRow, setSelectedRow] = useState<any | null>(null);
  const [list, setList] = useState<any>();
  const [currentData, setCurrentData] = useState<any[]>([]);
  const [accountsList, setAccountsList] = useState<any[]>([]);

  const handleOpen = (row: any) => {
    setSelectedRow(row);
    setOpen(true);
    if (row.user) {
      getAllAccountsListOfUser(row.user);
    } else if (row.userDetails?.[0]?._id) {
      getAllAccountsListOfUser(row.userDetails[0]._id);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedRow(null);
    setAccountsList([]);
  };

  const translist = async () => {
    await admin.get(`/${url}/v1/crypto/translist`,
    )
      .then(result => {
        if (result?.data?.status == 201) {
          setList(result?.data?.data);
          setCurrentData(result.data.data);

        }
      })
      .catch(error => {
        console.log(error);
      });
  }

  useEffect(() => {
    translist();
  }, [])

  const getAllAccountsListOfUser = async (id: any) => {
    await admin.get(`/${url}/v1/admin/accountslist/${id}`)
      .then(result => {
        if (result.data.status == 201) {
          setAccountsList(result?.data?.data);
        }
      })
      .catch(error => {
        console.log(error);
      });
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
    { field: 'side', headerName: 'Type' },
    {
      field: 'coin',
      headerName: 'Coin',
      render: (row: any) => (
        <Box display="flex" alignItems="center" gap={1}>
          <img
            src={`https://assets.coincap.io/assets/icons/${row?.coin?.split("_")[0].replace("_TEST", "").toLowerCase()}@2x.png`}
            alt={row.coin}
            width={20}
            height={20}
            style={{ objectFit: 'contain' }}
            onError={(e) => (e.currentTarget.style.display = 'none')}
          />
          <span>{row?.coin?.replace("_TEST", "")}</span>
        </Box>
      )
    },
    {
      field: 'amount',
      headerName: 'Amount',
      render: (row: any) =>
        row?.amount && row?.currencyType ? (
          `${getSymbolFromCurrency(row.currencyType)}${parseFloat(row.amount).toFixed(2)}`
        ) : (
          'N/A'
        ),
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

  const accountsToShow = accountsList;
  const [status, setStatus] = React.useState<any>('');
  const [loaderr, setLoaderr] = React.useState<boolean>(false);

  const HandleUpdateCrypto = async (row: any) => {
    setLoaderr(true);
    await admin.patch(`/${url}/v1/crypto/crypto-update`, {
      id: row?._id,
      status: modalStatus,
      amount: row?.amount,
      userid: row?.user || row?.userDetails?.[0]?._id,
      currencyType: row?.currencyType || row?.fromCurrency
    })
      .then(result => {
        if (result.data.status == 201) {
          setOpen(false);
          setLoaderr(false);
          toast.success(result?.data?.message);
          translist();
        }
      })
      .catch(error => {
        console.log(error);
        setLoaderr(false);
        toast.error(error?.response?.data?.message);
      });
  }
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
      <CustomModal
        open={open}
        onClose={handleClose}
        title="Transaction Details"
        sx={{ backgroundColor: theme.palette.background.default }}
      >
        <Box className="header-Boxusernameer" />
        {selectedRow && (
          <>
            <Box display="flex" justifyContent="space-between" mb={2} mt={4}>
              <Typography><strong>Date:</strong></Typography>
              <Typography>{selectedRow.createdAt.slice(0, 10)}</Typography>
            </Box>

            <Box display="flex" justifyContent="space-between" mb={2}>
              <Typography><strong>Amount:</strong></Typography>
              <Typography>{getSymbolFromCurrency(selectedRow.currencyType)}{selectedRow.amount}</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" mb={2}>
              <Typography><strong>Number Of Coins:</strong></Typography>
              <Typography>{selectedRow.noOfCoins}</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" mb={2}>
              <Typography><strong>Fee:</strong></Typography>
              <Typography>{getSymbolFromCurrency(selectedRow.currencyType)}{selectedRow.fee}</Typography>
            </Box>

            <Box display="flex" justifyContent="space-between" mb={2}>
              <Typography><strong>Type:</strong></Typography>
              <Typography>{selectedRow.side}</Typography>
            </Box>

            <Box display="flex" justifyContent="space-between" mb={2}>
              <Typography><strong>Coin:</strong></Typography>
              <Typography>{selectedRow.coin?.replace("_TEST", "")}</Typography>
            </Box>

            <Box display="flex" justifyContent="space-between" mb={2}>
              <Typography><strong>Status:</strong></Typography>
              <Typography>{selectedRow.status}</Typography>
            </Box>
            {/* Account Cards section */}
            <Box className="accounts-list-section">
              <Box className="accounts-list-header">Accounts List</Box>
              <Box className="accounts-list-grid">
                {accountsToShow.length === 0 ? (
                  <Typography>No accounts found.</Typography>
                ) : (
                  accountsToShow.map((acc) => (
                    <Box className="account-card" key={acc._id} sx={{ backgroundColor: theme.palette.background.gray }} >
                      <Box className="account-card-header">
                        <ReactCountryFlag countryCode={acc.country} svg className="account-flag" />
                        <span className="account-currency">{acc.currency}</span>
                      </Box>
                      <Box className="account-label">{acc.name || '-'}</Box>
                      <Box className="account-amount">${acc.amount !== undefined ? acc.amount.toFixed(2) : '-'}</Box>
                      <Box className="account-no">{acc.iban || '-'}</Box>
                    </Box>
                  ))
                )}
              </Box>
              {selectedRow?.status === "pending" && (
                <Box className="accounts-status-row w-100">
                  <span>Status</span>
                  <Select
                    value={modalStatus}
                    onChange={(e) => setModalStatus(e.target.value)}
                    size="small"
                    className="accounts-status-select"
                  >
                    <MenuItem value="completed">Approved</MenuItem>
                    <MenuItem value="declined">Declined</MenuItem>
                  </Select>
                </Box>
              )}
            </Box>
            <Box display="flex" justifyContent="flex-end" gap={2} >
              <CustomButton onClick={() => HandleUpdateCrypto(selectedRow)}
                loading={loaderr}>Submit</CustomButton>
              <Button className="Custom-button" onClick={handleClose}>Close</Button>
            </Box>
          </>
        )}
      </CustomModal>
    </Box>
  );
};

export default FirstSection;

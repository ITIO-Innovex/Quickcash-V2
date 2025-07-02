import { Box, Typography, Skeleton } from '@mui/material';
import GenericTable from '../../../components/common/genericTable';

const cryptoColumns = [
  { field: 'date', headerName: 'Date' },
  { field: 'coin', headerName: 'Coin' },
  { field: 'paymentType', headerName: 'Payment Type' },
  { field: 'coins', headerName: 'No of Coins' },
  { field: 'side', headerName: 'Side' },
  { field: 'amount', headerName: 'Amount' },
  {
    field: 'status',
    headerName: 'Status',
    render: (row: any) => (
      <span className={`status-chip ${row.status?.toLowerCase()}`}>
        {row.status}
      </span>
    ),
  },
];

interface FourthLeftSectionProps {
  cryptoTransactions: any[];
  loaderResult: boolean;
}

const FourthLeftSection = ({ cryptoTransactions, loaderResult }: FourthLeftSectionProps) => {
  // console.log('Crypto Transactions:', cryptoTransactions);
  const tableData = (cryptoTransactions || []).map((item: any) => ({
    date: item.date || item.createdAt?.slice(0, 10) || '',
    coin: item.coin || item.from_currency || '',
    paymentType: item.paymentType || item.trans_type || '',
    coins: item.coins || item.amount || 0,
    side: item.side || item.extraType || '',
    amount: item.amountText || item.amount || '',
    status: item.status || '',
  }));

  return (
    <Box className="dashboard-box third-left-section" mt={4}>
      <Typography variant="h6" gutterBottom>
        Recent Crypto Transactions
      </Typography>
      {loaderResult ? (
        <Skeleton variant="rectangular" width="100%" height={200} />
      ) : (
        <GenericTable columns={cryptoColumns} data={tableData} />
      )}
    </Box>
  );
};

export default FourthLeftSection;

import { Box, Typography, Skeleton } from '@mui/material';
import GenericTable from '../../../components/common/genericTable';

const columns = [
  { field: 'date', headerName: 'Date' },
  { field: 'trx', headerName: 'Trx ID' },
  { field: 'type', headerName: 'Type' },
  { field: 'amount', headerName: 'Amount' },
  { field: 'detail', headerName: 'Details' },
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
];

interface ThirdRightSectionProps {
  summary: any;
  loaderResult: boolean;
}

const ThirdRightSection = ({ summary, loaderResult }: ThirdRightSectionProps) => {
  // console.log('ThirdRightSection summary:', summary);
 const data = (summary?.transactions || [])
  .slice(0, 7)
  .map((item: any) => ({
    date: item.createdAt?.slice(0, 10) || '',
    trx: item.trx || '',
    type: item.trans_type || item.trans_type || '',
    amount: item.amountText || item.amount || '',
    detail: item.info || '',
    status: item.status || '',
  }));

  return (
    <Box className="dashboard-box third-section">
      <Typography className="box-title">Recent Transactions</Typography>
      {loaderResult ? (
        <Skeleton variant="rectangular" width="100%" height={200} />
      ) : (
        <GenericTable columns={columns} data={data} disablePagination/>
      )}
    </Box>
  );
};

export default ThirdRightSection;

import GenericTable from '@/components/common/genericTable';
import TradingViewWidget from './tradingViewWidget';
import { Box, Typography } from '@mui/material';

type SecondSectionProps = {
  selectedCoin: string;
};

const leftTableData = [
  { Amount: "108944.00000000", qty: "0.06172000", time: "12:49:13 PM" },
  { Amount: "108944.00000000", qty: "0.00610000", time: "12:49:13 PM" },
  { Amount: "108944.01000000", qty: "0.00005000", time: "12:49:13 PM" },
  { Amount: "108944.01000000", qty: "0.00091000", time: "12:49:13 PM" },
  { Amount: "108944.00000000", qty: "0.00013000", time: "12:49:14 PM" },
  { Amount: "108944.01000000", qty: "0.00012000", time: "12:49:14 PM" },
  { Amount: "108944.01000000", qty: "0.00005000", time: "12:49:15 PM" },
  { Amount: "108944.00000000", qty: "0.00012000", time: "12:49:15 PM" },
  { Amount: "108944.00000000", qty: "0.00011000", time: "12:49:15 PM" },
  { Amount: "108944.00000000", qty: "0.21123000", time: "12:49:16 PM" },
];

const leftTableColumns = [
  { field: "Amount", headerName: "Amount" },
  { field: "qty", headerName: "Qty (BTC)" },
  { field: "time", headerName: "Time" },
];

const SecondSection = ({ selectedCoin }: SecondSectionProps) => {
   return (
    <Box className="second-section-container">
      <Box className="s-left">
         <Typography className="box-title">Recent Trades</Typography>
        <GenericTable columns={leftTableColumns} data={leftTableData} />
      </Box>
      <Box className="s-right">
         <TradingViewWidget coin={`BINANCE:${selectedCoin}`} />
      </Box>
    </Box>
  );
}

export default SecondSection
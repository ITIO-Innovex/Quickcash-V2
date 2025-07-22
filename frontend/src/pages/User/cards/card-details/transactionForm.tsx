import React, { useEffect, useState } from "react";
import { Box, Button, TextField, InputAdornment, useTheme } from "@mui/material";
import CustomButton from "@/components/CustomButton";
import CustomTextField from "@/components/CustomTextField";

interface TransactionFormProps {
  transactionCardDetails: any; // Adjust type as needed
  currency?: string;
  onSubmit: (data: { dailyLimit: number | null; monthlyLimit: number | null }) => Promise<void>;
  onClose: () => void;
}

const isDecimal128 = (value: any) => {
  // Implement your Decimal128 check logic if needed
  return value && value.$numberDecimal !== undefined;
};

const TransactionForm: React.FC<TransactionFormProps> = ({
  transactionCardDetails,
  currency = "₹",
  onSubmit,
  onClose,
}) => {
  const theme = useTheme();
  const [dailyLimit, setDailyLimit] = useState<number | null>(null);
  const [monthlyLimit, setMonthlyLimit] = useState<number | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (transactionCardDetails && !isInitialized) {
      const initialDailyLimit = isDecimal128(transactionCardDetails.dailyLimit)
        ? parseFloat(transactionCardDetails.dailyLimit.$numberDecimal)
        : transactionCardDetails.dailyLimit ?? null;

      const initialMonthlyLimit = isDecimal128(transactionCardDetails.monthlyLimit)
        ? parseFloat(transactionCardDetails.monthlyLimit.$numberDecimal)
        : transactionCardDetails.monthlyLimit ?? null;

      setDailyLimit(initialDailyLimit);
      setMonthlyLimit(initialMonthlyLimit);
      setIsInitialized(true);
    }
  }, [transactionCardDetails, isInitialized]);

  const handleDailyLimitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === "") {
      setDailyLimit(null);
    } else {
      const num = parseFloat(val);
      setDailyLimit(isNaN(num) ? null : num);
    }
  };

  const handleMonthlyLimitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === "") {
      setMonthlyLimit(null);
    } else {
      const num = parseFloat(val);
      setMonthlyLimit(isNaN(num) ? null : num);
    }
  };

  const handleSubmit = async () => {
    await onSubmit({
      dailyLimit: dailyLimit ?? 0,
      monthlyLimit: monthlyLimit ?? 0,
    });
    onClose();
  };
  const toTitleCase = (str: string = '') =>
    str
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

  return (
    <Box className="load-card-modal"  >
      {transactionCardDetails?.cardNumber && (
        <Box className="form-group" sx={{ mb: 2 }}>

          {/* Show card currency and user */}
          <Box sx={{ fontSize: '13px', color: 'gray', mt: 0.5 }}>
            <label>Card Number: {transactionCardDetails.cardNumber.replace(/(.{4})/g, '$1 ').trim()}</label>
            {'| Currency:'} <b>{transactionCardDetails.currency}</b>
            {transactionCardDetails.name || transactionCardDetails.user || transactionCardDetails.email ? (
              <>
                {' | User: '}
                <b>{toTitleCase(transactionCardDetails.name || transactionCardDetails.user || transactionCardDetails.email)}</b>
              </>
            ) : null}
          </Box>
        </Box>
      )}

      <Box className="form-row-column">
        <Box className="form-group full-width">
          <label>Daily Transaction Limit</label>
          <CustomTextField
            type="number"
            value={dailyLimit === null ? "" : dailyLimit}
            onChange={handleDailyLimitChange}
            placeholder="₹ 0"
            fullWidth
            size="small"
            inputProps={{ min: 0, step: 0.01 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start" sx={{ color: "black", padding: "0 8px" }}>
                  {currency}
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <Box className="form-group full-width">
          <label>Monthly Transaction Limit</label>
          <CustomTextField
            type="number"
            value={monthlyLimit === null ? "" : monthlyLimit}
            onChange={handleMonthlyLimitChange}
            placeholder="₹ 0"
            fullWidth
            size="small"
            inputProps={{ min: 0, step: 0.01 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start" sx={{ color: "black", padding: "0 8px" }}>
                  {currency}
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </Box>

      <CustomButton fullWidth onClick={handleSubmit}>
        Update Limit
      </CustomButton>
    </Box>
  );
};

export default TransactionForm;

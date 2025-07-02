import { Box, Typography } from "@mui/material";

export const KeyValueDisplay = ({ data }: { data: Record<string, string | number> }) => (
  <>
    {Object.entries(data).map(([key, value]) => (
      <Box display="flex" justifyContent="space-between" mb={2} key={key}>
        <Typography><strong>{key}:</strong></Typography>
         {/* Conditionally render status with class */}
        <Typography className="value">
      {key.toLowerCase().includes('status') ? (
        <span className={`status-chip ${String(value).toLowerCase()}`}>
          {value}
        </span>
      ) : (
        value
      )}
    </Typography>
      </Box>
    ))}
  </>
);

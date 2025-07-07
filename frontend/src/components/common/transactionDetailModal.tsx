import { Dialog, DialogContent, Typography, Grid, Card, CardContent, Button, Stack, List, ListItem, ListItemIcon, ListItemText, IconButton, useTheme, SxProps, Theme, Box
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";

type TransactionDetailModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  transactionData: {
    transactionInfo?: Record<string, any>;
    customerInfo?: Record<string, any>;
    // timeline?: { label: string; date: string; color?: string }[];
    // actions?: { label: string; onClick: () => void }[];
  };
  dialogContentSx?: SxProps<Theme>;
  cardSx?: SxProps<Theme>;
  buttonSx?: SxProps<Theme>;
};

const TransactionDetailModal = ({
  open,
  onClose,
  title,
  transactionData,
  dialogContentSx,
  cardSx,
  buttonSx,
}: TransactionDetailModalProps) => {
  const theme = useTheme();
  const { transactionInfo, customerInfo } = transactionData || {};

   const renderInfoCard = (cardTitle: string, data?: Record<string, any>) => (
    <Card className="transaction-card">
      <CardContent>
        <Typography variant="h6" gutterBottom>{cardTitle}</Typography>
        <Box className="transaction-card-separator" />
        {data && Object.keys(data).length > 0 ? (
          <Grid container spacing={2}>
            {Object.entries(data).map(([key, value]) => (
              <Grid item xs={6} key={key}>
                <Typography className="transaction-card-key">{key}</Typography>
                <Typography>{String(value ?? "N/A")}</Typography>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography color="text.secondary">No data found</Typography>
        )}
      </CardContent>
    </Card>
  );

  // const renderTimelineCard = () => (
  //   <Card className="transaction-card">
  //     <CardContent>
  //       <Typography variant="h6" gutterBottom>Transaction Timeline</Typography>
  //       <Box className="transaction-card-separator" />
  //       {timeline && timeline.length > 0 ? (
  //         <List>
  //           {timeline.map((event, i) => (
  //             <ListItem key={i}>
  //               <ListItemIcon>
  //                 <FiberManualRecordIcon className="transaction-timeline-icon" />
  //               </ListItemIcon>
  //               <ListItemText primary={event.label} secondary={event.date} />
  //             </ListItem>
  //           ))}
  //         </List>
  //       ) : (
  //         <Typography color="text.secondary">No data found</Typography>
  //       )}
  //     </CardContent>
  //   </Card>
  // );

  // const renderActionsCard = () => (
  //   <Card className="transaction-card">
  //     <CardContent>
  //       <Typography variant="h6" gutterBottom>Actions</Typography>
  //       <Box className="transaction-card-separator" />
  //       {actions && actions.length > 0 ? (
  //         <Stack spacing={2}>
  //           {actions.map((action, i) => (
  //             <Button
  //               key={i}
  //               variant="outlined"
  //               fullWidth
  //               className="transaction-action-button"
  //               onClick={action.onClick}
  //             >
  //               {action.label}
  //             </Button>
  //           ))}
  //         </Stack>
  //       ) : (
  //         <Typography color="text.secondary">No actions available</Typography>
  //       )}
  //     </CardContent>
  //   </Card>
  // );

  return (
    <Dialog open={open} onClose={onClose} fullScreen>
      <DialogContent className="transaction-dialog-content">
        <Box className="transaction-header">
          <Box className="transaction-header-info">
            <Typography variant="h5">{title}</Typography>
            <Typography component="p" className="transaction-subtitle">
              View detailed information about this transaction
            </Typography>
          </Box>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Box className="transaction-layout">
          <Box className="transaction-section-left">
            <Stack spacing={3}>
              {renderInfoCard("Transaction Information", transactionInfo)}
              {/* {renderTimelineCard()} */}
            </Stack>
          </Box>

          <Box className="transaction-section-right">
            <Stack spacing={3}>
              {renderInfoCard("Customer Information", customerInfo)}
              {/* {renderActionsCard()} */}
            </Stack>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionDetailModal;

import { toast } from 'sonner';
import CloseIcon from '@mui/icons-material/Close';
import { useTheme } from '@mui/material/styles';
import { IconButton } from '@mui/material';

export const useAppToast = () => {
  const theme = useTheme();

  const baseStyle = {
    background: theme.palette.background.gray,
    color: theme.palette.text.primary,
    position: 'relative' as const,
    paddingRight: '32px',
  };

  const getStyle = (color: string) => ({
    ...baseStyle,
    border: `2px solid ${color}`,
  });

  const renderClose = () => (
    <IconButton
      onClick={() => toast.dismiss()}
      sx={{
        position: 'absolute',
        top: 8,
        right: 8,
        color: theme.palette.text.primary,
      }}
    >
      <CloseIcon fontSize="small" />
    </IconButton>
  );

  return {
    success: (msg: string) =>
      toast.success(msg, {
        duration: 4000,
        style: getStyle(theme.palette.success.main),
        action: renderClose(),
      }),
    error: (msg: string) =>
      toast.error(msg, {
        duration: 4000,
        style: getStyle(theme.palette.error.main),
        action: renderClose(),
      }),
    warning: (msg: string) =>
      toast.warning(msg, {
        duration: 4000,
        style: getStyle(theme.palette.warning.main),
        action: renderClose(),
      }),
    info: (msg: string) =>
      toast.info(msg, {
        duration: 4000,
        style: getStyle(theme.palette.info.main),
        action: renderClose(),
      }),
  };
};

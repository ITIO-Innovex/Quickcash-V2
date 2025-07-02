import React from 'react';
import { Tooltip, TooltipProps, useTheme } from '@mui/material';

interface CommonTooltipProps extends TooltipProps {
  children: React.ReactElement;
}

const CommonTooltip: React.FC<CommonTooltipProps> = ({
  children,
  title,
  placement = 'top',
  arrow = true,
  ...rest
}) => {
  const theme = useTheme();

  return (
    <Tooltip
      title={title}
      placement={placement}
      arrow={arrow}
      componentsProps={{
        tooltip: {
          sx: {
            backgroundColor: theme.palette.background.gray,
            color: theme.palette.text.primary,
            fontSize: '0.875rem',
            boxShadow: 2,
            px: 1.5,
            py: 1,
          },
        },
        arrow: {
          sx: {
            color: theme.palette.background.default,
          },
        },
      }}
      {...rest}
    >
      {children}
    </Tooltip>
  );
};

export default CommonTooltip;

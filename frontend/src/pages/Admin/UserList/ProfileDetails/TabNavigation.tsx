import { useTheme } from '@mui/material/styles';
import { Box, TabsProps, Typography } from '@mui/material';

interface TabNavigationProps {
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  orientation?: TabsProps['orientation']; 
  variant?: TabsProps['variant'];       
}

const TabNavigation = ({
  tabs,
  activeTab,
  onTabChange,
  orientation = 'horizontal', 
  variant,
}: TabNavigationProps) => {
  const theme = useTheme();

  const isVertical = orientation === 'vertical';

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: isVertical ? 'column' : 'row', 
        alignItems: isVertical ? 'flex-start' : 'center',
        borderBottom: isVertical ? 'none' : `1px solid ${theme.palette.divider}`,
        borderRight: isVertical ? `1px solid ${theme.palette.divider}` : 'none',
        backgroundColor: theme.palette.background.default,
      }}
    >
      {tabs.map((tab) => (
        <Box
          key={tab}
          onClick={() => onTabChange(tab)}
          sx={{
            px: 3,
            py: 2,
            cursor: 'pointer',
            borderBottom:
              !isVertical && activeTab === tab ? '2px solid #483594' : 'none',
            borderRight:
              isVertical && activeTab === tab ? '2px solid #483594' : 'none',
            '&:hover': {
              backgroundColor: theme.palette.action.hover,
            },
          }}
        >
          <Typography
            variant="body2"
            sx={{
              fontWeight: activeTab === tab ? 600 : 400,
              color: activeTab === tab ? '#483594' : theme.palette.text.primary,
            }}
          >
            {tab}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

export default TabNavigation;

import { ReactNode, useMemo } from 'react';
import { CssBaseline } from '@mui/material';
import {
  createTheme,
  ThemeProvider,
  StyledEngineProvider,
  ThemeOptions,
  Theme
} from '@mui/material/styles';

// Custom hooks
import { useSettings } from '@/contexts/SettingsContext';

// Theme configuration modules
import shape from './shape';
import palette from './palette';
import typography from './typography';
import breakpoints from './breakpoints';
import componentsOverride from './overrides';
import shadows, { customShadows } from './shadows';

// Define props type
interface ThemeConfigProps {
  children: ReactNode;
}

export default function ThemeConfig({ children }: ThemeConfigProps) {
  const { themeMode } = useSettings();
  const isLight = themeMode === 'light';

  const themeOptions: ThemeOptions = useMemo(
    () => ({
      palette: isLight ? { ...palette.light, mode: 'light' } : { ...palette.dark, mode: 'dark' },
      shape,
      typography,
      breakpoints,
      shadows: isLight ? shadows.light : shadows.dark,
      customShadows: isLight ? customShadows.light : customShadows.dark
    }),
    [isLight]
  );

  const theme: Theme = createTheme(themeOptions);
  theme.components = componentsOverride(theme);

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </StyledEngineProvider>
  );
}

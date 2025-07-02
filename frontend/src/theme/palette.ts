// Define primary and secondary color structure with main and contrastText
interface PaletteColor {
  main: string;           // Main color (e.g., button background)
  contrastText: string;   // Text color on top of main (for contrast)
}

// Common palette shared between light and dark themes
interface CommonPalette {
  primary: PaletteColor;   // Primary brand color
  secondary: PaletteColor; // Secondary accent color
}

// Full theme palette with light/dark mode
interface ThemePalette extends CommonPalette {
  mode: 'light' | 'dark';    // Current theme mode

  text: {
    primary: string;         // Main text color
    secondary: string;       // Subtext or muted text
    gray: string;            // Generic gray text (usually for disabled/hint)
  };

  background: {
    paper: string;           // Surface background (like cards, modals)
    default: string;         // Page background
    gray: string;            // Neutral background (e.g., placeholders, borders)
  };

  pages: {
    background: string;      // Background color specifically for pages
  };
}

// Shared brand colors
const COMMON: CommonPalette = {
  primary: { main: '#00AB55', contrastText: '#fff' },   // Green brand color with white text
  secondary: { main: '#3366FF', contrastText: '#fff' }, // Blue accent color with white text
};

// Theme palettes for light and dark mode
const palette = {
  light: {
    ...COMMON,
    mode: 'light',

    text: {
      primary: '#000',   // Default text color - black
      secondary: '#000', // Secondary text color - black
      gray: '#888',      // Used for hints, placeholders, etc.
    },

    background: {
      paper: '#fff',     // Card/modal surfaces - white
      default: '#fff',   // Full page background - white
      gray: '#ccc',      // Light gray for disabled/bg elements
    },

    navbar: {
      background: 'rgb(242, 240, 249)', // Light purple navbar bg
      text: 'rgb(72, 53, 148)',         // Deep purple text for navbar items
    },

    pages: {
      background: '#d6d5d5', // Light gray for dashboard/page content background
    },
  },

  dark: {
    ...COMMON,
    mode: 'dark',

    text: {
      primary: '#fff',   // Default text - white
      secondary: '#000', // Muted text - black
      gray: '#fff',      // In dark mode, gray text is still white for visibility
    },

    background: {
      paper: '#222',     // Dark gray for card/modal backgrounds
      default: '#2E073F',// Deep purple for full background
      gray: '#444',      // Gray used in disabled states/placeholders
    },

    navbar: {
      background: '#2E073F', // Dark purple navbar background
      text: '#fff',          // White text for navbar
    },

    pages: {
      background: '#adacac', // Mid gray for page background (not fully dark)
    },
  },
} as const;

export default palette;

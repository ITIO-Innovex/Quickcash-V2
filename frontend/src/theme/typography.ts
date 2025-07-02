import { Theme } from '@mui/material/styles';

const typography = {
  fontFamily: `'Fira Sans', sans-serif`,
  fontWeightRegular: 400,
  fontWeightMedium: 600,
  fontWeightBold: 700,
  h1: { fontWeight: 700, fontSize: '3.5rem' },
  h2: { fontWeight: 700, fontSize: '3rem' },
  h3: { fontWeight: 700, fontSize: '2.25rem' },
  h4: { fontWeight: 700, fontSize: '1.5rem' },
  h5: { fontWeight: 700, fontSize: '1.25rem' },
  h6: { fontWeight: 700, fontSize: '1rem' },
  subtitle1: { fontSize: '1rem', fontWeight: 600 },
  subtitle2: { fontSize: '0.875rem', fontWeight: 600 },
  body1: { fontSize: '1rem' },
  body2: { fontSize: '0.875rem' },
  button: { fontWeight: 600 },
} as const;

export default typography; 
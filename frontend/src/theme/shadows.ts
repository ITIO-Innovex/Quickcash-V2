import { Shadows } from '@mui/material/styles';

const GREY = {
  500: '#919EAB',
};

const COMMON = {
  z1: `0 1px 2px 0 rgba(0,0,0,0.05)`,
  z8: `0 8px 16px 0 rgba(0,0,0,0.08)`,
};

const lightShadows: Shadows = [
  'none',
  `0 1px 2px 0 rgba(0,0,0,0.05)`,
  `0 1px 3px 0 rgba(0,0,0,0.1)`,
  `0 1px 5px 0 rgba(0,0,0,0.1)`,
  `0 2px 4px -1px rgba(0,0,0,0.1)`,
  `0 3px 6px -1px rgba(0,0,0,0.1)`,
  `0 4px 8px -1px rgba(0,0,0,0.1)`,
  `0 5px 10px -1px rgba(0,0,0,0.1)`,
  `0 6px 12px -1px rgba(0,0,0,0.1)`,
  `0 7px 14px -1px rgba(0,0,0,0.1)`,
  `0 8px 16px -1px rgba(0,0,0,0.1)`,
  `0 9px 18px -1px rgba(0,0,0,0.1)`,
  `0 10px 20px -1px rgba(0,0,0,0.1)`,
  `0 11px 22px -1px rgba(0,0,0,0.1)`,
  `0 12px 24px -1px rgba(0,0,0,0.1)`,
  `0 13px 26px -1px rgba(0,0,0,0.1)`,
  `0 14px 28px -1px rgba(0,0,0,0.1)`,
  `0 15px 30px -1px rgba(0,0,0,0.1)`,
  `0 16px 32px -1px rgba(0,0,0,0.1)`,
  `0 17px 34px -1px rgba(0,0,0,0.1)`,
  `0 18px 36px -1px rgba(0,0,0,0.1)`,
  `0 19px 38px -1px rgba(0,0,0,0.1)`,
  `0 20px 40px -1px rgba(0,0,0,0.1)`,
  `0 21px 42px -1px rgba(0,0,0,0.1)`,
  `0 22px 44px -1px rgba(0,0,0,0.1)`,
];

const darkShadows: Shadows = [
  'none',
  `0 1px 2px 0 rgba(0,0,0,0.2)`,
  `0 1px 3px 0 rgba(0,0,0,0.3)`,
  `0 1px 5px 0 rgba(0,0,0,0.3)`,
  `0 2px 4px -1px rgba(0,0,0,0.3)`,
  `0 3px 6px -1px rgba(0,0,0,0.3)`,
  `0 4px 8px -1px rgba(0,0,0,0.3)`,
  `0 5px 10px -1px rgba(0,0,0,0.3)`,
  `0 6px 12px -1px rgba(0,0,0,0.3)`,
  `0 7px 14px -1px rgba(0,0,0,0.3)`,
  `0 8px 16px -1px rgba(0,0,0,0.3)`,
  `0 9px 18px -1px rgba(0,0,0,0.3)`,
  `0 10px 20px -1px rgba(0,0,0,0.3)`,
  `0 11px 22px -1px rgba(0,0,0,0.3)`,
  `0 12px 24px -1px rgba(0,0,0,0.3)`,
  `0 13px 26px -1px rgba(0,0,0,0.3)`,
  `0 14px 28px -1px rgba(0,0,0,0.3)`,
  `0 15px 30px -1px rgba(0,0,0,0.3)`,
  `0 16px 32px -1px rgba(0,0,0,0.3)`,
  `0 17px 34px -1px rgba(0,0,0,0.3)`,
  `0 18px 36px -1px rgba(0,0,0,0.3)`,
  `0 19px 38px -1px rgba(0,0,0,0.3)`,
  `0 20px 40px -1px rgba(0,0,0,0.3)`,
  `0 21px 42px -1px rgba(0,0,0,0.3)`,
  `0 22px 44px -1px rgba(0,0,0,0.3)`,
];

export const customShadows = {
  light: { dropdown: `0 0 2px 0 rgba(145, 158, 171, 0.24), -20px 20px 40px -4px rgba(145, 158, 171, 0.24)` },
  dark: { dropdown: `0 0 2px 0 rgba(0,0,0,0.24), -20px 20px 40px -4px rgba(0,0,0,0.24)` },
};

const shadows = { light: lightShadows, dark: darkShadows };
export default shadows; 
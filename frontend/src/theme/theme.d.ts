import '@mui/material/styles';

declare module '@mui/material/styles' {
  interface TypeText {
    gray: string;
  }
    interface TypeBackground {
    gray: string;
  }
  
  interface Palette {
    navbar: {
      background: string;
      text: string;
    };
    background: Palette['background'] & {
      gray: string;
    };
     pages: {
      background: string;
    };
  }

  interface PaletteOptions {
    navbar?: {
      background?: string;
      text?: string;
    };
    background?: PaletteOptions['background'] & {
      gray?: string;
    };
    text?: Partial<TypeText> & {
      gray?: string;
    };
     pages?: {
      background?: string;
    };
  }
}

import type { ReactNode } from 'react';
import { createTheme, CssBaseline, ThemeProvider } from '@mui/material';

export const magicMuiTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#6750A4',
    },
    secondary: {
      main: '#625B71',
    },
    error: {
      main: '#B3261E',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 9999,
          fontWeight: 600,
        },
      },
    },
  },
});

export interface MagicMuiThemeProviderProps {
  children: ReactNode;
}

export function MagicMuiThemeProvider({ children }: MagicMuiThemeProviderProps) {
  return (
    <ThemeProvider theme={magicMuiTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}

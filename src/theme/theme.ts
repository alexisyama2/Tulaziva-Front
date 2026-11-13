import { alpha, createTheme, type Theme } from '@mui/material/styles';

// Soft blue and white. To try green instead, change these two (and hero below), e.g. '#3E9C7F' and '#7CCBA9'.
const primary = '#3D7FCB';
const secondary = '#6CB4EE';

export const gradients = {
  brand: `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`,
  hero: 'linear-gradient(135deg, #2C6CB0 0%, #4F9BDB 55%, #8EC5F0 100%)',
};

export type ColorMode = 'light' | 'dark';

/** Background of the chat message area (a bit apart from the paper surfaces). */
export const chatBackground = (theme: Theme) => (theme.palette.mode === 'dark' ? '#0B1523' : '#EAF2FA');

export function createAppTheme(mode: ColorMode) {
  const dark = mode === 'dark';

  return createTheme({
    palette: {
      mode,
      primary: { main: dark ? '#7DB6EE' : primary, light: '#8EC5F0', dark: '#2C6CB0', contrastText: dark ? '#0B1523' : '#fff' },
      secondary: { main: secondary, contrastText: '#0B2A4A' },
      background: dark ? { default: '#0B1523', paper: '#122238' } : { default: '#F4F8FC', paper: '#FFFFFF' },
      text: dark ? { primary: '#EAF2FB', secondary: '#9DB2CA' } : { primary: '#16324F', secondary: '#5B7089' },
      divider: alpha(dark ? '#FFFFFF' : '#16324F', dark ? 0.12 : 0.1),
    },
    shape: { borderRadius: 14 },
    typography: {
      fontFamily: '"Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
      h1: { fontWeight: 800, letterSpacing: '-0.03em' },
      h2: { fontWeight: 800, letterSpacing: '-0.025em' },
      h3: { fontWeight: 700, letterSpacing: '-0.02em' },
      h4: { fontWeight: 700, letterSpacing: '-0.02em' },
      h5: { fontWeight: 700 },
      h6: { fontWeight: 700 },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: { body: { WebkitFontSmoothing: 'antialiased' } },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: { borderRadius: 12, paddingInline: 20 },
          containedPrimary: {
            color: dark ? '#0B1523' : '#fff',
            background: gradients.brand,
            '&:hover': { background: 'linear-gradient(135deg, #2F6DB8 0%, #4FA0E2 100%)' },
            '&.Mui-disabled': { background: undefined },
          },
          sizeLarge: { paddingBlock: 12, fontSize: '1rem' },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow: dark ? '0 1px 2px rgba(0,0,0,.4), 0 8px 24px rgba(0,0,0,.3)' : '0 1px 2px rgba(22,50,79,.06), 0 8px 24px rgba(22,50,79,.07)',
            backgroundImage: 'none',
          },
        },
      },
      MuiPaper: { styleOverrides: { rounded: { backgroundImage: 'none' } } },
      MuiTextField: { defaultProps: { variant: 'outlined', size: 'medium' } },
      MuiOutlinedInput: { styleOverrides: { root: { borderRadius: 12 } } },
      MuiChip: { styleOverrides: { root: { fontWeight: 600 } } },
      MuiAppBar: { defaultProps: { elevation: 0 }, styleOverrides: { root: { backgroundImage: 'none' } } },
      MuiTooltip: { defaultProps: { arrow: true } },
    },
  });
}

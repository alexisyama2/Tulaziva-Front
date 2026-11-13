import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { CssBaseline, ThemeProvider, useMediaQuery } from '@mui/material';
import { createAppTheme, type ColorMode } from '@/theme/theme';

const KEY = 'tulaziva.mode';

interface ColorModeState {
  mode: ColorMode;
  toggle: () => void;
}

const ColorModeContext = createContext<ColorModeState | null>(null);

/** Light/dark theme. Starts from the saved choice, otherwise from the OS preference. */
export function ColorModeProvider({ children }: { children: ReactNode }) {
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
  const [saved, setSaved] = useState<ColorMode | null>(() => {
    const v = localStorage.getItem(KEY);
    return v === 'light' || v === 'dark' ? v : null;
  });
  const mode: ColorMode = saved ?? (prefersDark ? 'dark' : 'light');

  useEffect(() => {
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', mode === 'dark' ? '#0B1523' : '#3D7FCB');
  }, [mode]);

  const value = useMemo<ColorModeState>(
    () => ({
      mode,
      toggle: () => {
        const next: ColorMode = mode === 'dark' ? 'light' : 'dark';
        localStorage.setItem(KEY, next);
        setSaved(next);
      },
    }),
    [mode],
  );
  const theme = useMemo(() => createAppTheme(mode), [mode]);

  return (
    <ColorModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useColorMode(): ColorModeState {
  const ctx = useContext(ColorModeContext);
  if (!ctx) throw new Error('useColorMode must be used inside ColorModeProvider');
  return ctx;
}

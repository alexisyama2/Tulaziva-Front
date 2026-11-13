import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { Alert, Snackbar, type AlertColor } from '@mui/material';

interface Notice {
  key: number;
  message: string;
  severity: AlertColor;
}

interface NotificationApi {
  notify: (message: string, severity?: AlertColor) => void;
  success: (message: string) => void;
  error: (message: string) => void;
}

const NotificationContext = createContext<NotificationApi | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notice, setNotice] = useState<Notice | null>(null);
  const [open, setOpen] = useState(false);

  const notify = useCallback((message: string, severity: AlertColor = 'info') => {
    setNotice({ key: Date.now(), message, severity });
    setOpen(true);
  }, []);

  const api = useMemo<NotificationApi>(
    () => ({
      notify,
      success: (m) => notify(m, 'success'),
      error: (m) => notify(m, 'error'),
    }),
    [notify],
  );

  return (
    <NotificationContext.Provider value={api}>
      {children}
      <Snackbar
        key={notice?.key}
        open={open}
        autoHideDuration={4500}
        onClose={(_, reason) => reason !== 'clickaway' && setOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={notice?.severity ?? 'info'} variant="filled" onClose={() => setOpen(false)} sx={{ width: '100%' }}>
          {notice?.message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useNotify(): NotificationApi {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotify must be used inside NotificationProvider');
  return ctx;
}

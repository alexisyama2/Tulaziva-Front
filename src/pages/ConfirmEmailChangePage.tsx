import { useEffect, useRef } from 'react';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Alert, Button, CircularProgress, Container, Paper, Stack, Typography } from '@mui/material';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailReadOutlined';
import { useTranslation } from 'react-i18next';
import { authApi, tokenStore, usersApi } from '@/api';
import { errorMessages } from '@/components/common/ErrorState';
import { useAuth } from '@/context/AuthContext';

/** The page the link sent to the new address opens. It switches the account to that address at once. */
export default function ConfirmEmailChangePage() {
  const { t } = useTranslation();
  const token = useSearchParams()[0].get('token') ?? '';
  const { setUser } = useAuth();
  const started = useRef(false);

  const confirm = useMutation({
    mutationFn: async () => {
      await authApi.confirmEmailChange(token);
      // Someone signed in here must see the new address without signing in again.
      if (tokenStore.get()) setUser(await usersApi.me());
    },
  });

  // The token works once: React's StrictMode runs effects twice in development, so a ref keeps it to one call.
  useEffect(() => {
    if (token && !started.current) {
      started.current = true;
      confirm.mutate();
    }
  }, [token, confirm]);

  return (
    <Container maxWidth="xs" sx={{ py: 10 }}>
      <Paper sx={{ p: 4, borderRadius: 5, textAlign: 'center' }}>
        <Stack gap={2.5} alignItems="center">
          {!token ? (
            <Alert severity="error" sx={{ width: '100%' }}>{t('verify.missingToken')}</Alert>
          ) : confirm.isError ? (
            <>
              <Alert severity="error" sx={{ width: '100%', textAlign: 'left' }}>
                {errorMessages(confirm.error, t('errors.generic')).map((m) => <div key={m}>{m}</div>)}
              </Alert>
              <Typography color="text.secondary">{t('confirmEmail.failedHint')}</Typography>
            </>
          ) : confirm.isSuccess ? (
            <>
              <MarkEmailReadIcon color="success" sx={{ fontSize: 64 }} />
              <Typography variant="h5">{t('confirmEmail.doneTitle')}</Typography>
              <Typography color="text.secondary">{t('confirmEmail.doneText')}</Typography>
            </>
          ) : (
            <>
              <CircularProgress />
              <Typography color="text.secondary">{t('confirmEmail.checking')}</Typography>
            </>
          )}
          <Button component={RouterLink} to="/" variant="contained">{t('notFound.home')}</Button>
        </Stack>
      </Paper>
    </Container>
  );
}

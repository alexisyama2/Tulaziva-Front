import { useEffect, useRef } from 'react';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Alert, Button, CircularProgress, Container, Paper, Stack, Typography } from '@mui/material';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailReadOutlined';
import { useTranslation } from 'react-i18next';
import { authApi, tokenStore, usersApi } from '@/api';
import { errorMessages } from '@/components/common/ErrorState';
import { useAuth } from '@/context/AuthContext';

/** The page the link of the verification email opens. It confirms the address at once. */
export default function VerifyEmailPage() {
  const { t } = useTranslation();
  const token = useSearchParams()[0].get('token') ?? '';
  const { setUser } = useAuth();
  const started = useRef(false);

  const verify = useMutation({
    mutationFn: async () => {
      await authApi.verifyEmail(token);
      // Someone signed in here must see the banner go away without signing in again. The session may still be loading, so the
      // token decides, not the user state.
      if (tokenStore.get()) setUser(await usersApi.me());
    },
  });

  // The token works once: React's StrictMode runs effects twice in development, so a ref keeps it to one call.
  useEffect(() => {
    if (token && !started.current) {
      started.current = true;
      verify.mutate();
    }
  }, [token, verify]);

  return (
    <Container maxWidth="xs" sx={{ py: 10 }}>
      <Paper sx={{ p: 4, borderRadius: 5, textAlign: 'center' }}>
        <Stack gap={2.5} alignItems="center">
          {!token ? (
            <Alert severity="error" sx={{ width: '100%' }}>{t('verify.missingToken')}</Alert>
          ) : verify.isError ? (
            <>
              <Alert severity="error" sx={{ width: '100%', textAlign: 'left' }}>
                {errorMessages(verify.error, t('errors.generic')).map((m) => <div key={m}>{m}</div>)}
              </Alert>
              <Typography color="text.secondary">{t('verify.failedHint')}</Typography>
            </>
          ) : verify.isSuccess ? (
            <>
              <MarkEmailReadIcon color="success" sx={{ fontSize: 64 }} />
              <Typography variant="h5">{t('verify.doneTitle')}</Typography>
              <Typography color="text.secondary">{t('verify.doneText')}</Typography>
            </>
          ) : (
            <>
              <CircularProgress />
              <Typography color="text.secondary">{t('verify.checking')}</Typography>
            </>
          )}
          <Button component={RouterLink} to="/" variant="contained">{t('notFound.home')}</Button>
        </Stack>
      </Paper>
    </Container>
  );
}

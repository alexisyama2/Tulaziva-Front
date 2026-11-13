import { useState } from 'react';
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Alert, Box, Button, CircularProgress, Link, Stack, TextField, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { authApi } from '@/api';
import AuthLayout from '@/components/layout/AuthLayout';
import { errorMessages } from '@/components/common/ErrorState';
import { useNotify } from '@/context/NotificationContext';

export default function ResetPasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { success } = useNotify();
  const token = useSearchParams()[0].get('token') ?? '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [touched, setTouched] = useState(false);

  const reset = useMutation({
    mutationFn: () => authApi.resetPassword(token, password),
    onSuccess: () => {
      success(t('reset.done'));
      navigate('/login', { replace: true });
    },
  });

  const mismatch = confirm !== password;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (password && !mismatch) reset.mutate();
  };

  // Someone who opens the page without the link has nothing to do here but ask for one.
  if (!token)
    return (
      <AuthLayout title={t('reset.title')} subtitle={t('reset.missingToken')}>
        <Button component={RouterLink} to="/forgot-password" variant="contained" fullWidth>{t('reset.requestNew')}</Button>
      </AuthLayout>
    );

  return (
    <AuthLayout title={t('reset.title')} subtitle={t('reset.subtitle')}>
      <Box component="form" onSubmit={submit} noValidate>
        <Stack gap={2.5}>
          {reset.error && (
            <Alert severity="error">
              {errorMessages(reset.error, t('errors.generic')).map((m) => <div key={m}>{m}</div>)}
              <Link component={RouterLink} to="/forgot-password" sx={{ display: 'block', mt: 0.5 }}>{t('reset.requestNew')}</Link>
            </Alert>
          )}
          <TextField
            label={t('reset.newPassword')}
            type="password"
            autoComplete="new-password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={touched && !password}
            helperText={touched && !password ? t('auth.passwordRequired') : t('auth.passwordHint')}
          />
          <TextField
            label={t('reset.confirm')}
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            error={touched && mismatch}
            helperText={touched && mismatch ? t('reset.mismatch') : ''}
          />
          <Button type="submit" variant="contained" size="large" disabled={reset.isPending} startIcon={reset.isPending ? <CircularProgress size={18} color="inherit" /> : undefined}>
            {t('reset.submit')}
          </Button>
          <Typography textAlign="center">
            <Link component={RouterLink} to="/login" fontWeight={700}>{t('forgot.backToLogin')}</Link>
          </Typography>
        </Stack>
      </Box>
    </AuthLayout>
  );
}

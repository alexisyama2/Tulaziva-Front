import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Alert, Box, Button, CircularProgress, Link, Stack, TextField, Typography } from '@mui/material';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailReadOutlined';
import { useTranslation } from 'react-i18next';
import { authApi } from '@/api';
import AuthLayout from '@/components/layout/AuthLayout';
import { errorMessages } from '@/components/common/ErrorState';

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [touched, setTouched] = useState(false);
  const ask = useMutation({ mutationFn: () => authApi.forgotPassword(email.trim()) });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (email.trim()) ask.mutate();
  };

  return (
    <AuthLayout title={t('forgot.title')} subtitle={t('forgot.subtitle')}>
      {ask.isSuccess ? (
        // The API answers the same whether the address has an account or not, so the text must not say which.
        <Stack gap={2.5} alignItems="center" textAlign="center">
          <MarkEmailReadIcon color="primary" sx={{ fontSize: 56 }} />
          <Typography>{t('forgot.sent', { email: email.trim() })}</Typography>
          <Button component={RouterLink} to="/login" variant="contained">{t('forgot.backToLogin')}</Button>
        </Stack>
      ) : (
        <Box component="form" onSubmit={submit} noValidate>
          <Stack gap={2.5}>
            {ask.error && <Alert severity="error">{errorMessages(ask.error, t('errors.generic')).map((m) => <div key={m}>{m}</div>)}</Alert>}
            <TextField
              label={t('auth.email')}
              type="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={touched && !email.trim()}
              helperText={touched && !email.trim() ? t('auth.emailRequired') : ''}
            />
            <Button type="submit" variant="contained" size="large" disabled={ask.isPending} startIcon={ask.isPending ? <CircularProgress size={18} color="inherit" /> : undefined}>
              {t('forgot.submit')}
            </Button>
            <Typography textAlign="center">
              <Link component={RouterLink} to="/login" fontWeight={700}>{t('forgot.backToLogin')}</Link>
            </Typography>
          </Stack>
        </Box>
      )}
    </AuthLayout>
  );
}

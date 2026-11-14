import { useState } from 'react';
import { Link as RouterLink, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Alert, Box, Button, CircularProgress, Link, Stack, TextField, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import AuthLayout from '@/components/layout/AuthLayout';
import { errorMessages } from '@/components/common/ErrorState';
import { useAuth } from '@/context/AuthContext';
import { useNotify } from '@/context/NotificationContext';
import PasswordField from '@/components/common/PasswordField';

export default function LoginPage() {
  const { t } = useTranslation();
  const { user, login } = useAuth();
  const { success } = useNotify();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [touched, setTouched] = useState(false);

  if (user) return <Navigate to={from} replace />;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!email.trim() || !password) return;
    setBusy(true);
    setErrors([]);
    try {
      const u = await login(email.trim(), password);
      success(t('auth.welcome', { name: u.displayName }));
      navigate(from, { replace: true });
    } catch (err) {
      setErrors(errorMessages(err, t('errors.generic')));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout title={t('auth.loginTitle')} subtitle={t('auth.loginSubtitle')}>
      <Box component="form" onSubmit={submit} noValidate>
        <Stack gap={2.5}>
          {errors.length > 0 && <Alert severity="error">{errors.map((m) => <div key={m}>{m}</div>)}</Alert>}
          <TextField label={t('auth.email')} type="email" autoComplete="email" autoFocus value={email} onChange={(e) => setEmail(e.target.value)} error={touched && !email.trim()} helperText={touched && !email.trim() ? t('auth.emailRequired') : ''} />
          <PasswordField label={t('auth.password')} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} error={touched && !password} helperText={touched && !password ? t('auth.passwordRequired') : ''} />
          <Link component={RouterLink} to="/forgot-password" variant="body2" sx={{ alignSelf: 'flex-end', mt: -1 }}>
            {t('auth.forgotLink')}
          </Link>
          <Button type="submit" variant="contained" size="large" disabled={busy} startIcon={busy ? <CircularProgress size={18} color="inherit" /> : undefined}>
            {t('nav.login')}
          </Button>
          <Typography textAlign="center" color="text.secondary">
            {t('auth.noAccount')}{' '}
            <Link component={RouterLink} to="/register" state={{ from }} fontWeight={700}>{t('nav.register')}</Link>
          </Typography>
        </Stack>
      </Box>
    </AuthLayout>
  );
}

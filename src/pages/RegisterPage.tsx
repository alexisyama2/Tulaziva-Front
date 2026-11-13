import { useState } from 'react';
import { Link as RouterLink, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Alert, Box, Button, Checkbox, CircularProgress, FormControlLabel, Link, Stack, TextField, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import AuthLayout from '@/components/layout/AuthLayout';
import { errorMessages } from '@/components/common/ErrorState';
import { useAuth } from '@/context/AuthContext';
import { useNotify } from '@/context/NotificationContext';
import { useGeolocation } from '@/hooks/useGeolocation';

export default function RegisterPage() {
  const { t } = useTranslation();
  const { user, register } = useAuth();
  const { success } = useNotify();
  const geo = useGeolocation();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/';

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [shareLocation, setShareLocation] = useState(true);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [touched, setTouched] = useState(false);

  if (user) return <Navigate to={from} replace />;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!displayName.trim() || !email.trim() || !password) return;
    setBusy(true);
    setErrors([]);
    try {
      // The location is optional: if the browser denies it we register without it.
      const coords = shareLocation ? await geo.locate() : null;
      const u = await register({
        displayName: displayName.trim(),
        email: email.trim(),
        password,
        latitude: coords?.latitude ?? null,
        longitude: coords?.longitude ?? null,
      });
      success(t('auth.welcome', { name: u.displayName }));
      navigate(from, { replace: true });
    } catch (err) {
      setErrors(errorMessages(err, t('errors.generic')));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout title={t('auth.registerTitle')} subtitle={t('auth.registerSubtitle')}>
      <Box component="form" onSubmit={submit} noValidate>
        <Stack gap={2.5}>
          {errors.length > 0 && <Alert severity="error">{errors.map((m) => <div key={m}>{m}</div>)}</Alert>}
          <TextField label={t('auth.displayName')} autoComplete="name" autoFocus value={displayName} onChange={(e) => setDisplayName(e.target.value)} slotProps={{ htmlInput: { maxLength: 100 } }} error={touched && !displayName.trim()} helperText={touched && !displayName.trim() ? t('auth.nameRequired') : ''} />
          <TextField label={t('auth.email')} type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} error={touched && !email.trim()} helperText={touched && !email.trim() ? t('auth.emailRequired') : ''} />
          <TextField label={t('auth.password')} type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} error={touched && !password} helperText={touched && !password ? t('auth.passwordRequired') : t('auth.passwordHint')} />
          <FormControlLabel control={<Checkbox checked={shareLocation} onChange={(e) => setShareLocation(e.target.checked)} />} label={<Typography variant="body2">{t('auth.shareLocation')}</Typography>} />
          <Button type="submit" variant="contained" size="large" disabled={busy} startIcon={busy ? <CircularProgress size={18} color="inherit" /> : undefined}>
            {t('nav.register')}
          </Button>
          <Typography textAlign="center" color="text.secondary">
            {t('auth.haveAccount')}{' '}
            <Link component={RouterLink} to="/login" state={{ from }} fontWeight={700}>{t('nav.login')}</Link>
          </Typography>
        </Stack>
      </Box>
    </AuthLayout>
  );
}

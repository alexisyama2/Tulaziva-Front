import { useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Divider,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCameraOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import MyLocationIcon from '@mui/icons-material/MyLocationRounded';
import VerifiedIcon from '@mui/icons-material/VerifiedOutlined';
import { useTranslation } from 'react-i18next';
import { usersApi } from '@/api';
import UserAvatar from '@/components/common/UserAvatar';
import { errorMessages } from '@/components/common/ErrorState';
import { useAuth } from '@/context/AuthContext';
import { useNotify } from '@/context/NotificationContext';
import { useGeolocation } from '@/hooks/useGeolocation';
import { BlockedUsersSection, DeleteAccountSection, EmailSection } from '@/components/profile/AccountSections';
import { formatDate } from '@/utils/format';
import type { Language, User } from '@/types/api';

const MAX_BYTES = 5 * 1024 * 1024;

function ErrorList({ error }: { error: unknown }) {
  const { t } = useTranslation();
  return (
    <Alert severity="error">
      {errorMessages(error, t('errors.generic')).map((m) => (
        <div key={m}>{m}</div>
      ))}
    </Alert>
  );
}

function PhotoSection({ user }: { user: User }) {
  const { t } = useTranslation();
  const { setUser } = useAuth();
  const { success, error } = useNotify();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const run = async (action: () => Promise<User>, okMessage: string) => {
    setBusy(true);
    try {
      setUser(await action());
      success(okMessage);
    } catch (e) {
      error(errorMessages(e, t('errors.generic')).join(' '));
    } finally {
      setBusy(false);
    }
  };

  const onPick = (file?: File) => {
    if (input.current) input.current.value = '';
    if (!file) return;
    if (!/\.(jpe?g|png)$/i.test(file.name) || file.size > MAX_BYTES) return error(t('profile.photoHint'));
    void run(() => usersApi.setPhoto(file), t('profile.photoUpdated'));
  };

  return (
    <Stack alignItems="center" gap={1.5}>
      <Box sx={{ position: 'relative' }}>
        <UserAvatar name={user.displayName} photoUrl={user.photoUrl} size={120} />
        {busy && <CircularProgress size={120} sx={{ position: 'absolute', inset: 0 }} />}
      </Box>
      <Typography variant="h5">{user.displayName}</Typography>
      <Stack direction="row" gap={1} alignItems="center" flexWrap="wrap" justifyContent="center">
        <Typography color="text.secondary">{user.email}</Typography>
        {user.emailVerified && <Chip size="small" color="success" variant="outlined" icon={<VerifiedIcon />} label={t('profile.verified')} />}
        <Chip label={user.role === 'Admin' ? t('profile.roleAdmin') : t('profile.roleUser')} color={user.role === 'Admin' ? 'secondary' : 'default'} size="small" />
      </Stack>
      <Typography variant="body2" color="text.secondary">{t('profile.memberSince', { date: formatDate(user.createdAtUtc) })}</Typography>

      <Stack direction="row" gap={1.5} sx={{ mt: 1 }}>
        <Button variant="contained" startIcon={<PhotoCameraIcon />} disabled={busy} onClick={() => input.current?.click()}>
          {t('profile.changePhoto')}
        </Button>
        {user.photoUrl && (
          <Button color="error" startIcon={<DeleteIcon />} disabled={busy} onClick={() => run(usersApi.removePhoto, t('profile.photoRemoved'))}>
            {t('profile.removePhoto')}
          </Button>
        )}
      </Stack>
      <Typography variant="caption" color="text.secondary">{t('profile.photoHint')}</Typography>
      <input ref={input} type="file" hidden accept=".jpg,.jpeg,.png" onChange={(e) => onPick(e.target.files?.[0])} />
    </Stack>
  );
}

function DetailsSection({ user }: { user: User }) {
  const { t, i18n } = useTranslation();
  const { setUser } = useAuth();
  const { success } = useNotify();
  const geo = useGeolocation();
  const [displayName, setDisplayName] = useState(user.displayName);
  const [language, setLanguage] = useState<Language>(user.preferredLanguage === 'en' ? 'en' : 'es');
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [touched, setTouched] = useState(false);

  const save = useMutation({
    mutationFn: () =>
      usersApi.update({ displayName: displayName.trim(), language, latitude: location?.latitude ?? null, longitude: location?.longitude ?? null }),
    onSuccess: async (updated) => {
      setUser(updated);
      setLocation(null);
      // The language of the profile is also the one of the app and of the emails.
      if (updated.preferredLanguage !== i18n.resolvedLanguage) await i18n.changeLanguage(updated.preferredLanguage);
      success(t('profile.saved'));
    },
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (displayName.trim()) save.mutate();
  };

  const useMyLocation = async () => {
    const c = await geo.locate();
    if (c) setLocation(c);
  };

  const hasLocation = user.latitude != null && user.longitude != null;

  return (
    <Box component="form" onSubmit={submit} noValidate>
      <Stack gap={2.5}>
        <Typography variant="h6">{t('profile.details')}</Typography>
        {save.error && <ErrorList error={save.error} />}
        <TextField
          label={t('auth.displayName')}
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          slotProps={{ htmlInput: { maxLength: 100 } }}
          error={touched && !displayName.trim()}
          helperText={touched && !displayName.trim() ? t('auth.nameRequired') : ''}
        />
        <TextField select label={t('profile.language')} value={language} onChange={(e) => setLanguage(e.target.value as Language)}>
          <MenuItem value="es">Español</MenuItem>
          <MenuItem value="en">English</MenuItem>
        </TextField>

        <Box>
          <Stack direction={{ xs: 'column', sm: 'row' }} gap={1.5} alignItems={{ sm: 'center' }}>
            <Button variant="outlined" onClick={useMyLocation} disabled={geo.loading} startIcon={geo.loading ? <CircularProgress size={18} /> : <MyLocationIcon />}>
              {t('form.useCurrentLocation')}
            </Button>
            <Typography variant="body2" color="text.secondary">
              {location
                ? t('form.locationSet', { lat: location.latitude.toFixed(4), lng: location.longitude.toFixed(4) })
                : hasLocation
                  ? t('profile.locationCurrent', { lat: user.latitude!.toFixed(4), lng: user.longitude!.toFixed(4) })
                  : t('profile.locationNone')}
            </Typography>
          </Stack>
          {geo.denied && <Typography variant="caption" color="error">{t('search.locationDenied')}</Typography>}
        </Box>

        <Box>
          <Button type="submit" variant="contained" disabled={save.isPending} startIcon={save.isPending ? <CircularProgress size={18} color="inherit" /> : undefined}>
            {t('common.save')}
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}

function PasswordSection() {
  const { t } = useTranslation();
  const { success } = useNotify();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [touched, setTouched] = useState(false);

  const change = useMutation({
    mutationFn: () => usersApi.changePassword(current, next),
    onSuccess: () => {
      success(t('profile.passwordChanged'));
      setCurrent('');
      setNext('');
      setConfirm('');
      setTouched(false);
    },
  });

  const mismatch = next !== confirm;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (current && next && !mismatch) change.mutate();
  };

  return (
    <Box component="form" onSubmit={submit} noValidate>
      <Stack gap={2.5}>
        <Typography variant="h6">{t('profile.passwordTitle')}</Typography>
        {change.error && <ErrorList error={change.error} />}
        <TextField
          label={t('profile.currentPassword')}
          type="password"
          autoComplete="current-password"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          error={touched && !current}
          helperText={touched && !current ? t('auth.passwordRequired') : ''}
        />
        <TextField
          label={t('reset.newPassword')}
          type="password"
          autoComplete="new-password"
          value={next}
          onChange={(e) => setNext(e.target.value)}
          error={touched && !next}
          helperText={touched && !next ? t('auth.passwordRequired') : t('auth.passwordHint')}
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
        <Box>
          <Button type="submit" variant="contained" disabled={change.isPending} startIcon={change.isPending ? <CircularProgress size={18} color="inherit" /> : undefined}>
            {t('profile.changePassword')}
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}

export default function ProfilePage() {
  const { t } = useTranslation();
  const { user } = useAuth();

  if (!user) return null;

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>{t('profile.title')}</Typography>
      <Paper sx={{ p: { xs: 2.5, sm: 4 }, borderRadius: 4 }}>
        <Stack gap={4}>
          <PhotoSection user={user} />
          <Divider />
          {/* key: if the user changes (another session), the form starts again from the new data */}
          <DetailsSection key={user.id} user={user} />
          <Divider />
          <EmailSection user={user} />
          <Divider />
          <PasswordSection />
          <Divider />
          <BlockedUsersSection />
          <Divider />
          <DeleteAccountSection />
        </Stack>
      </Paper>
    </Container>
  );
}

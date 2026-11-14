import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import VerifiedIcon from '@mui/icons-material/VerifiedOutlined';
import { useTranslation } from 'react-i18next';
import { usersApi } from '@/api';
import UserAvatar from '@/components/common/UserAvatar';
import { errorMessages } from '@/components/common/ErrorState';
import { useAuth } from '@/context/AuthContext';
import { useNotify } from '@/context/NotificationContext';
import { useBlockedUsers, useSetBlocked } from '@/hooks/useBlocks';
import { formatDate } from '@/utils/format';
import type { User } from '@/types/api';
import PasswordField from '@/components/common/PasswordField';

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

/** Change of the address. The account keeps the current one until the link sent to the new one is opened. */
export function EmailSection({ user }: { user: User }) {
  const { t } = useTranslation();
  const [newEmail, setNewEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const request = useMutation({
    mutationFn: () => usersApi.requestEmailChange(newEmail.trim(), password),
    onSuccess: () => {
      setSentTo(newEmail.trim());
      setNewEmail('');
      setPassword('');
      setTouched(false);
    },
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    setSentTo(null);
    if (newEmail.trim() && password) request.mutate();
  };

  return (
    <Box component="form" onSubmit={submit} noValidate>
      <Stack gap={2.5}>
        <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
          <Typography variant="h6">{t('profile.emailTitle')}</Typography>
          {user.emailVerified && <Chip size="small" color="success" variant="outlined" icon={<VerifiedIcon />} label={t('profile.emailVerified')} />}
        </Stack>
        <Typography color="text.secondary">{t('profile.emailCurrent', { email: user.email })}</Typography>
        {sentTo && <Alert severity="success">{t('profile.emailSent', { email: sentTo })}</Alert>}
        {request.error && <ErrorList error={request.error} />}
        <TextField
          label={t('profile.emailNew')}
          type="email"
          autoComplete="email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          error={touched && !newEmail.trim()}
          helperText={touched && !newEmail.trim() ? t('auth.emailRequired') : ''}
        />
        <PasswordField
          label={t('profile.currentPassword')}
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={touched && !password}
          helperText={touched && !password ? t('auth.passwordRequired') : ''}
        />
        <Box>
          <Button type="submit" variant="contained" disabled={request.isPending} startIcon={request.isPending ? <CircularProgress size={18} color="inherit" /> : undefined}>
            {t('profile.emailChange')}
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}

/** The users the signed-in user blocked, with a button to let them write again. */
export function BlockedUsersSection() {
  const { t } = useTranslation();
  const { success, error } = useNotify();
  const blocked = useBlockedUsers();
  const setBlocked = useSetBlocked();

  const unblock = async (id: string, name: string) => {
    try {
      await setBlocked.mutateAsync({ userId: id, blocked: false });
      success(t('block.unblocked', { name }));
    } catch (e) {
      error(errorMessages(e, t('errors.generic')).join(' '));
    }
  };

  return (
    <Stack gap={1.5}>
      <Typography variant="h6">{t('block.title')}</Typography>
      <Typography variant="body2" color="text.secondary">{t('block.hint')}</Typography>
      {blocked.isLoading && <Skeleton variant="rounded" height={56} />}
      {blocked.isError && <ErrorList error={blocked.error} />}
      {blocked.data?.length === 0 && <Typography color="text.secondary">{t('block.empty')}</Typography>}
      {!!blocked.data?.length && (
        <List disablePadding>
          {blocked.data.map((b) => (
            <ListItem
              key={b.id}
              disableGutters
              secondaryAction={
                <Button size="small" onClick={() => unblock(b.id, b.displayName)} disabled={setBlocked.isPending}>
                  {t('block.unblock')}
                </Button>
              }
            >
              <ListItemAvatar>
                <UserAvatar name={b.displayName} photoUrl={b.photoUrl} size={40} />
              </ListItemAvatar>
              <ListItemText primary={b.displayName} secondary={t('block.since', { date: formatDate(b.blockedAtUtc) })} />
            </ListItem>
          ))}
        </List>
      )}
    </Stack>
  );
}

/** Deleting the account. It asks for the password and says what goes and what stays. */
export function DeleteAccountSection() {
  const { t } = useTranslation();
  const { isAdmin, logout } = useAuth();
  const { success } = useNotify();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState('');

  const remove = useMutation({
    mutationFn: () => usersApi.deleteAccount(password),
    onSuccess: () => {
      // The server already ended the sessions; this clears the tokens and the data of this browser.
      logout();
      navigate('/', { replace: true });
      success(t('deleteAccount.done'));
    },
  });

  const close = () => {
    if (remove.isPending) return;
    setOpen(false);
    setPassword('');
    remove.reset();
  };

  return (
    <Stack gap={1.5}>
      <Typography variant="h6" color="error">{t('deleteAccount.title')}</Typography>
      {isAdmin ? (
        <Alert severity="info">{t('deleteAccount.admin')}</Alert>
      ) : (
        <>
          <Typography variant="body2" color="text.secondary">{t('deleteAccount.text')}</Typography>
          <Box>
            <Button color="error" variant="outlined" onClick={() => setOpen(true)}>{t('deleteAccount.button')}</Button>
          </Box>
        </>
      )}

      <Dialog open={open} onClose={close} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>{t('deleteAccount.confirmTitle')}</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>{t('deleteAccount.confirmText')}</DialogContentText>
          {remove.error && <Box sx={{ mb: 2 }}><ErrorList error={remove.error} /></Box>}
          <PasswordField
            fullWidth
            autoFocus
            autoComplete="current-password"
            label={t('deleteAccount.password')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button color="inherit" onClick={close} disabled={remove.isPending}>{t('common.cancel')}</Button>
          <Button color="error" variant="contained" onClick={() => remove.mutate()} disabled={remove.isPending || !password}>
            {t('deleteAccount.confirm')}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

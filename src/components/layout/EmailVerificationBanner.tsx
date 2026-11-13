import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Alert, Button, CircularProgress, IconButton, Stack } from '@mui/material';
import CloseIcon from '@mui/icons-material/CloseRounded';
import { useTranslation } from 'react-i18next';
import { usersApi } from '@/api';
import { useAuth } from '@/context/AuthContext';
import { useNotify } from '@/context/NotificationContext';
import { errorMessages } from '@/components/common/ErrorState';

/** Reminds signed-in users with an unverified address and lets them ask for a new link. The account works meanwhile. */
export default function EmailVerificationBanner() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { success, error } = useNotify();
  const [dismissed, setDismissed] = useState(false);

  const resend = useMutation({
    mutationFn: usersApi.resendVerification,
    onSuccess: () => success(t('verify.sent', { email: user?.email })),
    onError: (e) => error(errorMessages(e, t('errors.generic')).join(' ')),
  });

  if (!user || user.emailVerified || dismissed) return null;

  return (
    <Alert
      severity="warning"
      variant="outlined"
      sx={{ borderRadius: 0, justifyContent: 'center', alignItems: 'center', bgcolor: 'background.paper' }}
      // Alert drops its own close button when it has an action, so both are given here.
      action={
        <Stack direction="row" alignItems="center" gap={0.5}>
          <Button
            color="inherit"
            size="small"
            onClick={() => resend.mutate()}
            disabled={resend.isPending}
            startIcon={resend.isPending ? <CircularProgress size={14} color="inherit" /> : undefined}
          >
            {t('verify.resend')}
          </Button>
          <IconButton size="small" color="inherit" aria-label={t('common.close')} onClick={() => setDismissed(true)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>
      }
    >
      {t('verify.banner', { email: user.email })}
    </Alert>
  );
}

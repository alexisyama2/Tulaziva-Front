import { Alert, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ApiError } from '@/api';
import i18n from '@/i18n';

interface Props {
  error: unknown;
  onRetry?: () => void;
}

export function errorMessages(error: unknown, fallback: string): string[] {
  if (error instanceof ApiError) {
    // The rate limiter answers 429 without a body.
    if (error.status === 429) return [i18n.t('errors.tooManyRequests')];
    return error.messages;
  }
  return [fallback];
}

export default function ErrorState({ error, onRetry }: Props) {
  const { t } = useTranslation();
  const messages = errorMessages(error, t('errors.generic'));

  return (
    <Alert
      severity="error"
      sx={{ borderRadius: 3 }}
      action={onRetry && <Button color="inherit" size="small" onClick={onRetry}>{t('common.retry')}</Button>}
    >
      {messages.map((m) => (
        <div key={m}>{m}</div>
      ))}
    </Alert>
  );
}

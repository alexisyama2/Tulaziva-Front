import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { adsApi } from '@/api';
import { useNotify } from '@/context/NotificationContext';
import { errorMessages } from '@/components/common/ErrorState';
import type { ReportReason } from '@/types/api';

export const REPORT_REASONS: ReportReason[] = ['spam', 'fraud', 'inappropriate', 'prohibited', 'other'];
const MAX_DETAILS = 1000;

interface Props {
  adId: string;
  open: boolean;
  onClose: () => void;
}

export default function ReportDialog({ adId, open, onClose }: Props) {
  const { t } = useTranslation();
  const { success } = useNotify();
  const [reason, setReason] = useState<ReportReason>('spam');
  const [details, setDetails] = useState('');

  const report = useMutation({
    mutationFn: () => adsApi.report(adId, reason, details.trim()),
    onSuccess: () => {
      success(t('report.sent'));
      setDetails('');
      setReason('spam');
      onClose();
    },
  });

  // "Other" says nothing by itself: the API asks for an explanation too.
  const detailsMissing = reason === 'other' && !details.trim();

  return (
    <Dialog open={open} onClose={report.isPending ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>{t('report.title')}</DialogTitle>
      <DialogContent>
        <Typography color="text.secondary" sx={{ mb: 1.5 }}>{t('report.intro')}</Typography>

        {report.error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMessages(report.error, t('errors.generic')).map((m) => (
              <div key={m}>{m}</div>
            ))}
          </Alert>
        )}

        <RadioGroup value={reason} onChange={(e) => setReason(e.target.value as ReportReason)}>
          {REPORT_REASONS.map((r) => (
            <FormControlLabel key={r} value={r} control={<Radio />} label={t(`report.reasons.${r}`)} />
          ))}
        </RadioGroup>

        <TextField
          fullWidth
          multiline
          minRows={3}
          sx={{ mt: 1.5 }}
          label={reason === 'other' ? t('report.details') : `${t('report.details')} (${t('common.optional')})`}
          value={details}
          onChange={(e) => setDetails(e.target.value.slice(0, MAX_DETAILS))}
          helperText={`${details.length}/${MAX_DETAILS}`}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button color="inherit" onClick={onClose} disabled={report.isPending}>{t('common.cancel')}</Button>
        <Button
          variant="contained"
          onClick={() => report.mutate()}
          disabled={report.isPending || detailsMissing}
          startIcon={report.isPending ? <CircularProgress size={18} color="inherit" /> : undefined}
        >
          {t('report.submit')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

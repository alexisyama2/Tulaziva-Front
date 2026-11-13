import { useState } from 'react';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import StarIcon from '@mui/icons-material/StarRounded';
import { useTranslation } from 'react-i18next';
import { errorMessages } from '@/components/common/ErrorState';
import { useNotify } from '@/context/NotificationContext';
import { useFeatureAd, useFeaturingOptions } from '@/hooks/useFeaturing';
import { formatDate, isFeatured } from '@/utils/format';

interface Props {
  adId: string;
  featuredUntilUtc: string | null;
  open: boolean;
  onClose: () => void;
}

/** Lets the owner (or an admin) show an ad first in the searches for some days, or stop doing it. */
export default function FeatureDialog({ adId, featuredUntilUtc, open, onClose }: Props) {
  const { t } = useTranslation();
  const { success, error } = useNotify();
  const options = useFeaturingOptions();
  const feature = useFeatureAd();
  const plans = options.data?.plans ?? [];
  const [days, setDays] = useState<number | null>(null);
  const chosen = days ?? plans[0] ?? 0;
  const active = isFeatured(featuredUntilUtc);

  const run = async (value: number, okMessage: string) => {
    try {
      await feature.mutateAsync({ adId, days: value });
      success(okMessage);
      onClose();
    } catch (e) {
      error(errorMessages(e, t('errors.generic')).join(' '));
    }
  };

  return (
    <Dialog open={open} onClose={feature.isPending ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>{t('feature.title')}</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>{t('feature.text')}</DialogContentText>
        {active && featuredUntilUtc && (
          <Alert severity="success" icon={<StarIcon />} sx={{ mb: 2 }}>
            {t('feature.until', { date: formatDate(featuredUntilUtc) })}
          </Alert>
        )}
        <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>{active ? t('feature.addDays') : t('feature.chooseDays')}</Typography>
        <ToggleButtonGroup
          exclusive
          fullWidth
          color="primary"
          value={chosen}
          onChange={(_, value: number | null) => value && setDays(value)}
          aria-label={t('feature.chooseDays')}
        >
          {plans.map((p) => (
            <ToggleButton key={p} value={p}>{t('feature.days', { count: p })}</ToggleButton>
          ))}
        </ToggleButtonGroup>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, flexWrap: 'wrap', gap: 1 }}>
        {active && (
          <Button color="inherit" disabled={feature.isPending} onClick={() => run(0, t('feature.removed'))} sx={{ mr: 'auto' }}>
            {t('feature.stop')}
          </Button>
        )}
        <Button color="inherit" onClick={onClose} disabled={feature.isPending}>{t('common.cancel')}</Button>
        <Button
          variant="contained"
          startIcon={<StarIcon />}
          disabled={feature.isPending || !chosen}
          onClick={() => run(chosen, t('feature.done'))}
        >
          {t('feature.apply')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

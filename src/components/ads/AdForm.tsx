import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Box, Button, CircularProgress, MenuItem, Stack, TextField, Typography } from '@mui/material';
import MyLocationIcon from '@mui/icons-material/MyLocationRounded';
import { useTranslation } from 'react-i18next';
import type { Ad } from '@/types/api';
import { useCategories, useSaveAd } from '@/hooks/useAds';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useNotify } from '@/context/NotificationContext';
import { errorMessages } from '@/components/common/ErrorState';
import ImageUploader from './ImageUploader';

// Same list as AdRules.Currencies in the API.
const CURRENCIES = ['MXN', 'USD', 'EUR', 'COP', 'ARS', 'CLP', 'PEN', 'BRL'];

interface Props {
  /** When present the form edits this ad. */
  ad?: Ad;
}

export default function AdForm({ ad }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { success } = useNotify();
  const { data: categories = [] } = useCategories();
  const save = useSaveAd();
  const geo = useGeolocation();

  const [title, setTitle] = useState(ad?.title ?? '');
  const [description, setDescription] = useState(ad?.description ?? '');
  const [price, setPrice] = useState(ad ? String(ad.price) : '');
  const [currency, setCurrency] = useState(ad?.currency ?? 'MXN');
  const [categoryId, setCategoryId] = useState(ad ? String(ad.categoryId) : '');
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [removedIds, setRemovedIds] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const existing = (ad?.images ?? []).filter((i) => !removedIds.includes(i.id));

  const errors = {
    title: title.trim().length < 3 ? t('form.titleRequired') : '',
    description: !description.trim() ? t('form.descriptionRequired') : '',
    price: price === '' || Number(price) < 0 || Number.isNaN(Number(price)) ? t('form.priceInvalid') : '',
    category: !categoryId ? t('form.categoryRequired') : '',
  };
  const invalid = Object.values(errors).some(Boolean);

  const useMyLocation = async () => {
    const c = await geo.locate();
    if (c) setLocation(c);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (invalid) return;

    try {
      const saved = await save.mutateAsync({
        id: ad?.id,
        input: {
          categoryId: Number(categoryId),
          title: title.trim(),
          description: description.trim(),
          price: Number(price),
          currency,
          // Omitted when untouched: the API keeps the registration location (create) or the current one (edit).
          latitude: location?.latitude ?? null,
          longitude: location?.longitude ?? null,
        },
        newImages,
        removedImageIds: removedIds,
      });
      success(ad ? t('form.updated') : t('form.published'));
      navigate(`/ads/${saved.id}`);
    } catch {
      /* shown below through save.error */
    }
  };

  return (
    <Box component="form" onSubmit={submit} noValidate>
      <Stack gap={3}>
        {save.error && (
          <Alert severity="error">
            {errorMessages(save.error, t('errors.generic')).map((m) => (
              <div key={m}>{m}</div>
            ))}
          </Alert>
        )}

        <TextField
          label={t('form.title')}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          error={submitted && !!errors.title}
          helperText={(submitted && errors.title) || `${title.length}/120`}
          slotProps={{ htmlInput: { maxLength: 120 } }}
        />

        <Stack direction={{ xs: 'column', sm: 'row' }} gap={2}>
          <TextField
            select
            fullWidth
            label={t('form.category')}
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
            error={submitted && !!errors.category}
            helperText={submitted && errors.category}
          >
            {categories.map((c) => (
              <MenuItem key={c.id} value={String(c.id)}>{c.name}</MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            label={t('form.price')}
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            error={submitted && !!errors.price}
            helperText={submitted && errors.price}
            slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
          />
          <TextField select label={t('form.currency')} value={currency} onChange={(e) => setCurrency(e.target.value)} sx={{ minWidth: 130 }}>
            {CURRENCIES.map((c) => (
              <MenuItem key={c} value={c}>{c}</MenuItem>
            ))}
          </TextField>
        </Stack>

        <TextField
          label={t('form.description')}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          multiline
          minRows={5}
          error={submitted && !!errors.description}
          helperText={(submitted && errors.description) || `${description.length}/4000`}
          slotProps={{ htmlInput: { maxLength: 4000 } }}
        />

        <Box>
          <Typography fontWeight={700} gutterBottom>{t('form.location')}</Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} gap={2} alignItems={{ sm: 'center' }}>
            <Button
              variant="outlined"
              onClick={useMyLocation}
              disabled={geo.loading}
              startIcon={geo.loading ? <CircularProgress size={18} /> : <MyLocationIcon />}
            >
              {t('form.useCurrentLocation')}
            </Button>
            {location && (
              <Typography variant="body2" color="text.secondary" component="span">
                {t('form.locationSet', { lat: location.latitude.toFixed(4), lng: location.longitude.toFixed(4) })}
              </Typography>
            )}
          </Stack>
          <Typography variant="caption" color={geo.denied ? 'error' : 'text.secondary'} display="block" sx={{ mt: 0.5 }}>
            {geo.denied ? t('search.locationDenied') : ad ? t('form.locationHintEdit') : t('form.locationHintCreate')}
          </Typography>
        </Box>

        <Box>
          <Typography fontWeight={700} gutterBottom>{t('form.images')}</Typography>
          <ImageUploader
            existing={existing}
            newFiles={newImages}
            onRemoveExisting={(id) => setRemovedIds((r) => [...r, id])}
            onNewFilesChange={setNewImages}
          />
        </Box>

        <Stack direction="row" gap={2} justifyContent="flex-end">
          <Button color="inherit" onClick={() => navigate(-1)} disabled={save.isPending}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" variant="contained" size="large" disabled={save.isPending} startIcon={save.isPending ? <CircularProgress size={18} color="inherit" /> : undefined}>
            {ad ? t('form.saveChanges') : t('form.publish')}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}

import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  FormControlLabel,
  InputAdornment,
  MenuItem,
  Slider,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/SearchRounded';
import { useTranslation } from 'react-i18next';
import type { Category } from '@/types/api';
import { useDebounce } from '@/hooks/useDebounce';

export interface FilterValues {
  text: string;
  categoryId: string;
  minPrice: string;
  maxPrice: string;
  nearMe: boolean;
  radiusKm: number;
}

export const EMPTY_FILTERS: FilterValues = { text: '', categoryId: '', minPrice: '', maxPrice: '', nearMe: false, radiusKm: 50 };

interface Props {
  value: FilterValues;
  categories: Category[];
  locating?: boolean;
  locationDenied?: boolean;
  onChange: (value: FilterValues) => void;
}

/** Controlled filter panel. Text and price inputs are debounced before they reach the parent (and the URL). */
export default function AdFilters({ value, categories, locating, locationDenied, onChange }: Props) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState(value);

  // Keep the draft in sync when the parent changes (back button, clear).
  useEffect(() => setDraft(value), [value]);

  const debounced = useDebounce(draft, 450);
  useEffect(() => {
    if (JSON.stringify(debounced) !== JSON.stringify(value)) onChange(debounced);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  const set = <K extends keyof FilterValues>(key: K, v: FilterValues[K]) => setDraft((d) => ({ ...d, [key]: v }));

  return (
    <Stack gap={2.5}>
      <TextField
        label={t('search.text')}
        value={draft.text}
        onChange={(e) => set('text', e.target.value.slice(0, 100))}
        slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> } }}
      />
      <TextField select label={t('search.category')} value={draft.categoryId} onChange={(e) => set('categoryId', e.target.value)}>
        <MenuItem value="">{t('common.all')}</MenuItem>
        {categories.map((c) => (
          <MenuItem key={c.id} value={String(c.id)}>{c.name}</MenuItem>
        ))}
      </TextField>
      <Stack direction="row" gap={1.5}>
        <TextField label={t('search.minPrice')} type="number" value={draft.minPrice} onChange={(e) => set('minPrice', e.target.value)} slotProps={{ htmlInput: { min: 0 } }} />
        <TextField label={t('search.maxPrice')} type="number" value={draft.maxPrice} onChange={(e) => set('maxPrice', e.target.value)} slotProps={{ htmlInput: { min: 0 } }} />
      </Stack>
      <Box>
        <FormControlLabel
          control={<Switch checked={draft.nearMe} onChange={(e) => onChange({ ...draft, nearMe: e.target.checked })} />}
          label={t('search.nearMe')}
        />
        {locating && <Typography variant="caption" color="text.secondary" display="block">{t('search.locating')}</Typography>}
        {locationDenied && <Typography variant="caption" color="error" display="block">{t('search.locationDenied')}</Typography>}
        {draft.nearMe && (
          <Box sx={{ px: 1, mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {t('search.radius')}: {draft.radiusKm} {t('common.km')}
            </Typography>
            <Slider value={draft.radiusKm} min={1} max={500} onChange={(_, v) => set('radiusKm', v as number)} valueLabelDisplay="auto" />
          </Box>
        )}
      </Box>
      <Button onClick={() => onChange(EMPTY_FILTERS)} color="inherit">{t('common.clear')}</Button>
    </Stack>
  );
}

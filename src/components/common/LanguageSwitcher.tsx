import { useState } from 'react';
import { Button, Menu, MenuItem, ListItemText } from '@mui/material';
import TranslateIcon from '@mui/icons-material/TranslateRounded';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { SUPPORTED_LANGUAGES } from '@/i18n';

const LABELS: Record<string, string> = { es: 'Español', en: 'English' };

export default function LanguageSwitcher({ color = 'inherit' }: { color?: 'inherit' | 'primary' }) {
  const { i18n, t } = useTranslation();
  const qc = useQueryClient();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const current = (i18n.resolvedLanguage || 'es').slice(0, 2);

  const change = async (lng: string) => {
    setAnchor(null);
    await i18n.changeLanguage(lng);
    // Category names and API messages are localized by the server: refetch in the new language.
    void qc.invalidateQueries({ queryKey: ['categories'] });
  };

  return (
    <>
      <Button
        color={color}
        onClick={(e) => setAnchor(e.currentTarget)}
        startIcon={<TranslateIcon />}
        aria-label={t('nav.language')}
        sx={{ minWidth: 0, px: 1.5, textTransform: 'uppercase' }}
      >
        {current}
      </Button>
      <Menu anchorEl={anchor} open={!!anchor} onClose={() => setAnchor(null)}>
        {SUPPORTED_LANGUAGES.map((lng) => (
          <MenuItem key={lng} selected={lng === current} onClick={() => change(lng)}>
            <ListItemText>{LABELS[lng]}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

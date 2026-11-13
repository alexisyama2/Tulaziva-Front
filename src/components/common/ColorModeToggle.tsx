import { IconButton, Tooltip } from '@mui/material';
import DarkModeIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeIcon from '@mui/icons-material/LightModeOutlined';
import { useTranslation } from 'react-i18next';
import { useColorMode } from '@/context/ColorModeContext';

export default function ColorModeToggle() {
  const { t } = useTranslation();
  const { mode, toggle } = useColorMode();
  const label = mode === 'dark' ? t('nav.lightMode') : t('nav.darkMode');

  return (
    <Tooltip title={label}>
      <IconButton onClick={toggle} aria-label={label} color="inherit">
        {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
      </IconButton>
    </Tooltip>
  );
}

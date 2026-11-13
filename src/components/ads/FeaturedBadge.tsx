import { Chip, type ChipProps } from '@mui/material';
import StarIcon from '@mui/icons-material/StarRounded';
import { useTranslation } from 'react-i18next';

/** The "Featured" tag shown on the ads that are being shown first. */
export default function FeaturedBadge({ sx, ...rest }: Omit<ChipProps, 'label' | 'icon'>) {
  const { t } = useTranslation();

  return (
    <Chip
      size="small"
      icon={<StarIcon />}
      label={t('feature.badge')}
      {...rest}
      sx={{ fontWeight: 700, bgcolor: '#FFB020', color: '#3A2500', '& .MuiChip-icon': { color: '#3A2500' }, ...sx }}
    />
  );
}

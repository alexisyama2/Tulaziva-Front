import { Link as RouterLink } from 'react-router-dom';
import { alpha, Box, Card, CardActionArea, CardContent, Chip, Stack, Typography } from '@mui/material';
import ImageIcon from '@mui/icons-material/ImageOutlined';
import PlaceIcon from '@mui/icons-material/PlaceOutlined';
import { useTranslation } from 'react-i18next';
import type { AdSummary } from '@/types/api';
import { formatPrice, timeAgo } from '@/utils/format';
import { isFeatured } from '@/utils/format';
import FavoriteButton from './FavoriteButton';
import FeaturedBadge from './FeaturedBadge';

interface Props {
  ad: AdSummary;
  categoryName?: string;
  /** Extra footer content (actions on "my ads"). */
  footer?: React.ReactNode;
  badge?: React.ReactNode;
}

export default function AdCard({ ad, categoryName, footer, badge }: Props) {
  const { t } = useTranslation();
  const featured = isFeatured(ad.featuredUntilUtc);

  return (
    <Card sx={{ position: 'relative', height: '100%', ...(featured && { outline: '2px solid #FFB020', outlineOffset: -2 }), display: 'flex', flexDirection: 'column', transition: 'transform .2s, box-shadow .2s', '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 12px 32px rgba(22,50,79,.16)' } }}>
      <CardActionArea component={RouterLink} to={`/ads/${ad.id}`} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
        <Box sx={{ position: 'relative', aspectRatio: '4 / 3', bgcolor: 'action.hover', overflow: 'hidden' }}>
          {ad.coverImageUrl ? (
            <Box component="img" src={ad.coverImageUrl} alt={ad.title} loading="lazy" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <Stack alignItems="center" justifyContent="center" sx={{ height: '100%', color: 'text.disabled' }}>
              <ImageIcon sx={{ fontSize: 44 }} />
              <Typography variant="caption">{t('ad.noImage')}</Typography>
            </Stack>
          )}
          {categoryName && (
            <Chip label={categoryName} size="small" sx={{ position: 'absolute', top: 10, left: 10, bgcolor: (th) => alpha(th.palette.background.paper, 0.92) }} />
          )}
          {badge && <Box sx={{ position: 'absolute', bottom: 10, left: 10 }}>{badge}</Box>}
          {featured && <FeaturedBadge sx={{ position: 'absolute', bottom: 10, right: 10 }} />}
        </Box>
        <CardContent sx={{ flex: 1, width: '100%' }}>
          <Typography variant="h6" sx={{ fontSize: '1.25rem', color: 'primary.main' }}>
            {formatPrice(ad.price, ad.currency)}
          </Typography>
          <Typography
            sx={{ fontWeight: 600, mt: 0.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: '3em' }}
          >
            {ad.title}
          </Typography>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1.5, color: 'text.secondary' }}>
            <Typography variant="caption">{timeAgo(ad.createdAtUtc)}</Typography>
            {ad.distanceKm != null && (
              <Stack direction="row" alignItems="center" gap={0.25}>
                <PlaceIcon sx={{ fontSize: 16 }} />
                <Typography variant="caption">{t('search.away', { km: ad.distanceKm })}</Typography>
              </Stack>
            )}
          </Stack>
        </CardContent>
      </CardActionArea>
      <FavoriteButton adId={ad.id} overlay sx={{ position: 'absolute', top: 8, right: 8 }} />
      {footer}
    </Card>
  );
}

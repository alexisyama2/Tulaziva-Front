import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import { lazy, Suspense, useState } from 'react';
import { Alert, Box, Button, Chip, Container, Divider, IconButton, Paper, Skeleton, Stack, Tooltip, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/EditOutlined';
import ChatIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import ShareIcon from '@mui/icons-material/IosShareRounded';
import PlaceIcon from '@mui/icons-material/PlaceOutlined';
import BlockIcon from '@mui/icons-material/BlockRounded';
import FlagIcon from '@mui/icons-material/FlagOutlined';
import StarIcon from '@mui/icons-material/StarOutlineRounded';
import { useTranslation } from 'react-i18next';
import { ApiError } from '@/api';
import { useAuth } from '@/context/AuthContext';
import { useNotify } from '@/context/NotificationContext';
import { isAdId, useAd, useAdminRemoveAd, useCategories } from '@/hooks/useAds';
import { useStartConversation } from '@/hooks/useChat';
import { useFeaturingOptions } from '@/hooks/useFeaturing';
import FavoriteButton from '@/components/ads/FavoriteButton';
import ImageGallery from '@/components/ads/ImageGallery';
import FeatureDialog from '@/components/ads/FeatureDialog';
import FeaturedBadge from '@/components/ads/FeaturedBadge';
import ReportDialog from '@/components/ads/ReportDialog';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import EmptyState from '@/components/common/EmptyState';
import ErrorState, { errorMessages } from '@/components/common/ErrorState';
import UserAvatar from '@/components/common/UserAvatar';
import { formatDate, formatPrice, isExpired, isFeatured, timeAgo } from '@/utils/format';

// Leaflet is only downloaded when an ad with a location is opened.
const AdMap = lazy(() => import('@/components/ads/AdMap'));

export default function AdDetailPage() {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { success, error: notifyError } = useNotify();
  const { data: ad, isLoading, isError, error } = useAd(id);
  const { data: categories } = useCategories();
  const start = useStartConversation();
  const adminRemove = useAdminRemoveAd();
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [featuring, setFeaturing] = useState(false);
  const featuringOptions = useFeaturingOptions();

  if (isLoading)
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'grid', gap: 4, gridTemplateColumns: { xs: '1fr', md: '3fr 2fr' } }}>
          <Skeleton variant="rounded" sx={{ aspectRatio: '4/3', height: 'auto' }} />
          <Stack gap={2}><Skeleton height={48} /><Skeleton height={32} width="50%" /><Skeleton height={120} /></Stack>
        </Box>
      </Container>
    );

  if (isError || !ad)
    return (
      <Container maxWidth="sm" sx={{ py: 6 }}>
        {!isAdId(id) || (error instanceof ApiError && error.status === 404) ? (
          <EmptyState title={t('ad.notFound')} action={<Button component={RouterLink} to="/ads" variant="contained">{t('nav.ads')}</Button>} />
        ) : (
          <ErrorState error={error} />
        )}
      </Container>
    );

  const isOwner = user?.id === ad.ownerId;
  const category = categories?.find((c) => c.id === ad.categoryId);
  const expired = isExpired(ad.expiresAtUtc);
  const featured = isFeatured(ad.featuredUntilUtc);
  // The owner can promote when the API allows it (there is no payment yet); an admin can always.
  const canFeature = ad.status === 'Active' && !expired && (isAdmin || (isOwner && !!featuringOptions.data?.ownersCanFeature));

  const contact = async () => {
    try {
      const conv = await start.mutateAsync(ad.id);
      navigate(`/messages/${conv.id}`);
    } catch (e) {
      notifyError(errorMessages(e, t('errors.generic')).join(' '));
    }
  };

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: ad.title, url });
      else {
        await navigator.clipboard.writeText(url);
        success(t('ad.linkCopied'));
      }
    } catch {
      /* the user dismissed the share sheet */
    }
  };

  const takeDown = async () => {
    try {
      await adminRemove.mutateAsync(ad.id);
      success(t('ad.removedOk'));
      setConfirmRemove(false);
    } catch (e) {
      notifyError(errorMessages(e, t('errors.generic')).join(' '));
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {ad.status === 'Removed' && <Alert severity="warning" sx={{ mb: 2 }}>{t('ad.removed')}</Alert>}
      {expired && ad.status !== 'Removed' && <Alert severity="info" sx={{ mb: 2 }}>{t('ad.expired')}</Alert>}

      {/* On a phone the order is photos, price and actions, then the description; on a wide screen the info card sits beside both. */}
      <Box
        sx={{
          display: 'grid',
          columnGap: 4,
          rowGap: 3,
          alignItems: 'start',
          gridTemplateColumns: { xs: '1fr', md: '3fr 2fr' },
          gridTemplateRows: { md: 'auto 1fr' },
          gridTemplateAreas: { xs: '"gallery" "info" "desc"', md: '"gallery info" "desc info"' },
        }}
      >
        <Box sx={{ gridArea: 'gallery', minWidth: 0 }}>
          <ImageGallery images={ad.images} alt={ad.title} />
        </Box>

        <Paper sx={{ gridArea: 'desc', p: 3, borderRadius: 4, minWidth: 0 }}>
          <Typography variant="h6" gutterBottom>{t('ad.description')}</Typography>
          <Typography sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }} color="text.secondary">{ad.description}</Typography>
        </Paper>

        <Stack gap={2.5} sx={{ gridArea: 'info', minWidth: 0, position: { md: 'sticky' }, top: { md: 88 } }}>
          <Paper sx={{ p: 3, borderRadius: 4 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={1}>
              <Stack direction="row" gap={0.75} flexWrap="wrap">
                {category && <Chip label={category.name} color="primary" variant="outlined" size="small" />}
                {featured && <FeaturedBadge />}
              </Stack>
              <Stack direction="row">
                <FavoriteButton adId={ad.id} />
                <Tooltip title={t('ad.share')}><IconButton onClick={share}><ShareIcon /></IconButton></Tooltip>
              </Stack>
            </Stack>
            <Typography variant="h4" sx={{ mt: 1.5, wordBreak: 'break-word' }}>{ad.title}</Typography>
            <Typography variant="h3" color="primary" sx={{ mt: 1, fontSize: '2.2rem' }}>{formatPrice(ad.price, ad.currency)}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
              {t('ad.published', { when: timeAgo(ad.createdAtUtc) })} · {t('ad.expires', { when: formatDate(ad.expiresAtUtc) })}
            </Typography>

            {ad.latitude != null && ad.longitude != null && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" fontWeight={600} sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <PlaceIcon fontSize="small" /> {t('ad.location')}
                </Typography>
                <Suspense fallback={<Skeleton variant="rounded" height={220} />}>
                  <AdMap latitude={ad.latitude} longitude={ad.longitude} />
                </Suspense>
                <Button
                  size="small"
                  href={`https://www.openstreetmap.org/?mlat=${ad.latitude}&mlon=${ad.longitude}#map=13/${ad.latitude}/${ad.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ mt: 0.5, px: 0 }}
                >
                  {t('ad.viewOnMap')}
                </Button>
              </Box>
            )}

            <Divider sx={{ my: 2.5 }} />

            {isOwner ? (
              <Stack gap={1.5}>
                <Alert severity="info" icon={false}>{t('ad.yourAd')}</Alert>
                <Button component={RouterLink} to={`/ads/${ad.id}/edit`} variant="contained" startIcon={<EditIcon />}>{t('common.edit')}</Button>
              </Stack>
            ) : user ? (
              <Button variant="contained" size="large" fullWidth startIcon={<ChatIcon />} onClick={contact} disabled={start.isPending || ad.status === 'Removed'}>
                {t('ad.contact')}
              </Button>
            ) : (
              <Button component={RouterLink} to="/login" state={{ from: `/ads/${ad.id}` }} variant="contained" size="large" fullWidth>
                {t('ad.loginToContact')}
              </Button>
            )}

            {canFeature && (
              <Button fullWidth variant={featured ? 'outlined' : 'contained'} color="warning" startIcon={<StarIcon />} onClick={() => setFeaturing(true)} sx={{ mt: 1.5 }}>
                {featured ? t('feature.manage') : t('feature.button')}
              </Button>
            )}

            {isAdmin && ad.status === 'Active' && (
              <Button color="error" fullWidth startIcon={<BlockIcon />} onClick={() => setConfirmRemove(true)} sx={{ mt: 1.5 }}>
                {t('ad.removeByAdmin')}
              </Button>
            )}
          </Paper>

          {!isOwner && ad.status === 'Active' && (
            <Button
              color="inherit"
              size="small"
              startIcon={<FlagIcon />}
              onClick={() => (user ? setReporting(true) : navigate('/login', { state: { from: `/ads/${ad.id}` } }))}
              sx={{ alignSelf: 'flex-start', color: 'text.secondary' }}
            >
              {t('report.action')}
            </Button>
          )}

          <Paper sx={{ p: 2.5, borderRadius: 4 }}>
            <Typography variant="overline" color="text.secondary">{t('ad.seller')}</Typography>
            <Stack direction="row" alignItems="center" gap={1.5} sx={{ mt: 0.5 }}>
              <UserAvatar name={ad.ownerDisplayName} photoUrl={ad.ownerPhotoUrl} size={52} />
              <Typography fontWeight={700}>{ad.ownerDisplayName}</Typography>
            </Stack>
          </Paper>
        </Stack>
      </Box>

      <ReportDialog adId={ad.id} open={reporting} onClose={() => setReporting(false)} />
      {canFeature && <FeatureDialog adId={ad.id} featuredUntilUtc={ad.featuredUntilUtc} open={featuring} onClose={() => setFeaturing(false)} />}

      <ConfirmDialog
        open={confirmRemove}
        title={t('ad.removeByAdmin')}
        text={t('ad.removeByAdminConfirm')}
        destructive
        loading={adminRemove.isPending}
        onConfirm={takeDown}
        onClose={() => setConfirmRemove(false)}
      />
    </Container>
  );
}

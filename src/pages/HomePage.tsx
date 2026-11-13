import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Box, Button, CircularProgress, Container, InputBase, Paper, Skeleton, Stack, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/SearchRounded';
import MyLocationIcon from '@mui/icons-material/MyLocationRounded';
import ArrowForwardIcon from '@mui/icons-material/ArrowForwardRounded';
import { Trans, useTranslation } from 'react-i18next';
import AdGrid from '@/components/ads/AdGrid';
import ErrorState from '@/components/common/ErrorState';
import EmptyState from '@/components/common/EmptyState';
import { useAdSearch, useCategories } from '@/hooks/useAds';
import { useGeolocation } from '@/hooks/useGeolocation';
import { categoryIcon } from '@/utils/categories';
import { gradients } from '@/theme/theme';

function SectionHeader({ title, to }: { title: string; to: string }) {
  const { t } = useTranslation();
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2.5 }}>
      <Typography variant="h5">{title}</Typography>
      <Button component={RouterLink} to={to} endIcon={<ArrowForwardIcon />}>{t('home.seeAll')}</Button>
    </Stack>
  );
}

export default function HomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const { data: categories, isLoading: loadingCategories } = useCategories();
  const latest = useAdSearch({ page: 1, pageSize: 8 });
  const geo = useGeolocation();
  const nearby = useAdSearch(
    geo.coords ? { ...geo.coords, radiusKm: 100, page: 1, pageSize: 4 } : { page: 1, pageSize: 1 },
  );

  const search = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(text.trim() ? `/ads?text=${encodeURIComponent(text.trim())}` : '/ads');
  };

  return (
    <>
      <Box sx={{ background: gradients.hero, color: '#fff', pt: { xs: 8, md: 12 }, pb: { xs: 12, md: 16 }, position: 'relative', overflow: 'hidden' }}>
        <Box sx={{ position: 'absolute', width: 420, height: 420, borderRadius: '50%', background: 'radial-gradient(circle, rgba(205,235,255,.55), transparent 70%)', top: -120, right: -80 }} />
        <Container maxWidth="md" sx={{ position: 'relative', textAlign: 'center' }}>
          <Typography variant="h2" sx={{ fontSize: { xs: '2.2rem', md: '3.4rem' }, mb: 2 }}>
            <Trans i18nKey="home.heroTitle" components={{ 1: <Box component="span" sx={{ background: 'linear-gradient(90deg,#CDEBFF,#FFFFFF)', WebkitBackgroundClip: 'text', color: 'transparent' }} /> }} />
          </Typography>
          <Typography sx={{ opacity: 0.85, fontSize: { xs: '1rem', md: '1.2rem' }, mb: 5 }}>{t('home.heroSubtitle')}</Typography>

          <Paper component="form" onSubmit={search} sx={{ display: 'flex', alignItems: 'center', p: 0.75, pl: 2.5, borderRadius: 99, boxShadow: '0 20px 50px rgba(0,0,0,.3)' }}>
            <SearchIcon color="action" />
            <InputBase fullWidth value={text} onChange={(e) => setText(e.target.value)} placeholder={t('home.searchPlaceholder')} sx={{ ml: 1.5, fontSize: '1.05rem' }} inputProps={{ maxLength: 100 }} />
            <Button type="submit" variant="contained" size="large" sx={{ borderRadius: 99, px: 4 }}>{t('common.search')}</Button>
          </Paper>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: -7, position: 'relative' }}>
        <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 5 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>{t('home.browseCategories')}</Typography>
          <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(6, 1fr)' } }}>
            {loadingCategories && Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} variant="rounded" height={84} />)}
            {categories?.map((c) => (
              <Button
                key={c.id}
                component={RouterLink}
                to={`/ads?categoryId=${c.id}`}
                color="inherit"
                sx={{ flexDirection: 'column', gap: 0.75, py: 1.75, borderRadius: 3, bgcolor: 'action.hover', '&:hover': { bgcolor: 'primary.main', color: '#fff' } }}
              >
                <Box sx={{ display: 'flex', '& svg': { fontSize: 30 } }}>{categoryIcon(c.key)}</Box>
                <Typography variant="body2" fontWeight={600} align="center" sx={{ maxWidth: '100%', lineHeight: 1.25 }}>{c.name}</Typography>
              </Button>
            ))}
          </Box>
        </Paper>
      </Container>

      <Container maxWidth="lg" sx={{ mt: 6 }}>
        <SectionHeader title={t('home.latest')} to="/ads" />
        {latest.isError ? (
          <ErrorState error={latest.error} onRetry={() => latest.refetch()} />
        ) : (
          <AdGrid ads={latest.data?.items} categories={categories} loading={latest.isLoading} />
        )}

        <Box sx={{ mt: 6 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2.5 }}>
            <Typography variant="h5">{t('home.nearby')}</Typography>
            {!geo.coords && (
              <Button onClick={geo.locate} disabled={geo.loading} startIcon={geo.loading ? <CircularProgress size={16} /> : <MyLocationIcon />}>
                {t('home.useMyLocation')}
              </Button>
            )}
          </Stack>
          {geo.denied && <Typography color="error" variant="body2" sx={{ mb: 2 }}>{t('search.locationDenied')}</Typography>}
          {geo.coords && (
            nearby.data && nearby.data.items.length === 0 ? (
              <EmptyState title={t('search.empty')} hint={t('search.emptyHint')} />
            ) : (
              <AdGrid ads={nearby.data?.items} categories={categories} loading={nearby.isLoading} skeletons={4} />
            )
          )}
        </Box>

        <Paper sx={{ mt: 8, p: { xs: 4, md: 6 }, borderRadius: 5, textAlign: 'center', color: '#fff', background: gradients.brand }}>
          <Typography variant="h4" gutterBottom>{t('home.ctaTitle')}</Typography>
          <Typography sx={{ opacity: 0.92, mb: 3 }}>{t('home.ctaText')}</Typography>
          <Button component={RouterLink} to="/ads/new" size="large" variant="contained" sx={{ color: '#2C6CB0', background: '#fff', '&:hover': { background: '#EAF3FC' } }}>
            {t('home.ctaButton')}
          </Button>
        </Paper>
      </Container>
    </>
  );
}

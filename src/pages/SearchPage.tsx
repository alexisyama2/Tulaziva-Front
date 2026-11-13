import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Box, Button, Container, Drawer, Pagination, Paper, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import TuneIcon from '@mui/icons-material/TuneRounded';
import SearchOffIcon from '@mui/icons-material/SearchOffRounded';
import { useTranslation } from 'react-i18next';
import AdFilters, { EMPTY_FILTERS, type FilterValues } from '@/components/ads/AdFilters';
import AdGrid from '@/components/ads/AdGrid';
import EmptyState from '@/components/common/EmptyState';
import ErrorState from '@/components/common/ErrorState';
import { useAdSearch, useCategories } from '@/hooks/useAds';
import { useGeolocation } from '@/hooks/useGeolocation';
import type { AdSearchParams } from '@/types/api';

const PAGE_SIZE = 12;

function fromParams(sp: URLSearchParams): FilterValues {
  return {
    text: sp.get('text') ?? '',
    categoryId: sp.get('categoryId') ?? '',
    minPrice: sp.get('minPrice') ?? '',
    maxPrice: sp.get('maxPrice') ?? '',
    nearMe: sp.get('near') === '1',
    radiusKm: Number(sp.get('radius')) || EMPTY_FILTERS.radiusKm,
  };
}

function toParams(f: FilterValues): Record<string, string> {
  const out: Record<string, string> = {};
  if (f.text.trim()) out.text = f.text.trim();
  if (f.categoryId) out.categoryId = f.categoryId;
  if (f.minPrice) out.minPrice = f.minPrice;
  if (f.maxPrice) out.maxPrice = f.maxPrice;
  if (f.nearMe) {
    out.near = '1';
    out.radius = String(f.radiusKm);
  }
  return out;
}

export default function SearchPage() {
  const { t } = useTranslation();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const [sp, setSp] = useSearchParams();
  const [drawer, setDrawer] = useState(false);
  const { data: categories = [] } = useCategories();
  const geo = useGeolocation();

  const filters = useMemo(() => fromParams(sp), [sp]);
  const page = Math.max(1, Number(sp.get('page')) || 1);

  // Ask for the location only once the user turns "near me" on (or arrives with it in the URL).
  useEffect(() => {
    if (filters.nearMe && !geo.coords && !geo.loading && !geo.denied) void geo.locate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.nearMe]);

  const params: AdSearchParams = {
    text: filters.text || undefined,
    categoryId: filters.categoryId ? Number(filters.categoryId) : undefined,
    minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
    maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
    ...(filters.nearMe && geo.coords ? { ...geo.coords, radiusKm: filters.radiusKm } : {}),
    page,
    pageSize: PAGE_SIZE,
  };
  const { data, isLoading, isFetching, isError, error, refetch } = useAdSearch(params);

  const onFilters = (f: FilterValues) => setSp(toParams(f), { replace: true });
  const onPage = (p: number) => {
    const next = new URLSearchParams(sp);
    next.set('page', String(p));
    setSp(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filterPanel = (
    <AdFilters value={filters} categories={categories} onChange={onFilters} locating={geo.loading} locationDenied={geo.denied && filters.nearMe} />
  );
  const pages = data ? Math.ceil(data.totalCount / data.pageSize) : 0;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4">{t('search.title')}</Typography>
          {data && <Typography color="text.secondary">{t('common.results', { count: data.totalCount })}</Typography>}
        </Box>
        {!isDesktop && (
          <Button variant="outlined" startIcon={<TuneIcon />} onClick={() => setDrawer(true)}>{t('search.filters')}</Button>
        )}
      </Stack>

      <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: '300px 1fr' }, alignItems: 'start' }}>
        {isDesktop && <Paper sx={{ p: 2.5, borderRadius: 4, position: 'sticky', top: 88 }}>{filterPanel}</Paper>}

        <Box sx={{ opacity: isFetching && !isLoading ? 0.6 : 1, transition: 'opacity .2s' }}>
          {isError ? (
            <ErrorState error={error} onRetry={() => refetch()} />
          ) : data && data.items.length === 0 ? (
            <EmptyState icon={<SearchOffIcon />} title={t('search.empty')} hint={t('search.emptyHint')} />
          ) : (
            <AdGrid ads={data?.items} categories={categories} loading={isLoading} skeletons={PAGE_SIZE} />
          )}
          {pages > 1 && (
            <Stack alignItems="center" sx={{ mt: 4 }}>
              <Pagination count={pages} page={page} onChange={(_, p) => onPage(p)} color="primary" shape="rounded" />
            </Stack>
          )}
        </Box>
      </Box>

      <Drawer anchor="bottom" open={drawer} onClose={() => setDrawer(false)} slotProps={{ paper: { sx: { borderTopLeftRadius: 24, borderTopRightRadius: 24, p: 3, maxHeight: '85vh' } } }}>
        {filterPanel}
        <Button variant="contained" onClick={() => setDrawer(false)} sx={{ mt: 2 }}>{t('common.apply')}</Button>
      </Drawer>
    </Container>
  );
}

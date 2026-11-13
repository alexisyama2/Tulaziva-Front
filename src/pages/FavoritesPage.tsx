import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Button, Container, Pagination, Stack, Typography } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/FavoriteBorderRounded';
import { useTranslation } from 'react-i18next';
import AdGrid from '@/components/ads/AdGrid';
import EmptyState from '@/components/common/EmptyState';
import ErrorState from '@/components/common/ErrorState';
import { useCategories } from '@/hooks/useAds';
import { useFavorites } from '@/hooks/useFavorites';

export default function FavoritesPage() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error, refetch } = useFavorites(page);
  const { data: categories } = useCategories();
  const pages = data ? Math.ceil(data.totalCount / data.pageSize) : 0;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 0.5 }}>{t('favorites.title')}</Typography>
      {data && <Typography color="text.secondary" sx={{ mb: 3 }}>{t('common.results', { count: data.totalCount })}</Typography>}

      {isError ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : data && data.items.length === 0 ? (
        <EmptyState
          icon={<FavoriteIcon />}
          title={t('favorites.empty')}
          hint={t('favorites.emptyHint')}
          action={<Button component={RouterLink} to="/ads" variant="contained">{t('nav.ads')}</Button>}
        />
      ) : (
        <AdGrid ads={data?.items} categories={categories} loading={isLoading} />
      )}

      {pages > 1 && (
        <Stack alignItems="center" sx={{ mt: 4 }}>
          <Pagination count={pages} page={page} onChange={(_, p) => setPage(p)} color="primary" shape="rounded" />
        </Stack>
      )}
    </Container>
  );
}

import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Button, Container, Pagination, Stack, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/AddRounded';
import EditIcon from '@mui/icons-material/EditOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import AutorenewIcon from '@mui/icons-material/AutorenewRounded';
import InventoryIcon from '@mui/icons-material/Inventory2Outlined';
import { useTranslation } from 'react-i18next';
import AdGrid from '@/components/ads/AdGrid';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import EmptyState from '@/components/common/EmptyState';
import ErrorState, { errorMessages } from '@/components/common/ErrorState';
import { useNotify } from '@/context/NotificationContext';
import { useCategories, useDeleteAd, useMyAds, useRenewAd } from '@/hooks/useAds';
import type { AdSummary } from '@/types/api';

export default function MyAdsPage() {
  const { t } = useTranslation();
  const { success, error: notifyError } = useNotify();
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error, refetch } = useMyAds(page);
  const { data: categories } = useCategories();
  const del = useDeleteAd();
  const renew = useRenewAd();
  const [toDelete, setToDelete] = useState<string | null>(null);

  const doRenew = async (id: string) => {
    try {
      await renew.mutateAsync(id);
      success(t('myAds.renewed'));
    } catch (e) {
      notifyError(errorMessages(e, t('errors.generic')).join(' '));
    }
  };

  const doDelete = async () => {
    if (!toDelete) return;
    try {
      await del.mutateAsync(toDelete);
      success(t('myAds.deleted'));
    } catch (e) {
      notifyError(errorMessages(e, t('errors.generic')).join(' '));
    } finally {
      setToDelete(null);
    }
  };

  const footer = (ad: AdSummary) => (
    <Stack direction="row" gap={0.5} justifyContent="space-between" sx={{ p: 1, borderTop: 1, borderColor: 'divider' }}>
      <Button size="small" startIcon={<AutorenewIcon />} onClick={() => doRenew(ad.id)} disabled={renew.isPending}>{t('myAds.renew')}</Button>
      <Stack direction="row">
        <Button size="small" component={RouterLink} to={`/ads/${ad.id}/edit`} aria-label={t('common.edit')} sx={{ minWidth: 0 }}><EditIcon fontSize="small" /></Button>
        <Button size="small" color="error" onClick={() => setToDelete(ad.id)} aria-label={t('common.delete')} sx={{ minWidth: 0 }}><DeleteIcon fontSize="small" /></Button>
      </Stack>
    </Stack>
  );

  const pages = data ? Math.ceil(data.totalCount / data.pageSize) : 0;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4">{t('myAds.title')}</Typography>
        <Button component={RouterLink} to="/ads/new" variant="contained" startIcon={<AddIcon />}>{t('nav.publish')}</Button>
      </Stack>

      {isError ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : data && data.items.length === 0 ? (
        <EmptyState
          icon={<InventoryIcon />}
          title={t('myAds.empty')}
          hint={t('myAds.emptyHint')}
          action={<Button component={RouterLink} to="/ads/new" variant="contained">{t('nav.publish')}</Button>}
        />
      ) : (
        <AdGrid
          ads={data?.items}
          categories={categories}
          loading={isLoading}
          renderFooter={footer}
        />
      )}

      {pages > 1 && (
        <Stack alignItems="center" sx={{ mt: 4 }}>
          <Pagination count={pages} page={page} onChange={(_, p) => setPage(p)} color="primary" shape="rounded" />
        </Stack>
      )}

      <ConfirmDialog
        open={!!toDelete}
        title={t('myAds.deleteConfirmTitle')}
        text={t('myAds.deleteConfirmText')}
        destructive
        confirmLabel={t('common.delete')}
        loading={del.isPending}
        onConfirm={doDelete}
        onClose={() => setToDelete(null)}
      />
    </Container>
  );
}

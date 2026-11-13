import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Button,
  Chip,
  CircularProgress,
  Link,
  Pagination,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';
import BlockIcon from '@mui/icons-material/BlockRounded';
import CheckIcon from '@mui/icons-material/CheckRounded';
import { useTranslation } from 'react-i18next';
import { adminApi } from '@/api';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import EmptyState from '@/components/common/EmptyState';
import ErrorState, { errorMessages } from '@/components/common/ErrorState';
import { useNotify } from '@/context/NotificationContext';
import { adKeys } from '@/hooks/useAds';
import { formatDateTime } from '@/utils/format';
import type { Report, ReportStatus } from '@/types/api';

type Filter = ReportStatus | 'all';
const FILTERS: Filter[] = ['open', 'resolved', 'dismissed', 'all'];

const statusColor: Record<ReportStatus, 'warning' | 'success' | 'default'> = {
  open: 'warning',
  resolved: 'success',
  dismissed: 'default',
};

export default function ReportsTab() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const { success, error } = useNotify();
  const [filter, setFilter] = useState<Filter>('open');
  const [page, setPage] = useState(1);
  const [toResolve, setToResolve] = useState<Report | null>(null);

  const { data, isLoading, isError, error: loadError, refetch } = useQuery({
    queryKey: ['admin', 'reports', filter, page],
    queryFn: () => adminApi.reports(filter === 'all' ? undefined : filter, page),
    placeholderData: (previous) => previous,
  });

  const onDone = (message: string) => {
    success(message);
    void qc.invalidateQueries({ queryKey: ['admin', 'reports'] });
    // Taking an ad down changes what the public sees.
    void qc.invalidateQueries({ queryKey: adKeys.all });
  };
  const onFail = (e: unknown) => error(errorMessages(e, t('errors.generic')).join(' '));

  const resolve = useMutation({
    mutationFn: (id: string) => adminApi.resolveReport(id),
    onSuccess: () => {
      setToResolve(null);
      onDone(t('admin.reportResolved'));
    },
    onError: onFail,
  });

  const dismiss = useMutation({
    mutationFn: (id: string) => adminApi.dismissReport(id),
    onSuccess: () => onDone(t('admin.reportDismissed')),
    onError: onFail,
  });

  const pages = data ? Math.ceil(data.totalCount / data.pageSize) : 0;

  return (
    <>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} gap={2} sx={{ mb: 2 }}>
        <ToggleButtonGroup
          exclusive
          size="small"
          value={filter}
          onChange={(_, value: Filter | null) => {
            if (value) {
              setFilter(value);
              setPage(1);
            }
          }}
        >
          {FILTERS.map((f) => (
            <ToggleButton key={f} value={f} sx={{ px: 2, textTransform: 'none' }}>
              {t(`admin.reportFilter.${f}`)}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
        {data && <Typography color="text.secondary">{t('common.results', { count: data.totalCount })}</Typography>}
      </Stack>

      {isError ? (
        <ErrorState error={loadError} onRetry={() => refetch()} />
      ) : isLoading ? (
        <CircularProgress />
      ) : data && data.items.length === 0 ? (
        <EmptyState icon={<CheckIcon />} title={t('admin.reportsEmpty')} />
      ) : (
        <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>{t('admin.reportAd')}</TableCell>
                  <TableCell>{t('admin.reportReason')}</TableCell>
                  <TableCell>{t('admin.reportBy')}</TableCell>
                  <TableCell>{t('admin.date')}</TableCell>
                  <TableCell>{t('admin.reportStatus')}</TableCell>
                  <TableCell align="right" />
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.items.map((r) => (
                  <TableRow key={r.id} hover>
                    <TableCell sx={{ maxWidth: 280 }}>
                      {r.adState === 'deleted' ? (
                        <Typography variant="body2" color="text.secondary" noWrap>{r.adTitle} · {t('admin.adDeleted')}</Typography>
                      ) : (
                        <Link component={RouterLink} to={`/ads/${r.adId}`} underline="hover" noWrap display="block">{r.adTitle}</Link>
                      )}
                      {r.adState === 'removed' && <Chip size="small" label={t('admin.adRemoved')} sx={{ mt: 0.5 }} />}
                    </TableCell>
                    <TableCell sx={{ maxWidth: 260 }}>
                      <Typography variant="body2" fontWeight={600}>{t(`report.reasons.${r.reason}`)}</Typography>
                      {r.details && <Typography variant="caption" color="text.secondary" sx={{ display: 'block', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{r.details}</Typography>}
                    </TableCell>
                    <TableCell>{r.reporterDisplayName}</TableCell>
                    <TableCell>{formatDateTime(r.createdAtUtc)}</TableCell>
                    <TableCell><Chip size="small" color={statusColor[r.status]} label={t(`admin.reportFilter.${r.status}`)} /></TableCell>
                    <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                      {r.status === 'open' && (
                        <>
                          <Tooltip title={t('admin.reportDismissHint')}>
                            <span>
                              <Button size="small" startIcon={<CheckIcon />} disabled={dismiss.isPending} onClick={() => dismiss.mutate(r.id)}>
                                {t('admin.reportDismiss')}
                              </Button>
                            </span>
                          </Tooltip>
                          <Tooltip title={t('admin.reportResolveHint')}>
                            <span>
                              <Button size="small" color="error" startIcon={<BlockIcon />} disabled={resolve.isPending} onClick={() => setToResolve(r)}>
                                {t('admin.reportResolve')}
                              </Button>
                            </span>
                          </Tooltip>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {pages > 1 && (
            <Stack alignItems="center" sx={{ p: 2 }}>
              <Pagination count={pages} page={page} onChange={(_, p) => setPage(p)} color="primary" shape="rounded" />
            </Stack>
          )}
        </Paper>
      )}

      <ConfirmDialog
        open={!!toResolve}
        title={t('admin.reportResolve')}
        text={t('admin.reportResolveConfirm', { title: toResolve?.adTitle ?? '' })}
        destructive
        loading={resolve.isPending}
        onConfirm={() => toResolve && resolve.mutate(toResolve.id)}
        onClose={() => setToResolve(null)}
      />
    </>
  );
}

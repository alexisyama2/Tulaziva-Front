import { Navigate, useParams } from 'react-router-dom';
import { Container, Paper, Skeleton, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import AdForm from '@/components/ads/AdForm';
import ErrorState from '@/components/common/ErrorState';
import { useAuth } from '@/context/AuthContext';
import { useAd } from '@/hooks/useAds';

/** Create (/ads/new) or edit (/ads/:id/edit). */
export default function AdFormPage() {
  const { id } = useParams();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data: ad, isLoading, isError, error } = useAd(id);

  let body;
  if (id) {
    if (isLoading) body = <Skeleton variant="rounded" height={480} />;
    else if (isError || !ad) body = <ErrorState error={error} />;
    else if (ad.ownerId !== user?.id) return <Navigate to={`/ads/${id}`} replace />;
    // key: reset the form state if another ad is loaded
    else body = <AdForm key={ad.id} ad={ad} />;
  } else {
    body = <AdForm />;
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>{id ? t('form.editTitle') : t('form.createTitle')}</Typography>
      <Paper sx={{ p: { xs: 2.5, md: 4 }, borderRadius: 4 }}>{body}</Paper>
    </Container>
  );
}

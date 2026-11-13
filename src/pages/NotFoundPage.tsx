import { Link as RouterLink } from 'react-router-dom';
import { Button, Container } from '@mui/material';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfiedRounded';
import { useTranslation } from 'react-i18next';
import EmptyState from '@/components/common/EmptyState';

export default function NotFoundPage() {
  const { t } = useTranslation();
  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <EmptyState
        icon={<SentimentDissatisfiedIcon />}
        title={t('notFound.title')}
        hint={t('notFound.text')}
        action={<Button component={RouterLink} to="/" variant="contained">{t('notFound.home')}</Button>}
      />
    </Container>
  );
}

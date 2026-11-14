import { Link as RouterLink } from 'react-router-dom';
import { Box, Container, Link, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import Logo from '@/components/common/Logo';

export default function Footer() {
  const { t } = useTranslation();
  return (
    <Box component="footer" sx={{ mt: 8, py: 4, borderTop: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
      <Container maxWidth="lg">
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} gap={2}>
          <Stack gap={0.5}>
            <Logo />
            <Typography variant="body2" color="text.secondary">{t('footer.madeWith')}</Typography>
          </Stack>
          <Stack alignItems={{ xs: 'flex-start', sm: 'flex-end' }} gap={0.5}>
            <Stack direction="row" gap={2}>
              <Link component={RouterLink} to="/terms" variant="body2" color="text.secondary" underline="hover">{t('footer.terms')}</Link>
              <Link component={RouterLink} to="/privacy" variant="body2" color="text.secondary" underline="hover">{t('footer.privacy')}</Link>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              {t('footer.rights', { year: new Date().getFullYear() })}
            </Typography>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}

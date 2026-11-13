import { Box, Container, Stack, Typography } from '@mui/material';
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
          <Typography variant="body2" color="text.secondary">
            {t('footer.rights', { year: new Date().getFullYear() })}
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
}

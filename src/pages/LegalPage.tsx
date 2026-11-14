import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Container, Link, Paper, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { legalContent, type LegalKind } from '@/content/legal';

/** The terms of use and the privacy notice. The text is in src/content/legal.ts, in both languages. */
export default function LegalPage({ kind }: { kind: LegalKind }) {
  const { t, i18n } = useTranslation();
  const doc = legalContent(kind, i18n.resolvedLanguage);
  const other: LegalKind = kind === 'terms' ? 'privacy' : 'terms';

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: { xs: 2.5, sm: 5 }, borderRadius: 4 }}>
        <Typography variant="h3" component="h1" sx={{ fontSize: { xs: '1.9rem', sm: '2.4rem' } }}>{doc.title}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 3 }}>{doc.updated}</Typography>

        <Stack gap={1.5} sx={{ mb: 2 }}>
          {doc.intro.map((p) => (
            <Typography key={p} color="text.secondary">{p}</Typography>
          ))}
        </Stack>

        {doc.sections.map((section, i) => (
          <Box key={section.title} component="section" sx={{ mt: 3.5 }}>
            <Typography variant="h6" component="h2" gutterBottom>{`${i + 1}. ${section.title}`}</Typography>
            <Stack gap={1.25}>
              {section.paragraphs?.map((p) => (
                <Typography key={p} color="text.secondary">{p}</Typography>
              ))}
              {section.items && (
                <Box component="ul" sx={{ m: 0, pl: 3, display: 'grid', gap: 0.75, color: 'text.secondary' }}>
                  {section.items.map((item) => (
                    <li key={item}><Typography component="span" color="text.secondary">{item}</Typography></li>
                  ))}
                </Box>
              )}
              {section.after?.map((p) => (
                <Typography key={p} color="text.secondary">{p}</Typography>
              ))}
            </Stack>
          </Box>
        ))}

        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} gap={2} sx={{ mt: 5 }}>
          <Link component={RouterLink} to={other === 'terms' ? '/terms' : '/privacy'} fontWeight={600}>
            {t(other === 'terms' ? 'legal.seeTerms' : 'legal.seePrivacy')}
          </Link>
          <Button component={RouterLink} to="/" variant="outlined">{t('notFound.home')}</Button>
        </Stack>
      </Paper>
    </Container>
  );
}

import type { ReactNode } from 'react';
import { Box, Container, Paper, Typography } from '@mui/material';
import { gradients } from '@/theme/theme';

interface Props {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export default function AuthLayout({ title, subtitle, children }: Props) {
  return (
    <Box sx={{ background: gradients.hero, minHeight: 'calc(100vh - 64px)', display: 'grid', placeItems: 'center', py: 6 }}>
      <Container maxWidth="xs">
        <Paper sx={{ p: { xs: 3, sm: 4 }, borderRadius: 5, boxShadow: '0 30px 80px rgba(0,0,0,.35)' }}>
          <Typography variant="h4" gutterBottom>{title}</Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>{subtitle}</Typography>
          {children}
        </Paper>
      </Container>
    </Box>
  );
}

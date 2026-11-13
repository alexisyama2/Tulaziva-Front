import { Box, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { gradients } from '@/theme/theme';

export default function Logo({ light = false }: { light?: boolean }) {
  return (
    <Box component={RouterLink} to="/" sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, textDecoration: 'none', color: 'inherit' }}>
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: '11px',
          background: gradients.brand,
          display: 'grid',
          placeItems: 'center',
          color: '#fff',
          fontWeight: 800,
          fontSize: 20,
        }}
      >
        T
      </Box>
      <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.03em', color: light ? '#fff' : 'text.primary' }}>
        Tulaziva
      </Typography>
    </Box>
  );
}

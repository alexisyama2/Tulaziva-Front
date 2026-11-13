import type { ReactNode } from 'react';
import { Box, Typography } from '@mui/material';

interface Props {
  icon?: ReactNode;
  title: string;
  hint?: string;
  action?: ReactNode;
}

export default function EmptyState({ icon, title, hint, action }: Props) {
  return (
    <Box sx={{ textAlign: 'center', py: 8, px: 2 }}>
      {icon && (
        <Box
          sx={{
            width: 72,
            height: 72,
            mx: 'auto',
            mb: 2,
            display: 'grid',
            placeItems: 'center',
            borderRadius: '50%',
            bgcolor: 'primary.main',
            color: '#fff',
            opacity: 0.9,
            '& svg': { fontSize: 36 },
          }}
        >
          {icon}
        </Box>
      )}
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      {hint && (
        <Typography color="text.secondary" sx={{ maxWidth: 420, mx: 'auto' }}>
          {hint}
        </Typography>
      )}
      {action && <Box sx={{ mt: 3 }}>{action}</Box>}
    </Box>
  );
}

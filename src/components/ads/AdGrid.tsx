import type { ReactNode } from 'react';
import { Box, Card, Skeleton } from '@mui/material';
import type { AdSummary, Category } from '@/types/api';
import AdCard from './AdCard';

const GRID = {
  display: 'grid',
  gap: 2.5,
  gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' },
} as const;

interface Props {
  ads?: AdSummary[];
  categories?: Category[];
  loading?: boolean;
  skeletons?: number;
  renderFooter?: (ad: AdSummary) => ReactNode;
  renderBadge?: (ad: AdSummary) => ReactNode;
}

export default function AdGrid({ ads, categories, loading, skeletons = 8, renderFooter, renderBadge }: Props) {
  if (loading && !ads?.length)
    return (
      <Box sx={GRID}>
        {Array.from({ length: skeletons }).map((_, i) => (
          <Card key={i}>
            <Skeleton variant="rectangular" sx={{ aspectRatio: '4 / 3', height: 'auto' }} />
            <Box sx={{ p: 2 }}>
              <Skeleton width="40%" height={32} />
              <Skeleton width="90%" />
              <Skeleton width="60%" />
            </Box>
          </Card>
        ))}
      </Box>
    );

  return (
    <Box sx={GRID}>
      {ads?.map((ad) => (
        <AdCard
          key={ad.id}
          ad={ad}
          categoryName={categories?.find((c) => c.id === ad.categoryId)?.name}
          footer={renderFooter?.(ad)}
          badge={renderBadge?.(ad)}
        />
      ))}
    </Box>
  );
}

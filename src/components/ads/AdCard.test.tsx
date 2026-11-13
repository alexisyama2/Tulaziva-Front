import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdCard from './AdCard';
import type { AdSummary } from '@/types/api';

// The heart has its own tests; here it would only need a session and a query client.
vi.mock('./FavoriteButton', () => ({ default: () => <button aria-label="favorite" /> }));

const ad: AdSummary = {
  id: 'ad-1',
  categoryId: 5,
  title: 'iPhone 13 128GB',
  price: 9500,
  currency: 'MXN',
  latitude: 19.4,
  longitude: -99.1,
  distanceKm: 3.2,
  coverImageUrl: '/api/ads/ad-1/images/img-1',
  createdAtUtc: '2026-11-05T10:00:00',
  featuredUntilUtc: null,
};

const inDays = (days: number) => new Date(Date.now() + days * 86_400_000).toISOString().replace('Z', '');

const renderCard = (props: Partial<React.ComponentProps<typeof AdCard>> = {}) =>
  render(<MemoryRouter><AdCard ad={ad} {...props} /></MemoryRouter>);

describe('AdCard', () => {
  it('shows title, price, category, distance and links to the detail page', () => {
    renderCard({ categoryName: 'Electronics' });

    expect(screen.getByText('iPhone 13 128GB')).toBeInTheDocument();
    expect(screen.getByText(/9,500/)).toBeInTheDocument();
    expect(screen.getByText('Electronics')).toBeInTheDocument();
    expect(screen.getByText('3.2 km away')).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute('href', '/ads/ad-1');
    expect(screen.getByRole('img', { name: 'iPhone 13 128GB' })).toHaveAttribute('src', '/api/ads/ad-1/images/img-1');
  });

  it('shows a placeholder without cover image and hides distance when unknown', () => {
    renderCard({ ad: { ...ad, coverImageUrl: null, distanceKm: null } });

    expect(screen.getByText('No image')).toBeInTheDocument();
    expect(screen.queryByText(/km away/)).not.toBeInTheDocument();
  });

  it('renders the footer (actions of "my ads")', () => {
    renderCard({ footer: <button>Renew</button> });
    expect(screen.getByRole('button', { name: 'Renew' })).toBeInTheDocument();
  });

  it('shows the featured badge while the featuring lasts, and not after it', () => {
    const { unmount } = renderCard({ ad: { ...ad, featuredUntilUtc: inDays(2) } });
    expect(screen.getByText('Featured')).toBeInTheDocument();
    unmount();

    renderCard({ ad: { ...ad, featuredUntilUtc: inDays(-1) } });
    expect(screen.queryByText('Featured')).not.toBeInTheDocument();
  });
});

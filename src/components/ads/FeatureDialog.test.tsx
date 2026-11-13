import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FeatureDialog from './FeatureDialog';
import { ApiError } from '@/api';
import { renderWithProviders } from '@/test/utils';

const mocks = vi.hoisted(() => ({ featuringOptions: vi.fn(), feature: vi.fn(), unfeature: vi.fn() }));

vi.mock('@/api', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/api')>();
  return { ...original, adsApi: { ...original.adsApi, ...mocks } };
});

const inDays = (days: number) => new Date(Date.now() + days * 86_400_000).toISOString().replace('Z', '');

beforeEach(() => {
  vi.clearAllMocks();
  mocks.featuringOptions.mockResolvedValue({ ownersCanFeature: true, plans: [3, 7, 30] });
});

describe('FeatureDialog', () => {
  it('features the ad for the first duration, or for the one that was chosen', async () => {
    mocks.feature.mockResolvedValue({});
    const onClose = vi.fn();
    renderWithProviders(<FeatureDialog adId="ad-1" featuredUntilUtc={null} open onClose={onClose} />);

    await userEvent.click(await screen.findByRole('button', { name: '7 days' }));
    await userEvent.click(screen.getByRole('button', { name: 'Feature ad' }));

    await waitFor(() => expect(mocks.feature).toHaveBeenCalledWith('ad-1', 7));
    expect(onClose).toHaveBeenCalled();
    expect(screen.queryByRole('button', { name: 'Stop featuring' })).not.toBeInTheDocument();
  });

  it('offers to stop an ad that is already featured', async () => {
    mocks.unfeature.mockResolvedValue({});
    const onClose = vi.fn();
    renderWithProviders(<FeatureDialog adId="ad-1" featuredUntilUtc={inDays(5)} open onClose={onClose} />);

    await userEvent.click(await screen.findByRole('button', { name: 'Stop featuring' }));

    await waitFor(() => expect(mocks.unfeature).toHaveBeenCalledWith('ad-1'));
    expect(onClose).toHaveBeenCalled();
  });

  it('stays open and says why when the API refuses', async () => {
    mocks.feature.mockRejectedValue(new ApiError(403, { detail: 'Featuring ads is not available at the moment.' }));
    const onClose = vi.fn();
    renderWithProviders(<FeatureDialog adId="ad-1" featuredUntilUtc={null} open onClose={onClose} />);

    await userEvent.click(await screen.findByRole('button', { name: 'Feature ad' }));

    expect(await screen.findByText('Featuring ads is not available at the moment.')).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });
});

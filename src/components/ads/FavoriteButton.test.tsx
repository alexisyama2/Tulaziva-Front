import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FavoriteButton from './FavoriteButton';
import { makeUser, renderWithProviders } from '@/test/utils';
import type { User } from '@/types/api';

const auth = vi.hoisted(() => ({ user: null as User | null }));
vi.mock('@/context/AuthContext', () => ({ useAuth: () => ({ user: auth.user }) }));

// A tiny fake server: what was saved is what the next list of ids returns (the hook refetches after every change).
const api = vi.hoisted(() => ({ saved: [] as string[], ids: vi.fn(), add: vi.fn(), remove: vi.fn() }));
vi.mock('@/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/api')>()),
  favoritesApi: { ids: api.ids, add: api.add, remove: api.remove, list: vi.fn() },
}));

describe('FavoriteButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    auth.user = makeUser();
    api.saved = [];
    api.ids.mockImplementation(async () => [...api.saved]);
    api.add.mockImplementation(async (id: string) => void api.saved.push(id));
    api.remove.mockImplementation(async (id: string) => void (api.saved = api.saved.filter((x) => x !== id)));
  });

  it('saves the ad: the heart changes at once and the API is called', async () => {
    renderWithProviders(<FavoriteButton adId="ad-1" />);

    const button = await screen.findByRole('button', { name: 'Save to favorites' });
    expect(button).toHaveAttribute('aria-pressed', 'false');

    await userEvent.click(button);

    expect(await screen.findByRole('button', { name: 'Remove from favorites' })).toHaveAttribute('aria-pressed', 'true');
    expect(api.add).toHaveBeenCalledWith('ad-1');
  });

  it('removes an ad that was saved', async () => {
    api.saved = ['ad-1', 'ad-2'];
    renderWithProviders(<FavoriteButton adId="ad-1" />);

    await userEvent.click(await screen.findByRole('button', { name: 'Remove from favorites' }));

    await waitFor(() => expect(api.remove).toHaveBeenCalledWith('ad-1'));
    expect(await screen.findByRole('button', { name: 'Save to favorites' })).toBeInTheDocument();
  });

  it('goes back to the empty heart and says why when the server refuses', async () => {
    api.add.mockRejectedValue(new Error('boom'));
    renderWithProviders(<FavoriteButton adId="ad-1" />);

    await userEvent.click(await screen.findByRole('button', { name: 'Save to favorites' }));

    expect(await screen.findByText('Something went wrong. Please try again.')).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: 'Save to favorites' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('sends anonymous visitors to sign in, without calling the API', async () => {
    auth.user = null;
    renderWithProviders(<FavoriteButton adId="ad-1" />);

    await userEvent.click(screen.getByRole('button', { name: 'Save to favorites' }));

    expect(await screen.findByText('login page')).toBeInTheDocument();
    expect(api.add).not.toHaveBeenCalled();
    expect(api.ids).not.toHaveBeenCalled();
  });

  it('does not follow the link of the card it sits on', async () => {
    const onLink = vi.fn();
    renderWithProviders(
      <a href="#card" onClick={onLink}>
        <FavoriteButton adId="ad-1" />
      </a>,
    );

    await userEvent.click(await screen.findByRole('button', { name: 'Save to favorites' }));

    expect(onLink).not.toHaveBeenCalled();
  });
});

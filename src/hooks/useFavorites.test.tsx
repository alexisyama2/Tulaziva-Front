import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { favoriteKeys, useToggleFavorite } from './useFavorites';
import { makeClient } from '@/test/utils';

const api = vi.hoisted(() => ({ add: vi.fn(), remove: vi.fn() }));
vi.mock('@/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/api')>()),
  favoritesApi: { add: api.add, remove: api.remove, ids: vi.fn(), list: vi.fn() },
}));
vi.mock('@/context/AuthContext', () => ({ useAuth: () => ({ user: null }) }));

describe('useToggleFavorite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.add.mockResolvedValue(undefined);
    api.remove.mockResolvedValue(undefined);
  });

  const setup = (initial: string[]) => {
    const client = makeClient();
    client.setQueryData(favoriteKeys.ids, initial);
    const wrapper = ({ children }: { children: ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;
    return { client, ...renderHook(() => useToggleFavorite(), { wrapper }) };
  };

  it('adds the id to the cache before the server answers', async () => {
    let finish: () => void = () => undefined;
    api.add.mockReturnValue(new Promise<void>((resolve) => (finish = resolve)));
    const { client, result } = setup(['a']);

    result.current.mutate({ adId: 'b', favorite: true });

    await waitFor(() => expect(client.getQueryData(favoriteKeys.ids)).toEqual(['b', 'a']));
    finish();
  });

  it('does not duplicate an id that is already saved', async () => {
    const { client, result } = setup(['a']);

    result.current.mutate({ adId: 'a', favorite: true });

    await waitFor(() => expect(api.add).toHaveBeenCalled());
    expect(client.getQueryData(favoriteKeys.ids)).toEqual(['a']);
  });

  it('removes the id', async () => {
    const { client, result } = setup(['a', 'b']);

    result.current.mutate({ adId: 'a', favorite: false });

    await waitFor(() => expect(api.remove).toHaveBeenCalledWith('a'));
    expect(client.getQueryData(favoriteKeys.ids)).toEqual(['b']);
  });

  it('puts the cache back when the server refuses', async () => {
    api.add.mockRejectedValue(new Error('refused'));
    const { client, result } = setup(['a']);

    result.current.mutate({ adId: 'b', favorite: true });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(client.getQueryData(favoriteKeys.ids)).toEqual(['a']);
  });
});

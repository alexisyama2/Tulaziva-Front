import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError, buildQuery, request, tokenStore, UNAUTHORIZED_EVENT } from './client';

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

describe('buildQuery', () => {
  it('skips empty values and encodes the rest', () => {
    expect(buildQuery({ text: 'a b', page: 2, empty: '', none: undefined, nil: null })).toBe('?text=a+b&page=2');
  });

  it('returns an empty string without params', () => {
    expect(buildQuery({})).toBe('');
    expect(buildQuery()).toBe('');
  });
});

describe('ApiError', () => {
  it('prefers detail, and flattens validation errors into messages', () => {
    const err = new ApiError(400, { title: 'Validation', errors: { Email: ['Bad email'], Password: ['Too short', 'No digit'] } });
    expect(err.messages).toEqual(['Bad email', 'Too short', 'No digit']);
    expect(new ApiError(409, { detail: 'Email taken' }).message).toBe('Email taken');
  });
});

describe('request', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });
  afterEach(() => vi.unstubAllGlobals());

  it('sends the language and the bearer token, and prefixes /api', async () => {
    tokenStore.set('abc');
    fetchMock.mockResolvedValue(json({ ok: true }));

    await request('/ads', { query: { page: 1 } });

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('/api/ads?page=1');
    expect(init.headers).toMatchObject({ 'Accept-Language': 'en', Authorization: 'Bearer abc' });
  });

  it('sends JSON bodies with a content type', async () => {
    fetchMock.mockResolvedValue(json({}));
    await request('/auth/login', { method: 'POST', json: { email: 'a@b.c' } });

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(init.body).toBe('{"email":"a@b.c"}');
    expect(init.headers).toMatchObject({ 'Content-Type': 'application/json' });
  });

  it('returns undefined for 204', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));
    await expect(request('/ads/1', { method: 'DELETE' })).resolves.toBeUndefined();
  });

  it('throws an ApiError with the problem details', async () => {
    fetchMock.mockResolvedValue(json({ title: 'Not Found', detail: 'Ad not found' }, 404));
    await expect(request('/ads/x')).rejects.toMatchObject({ status: 404, message: 'Ad not found' });
  });

  it('announces an expired session only when a token was sent', async () => {
    const listener = vi.fn();
    window.addEventListener(UNAUTHORIZED_EVENT, listener);
    fetchMock.mockResolvedValue(json({ detail: 'nope' }, 401));

    await expect(request('/auth/login', { method: 'POST', json: {} })).rejects.toBeInstanceOf(ApiError);
    expect(listener).not.toHaveBeenCalled();

    tokenStore.set('expired');
    await expect(request('/users/me')).rejects.toBeInstanceOf(ApiError);
    expect(listener).toHaveBeenCalledTimes(1);

    window.removeEventListener(UNAUTHORIZED_EVENT, listener);
  });

  it('turns a network failure into a friendly ApiError', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));
    await expect(request('/ads')).rejects.toMatchObject({ status: 0, message: expect.stringContaining('server') });
  });
});

describe('session renewal', () => {
  const fetchMock = vi.fn();
  const listener = vi.fn();
  const session = (token: string, refreshToken: string) => json({ token, refreshToken, expiresAtUtc: '2030-01-01T00:00:00', user: {} });

  beforeEach(() => {
    fetchMock.mockReset();
    listener.mockReset();
    vi.stubGlobal('fetch', fetchMock);
    window.addEventListener(UNAUTHORIZED_EVENT, listener);
    tokenStore.set('old-token');
    tokenStore.setRefresh('refresh-1');
  });
  afterEach(() => {
    window.removeEventListener(UNAUTHORIZED_EVENT, listener);
    vi.unstubAllGlobals();
    tokenStore.clear();
  });

  it('renews the session on a 401 and sends the request again with the new token', async () => {
    fetchMock
      .mockResolvedValueOnce(json({ detail: 'expired' }, 401))
      .mockResolvedValueOnce(session('new-token', 'refresh-2'))
      .mockResolvedValueOnce(json({ id: 1 }));

    await expect(request('/users/me')).resolves.toEqual({ id: 1 });

    const [refreshUrl, refreshInit] = fetchMock.mock.calls[1] as [string, RequestInit];
    expect(refreshUrl).toBe('/api/auth/refresh');
    expect(refreshInit.body).toBe('{"refreshToken":"refresh-1"}');
    expect((fetchMock.mock.calls[2] as [string, RequestInit])[1].headers).toMatchObject({ Authorization: 'Bearer new-token' });
    expect(tokenStore.get()).toBe('new-token');
    expect(tokenStore.getRefresh()).toBe('refresh-2');
    expect(listener).not.toHaveBeenCalled();
  });

  it('shares one renewal between the requests that fail together (the refresh token works once)', async () => {
    fetchMock.mockImplementation((url: string, init: RequestInit) => {
      if (url === '/api/auth/refresh') return Promise.resolve(session('new-token', 'refresh-2'));
      const auth = (init.headers as Record<string, string>).Authorization;
      return Promise.resolve(auth === 'Bearer new-token' ? json({ ok: true }) : json({ detail: 'expired' }, 401));
    });

    await Promise.all([request('/ads/mine'), request('/favorites/ids'), request('/blocks')]);

    expect(fetchMock.mock.calls.filter(([url]) => url === '/api/auth/refresh')).toHaveLength(1);
  });

  it('ends the session when the refresh token is refused', async () => {
    fetchMock.mockResolvedValueOnce(json({ detail: 'expired' }, 401)).mockResolvedValueOnce(json({ detail: 'dead' }, 401));

    await expect(request('/users/me')).rejects.toMatchObject({ status: 401 });

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('does not end the session when the renewal fails because the network is down', async () => {
    fetchMock.mockResolvedValueOnce(json({ detail: 'expired' }, 401)).mockRejectedValueOnce(new TypeError('Failed to fetch'));

    await expect(request('/users/me')).rejects.toMatchObject({ status: 401 });

    expect(listener).not.toHaveBeenCalled();
    expect(tokenStore.getRefresh()).toBe('refresh-1');
  });

  it('retries with what another tab stored when it renewed the session first', async () => {
    fetchMock.mockImplementationOnce(() => {
      // While this request was in flight another tab renewed the session.
      tokenStore.set('tab-token');
      tokenStore.setRefresh('tab-refresh');
      return Promise.resolve(json({ detail: 'expired' }, 401));
    });
    fetchMock.mockResolvedValueOnce(json({ ok: true }));

    await expect(request('/users/me')).resolves.toEqual({ ok: true });

    expect(fetchMock).toHaveBeenCalledTimes(2); // no renewal of its own
    expect((fetchMock.mock.calls[1] as [string, RequestInit])[1].headers).toMatchObject({ Authorization: 'Bearer tab-token' });
  });

  it('does not try to renew a failed login', async () => {
    fetchMock.mockResolvedValue(json({ detail: 'bad credentials' }, 401));

    await expect(request('/auth/login', { method: 'POST', json: {} })).rejects.toMatchObject({ status: 401 });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(listener).not.toHaveBeenCalled();
  });
});

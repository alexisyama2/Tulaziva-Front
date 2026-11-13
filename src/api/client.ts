import i18n from '@/i18n';
import type { AuthResponse, ProblemDetails } from '@/types/api';

const BASE = '/api';
const TOKEN_KEY = 'tulaziva.token';
const REFRESH_KEY = 'tulaziva.refresh';

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  getRefresh: () => localStorage.getItem(REFRESH_KEY),
  setRefresh: (token: string | null) => (token ? localStorage.setItem(REFRESH_KEY, token) : localStorage.removeItem(REFRESH_KEY)),
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

/** Stores the tokens of a session the API just handed out. */
export function storeSession(res: Pick<AuthResponse, 'token' | 'refreshToken'>) {
  tokenStore.set(res.token);
  tokenStore.setRefresh(res.refreshToken);
}

/** Fired when the API answers 401 on a request that carried a token and the session could not be renewed. */
export const UNAUTHORIZED_EVENT = 'tulaziva:unauthorized';

export class ApiError extends Error {
  readonly status: number;
  readonly problem?: ProblemDetails;

  constructor(status: number, problem?: ProblemDetails, fallback?: string) {
    super(problem?.detail || problem?.title || fallback || `HTTP ${status}`);
    this.name = 'ApiError';
    this.status = status;
    this.problem = problem;
  }

  /** Field errors flattened (validation problems), or just the main message. */
  get messages(): string[] {
    const fields = this.problem?.errors ? Object.values(this.problem.errors).flat() : [];
    return fields.length ? fields : [this.message];
  }
}

type Query = Record<string, string | number | boolean | null | undefined>;

export function buildQuery(params?: Query): string {
  if (!params) return '';
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

interface RequestOptions {
  method?: string;
  query?: Query;
  json?: unknown;
  form?: FormData;
  signal?: AbortSignal;
}

function buildHeaders(): Record<string, string> {
  const h: Record<string, string> = {
    // The API picks the language of its messages from this header (es / en).
    'Accept-Language': (i18n.resolvedLanguage || 'es').slice(0, 2),
  };
  const token = tokenStore.get();
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

async function readProblem(res: Response): Promise<ApiError> {
  let problem: ProblemDetails | undefined;
  try {
    problem = (await res.json()) as ProblemDetails;
  } catch {
    /* body is not JSON */
  }
  return new ApiError(res.status, problem, res.statusText);
}

// ---- Session renewal ----

type RefreshResult = 'ok' | 'rejected' | 'unavailable';

/** One renewal at a time: the requests that fail together wait for the same one (the refresh token works once). */
let refreshing: Promise<RefreshResult> | null = null;

async function renewSession(): Promise<RefreshResult> {
  const refreshToken = tokenStore.getRefresh();
  if (!refreshToken) return 'rejected';

  let res: Response;
  try {
    res = await fetch(`${BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept-Language': buildHeaders()['Accept-Language'] },
      body: JSON.stringify({ refreshToken }),
    });
  } catch {
    return 'unavailable'; // offline: the session is not over, the request just failed
  }

  if (res.ok) {
    storeSession((await res.json()) as AuthResponse);
    return 'ok';
  }
  if (res.status === 401 || res.status === 400) return 'rejected';
  return 'unavailable';
}

/**
 * Called when a request that carried a token got a 401. Returns true when the request can be sent again with the new token:
 * the session was renewed here, or another request or tab renewed it while this one was in flight.
 */
async function recoverSession(tokenUsed: string | null): Promise<boolean> {
  if (!tokenUsed) return false;

  // Somebody already renewed it: the stored token is not the one that failed.
  if (tokenStore.get() !== tokenUsed) return true;

  const refreshTokenUsed = tokenStore.getRefresh();
  refreshing ??= renewSession().finally(() => {
    refreshing = null;
  });
  const result = await refreshing;

  if (result === 'ok') return true;

  // Another tab may have renewed it at the same moment (its refresh token won and ours was already used).
  if (result === 'rejected' && tokenStore.getRefresh() && tokenStore.getRefresh() !== refreshTokenUsed) return true;

  if (result === 'rejected') window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
  return false;
}

/** Sends the request; on a 401 with a token it renews the session once and sends it again. */
async function send(url: string, makeInit: () => RequestInit, canRecover = true): Promise<Response> {
  const tokenUsed = tokenStore.get();
  let res: Response;
  try {
    res = await fetch(url, makeInit());
  } catch (e) {
    if ((e as Error).name === 'AbortError') throw e;
    throw new ApiError(0, undefined, i18n.t('errors.network'));
  }

  if (res.status === 401 && canRecover && tokenUsed && (await recoverSession(tokenUsed))) {
    try {
      return await fetch(url, makeInit());
    } catch (e) {
      if ((e as Error).name === 'AbortError') throw e;
      throw new ApiError(0, undefined, i18n.t('errors.network'));
    }
  }

  return res;
}

export async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { method = 'GET', query, json, form, signal } = opts;

  // The headers are built for each attempt: after a renewal the second one carries the new token.
  const makeInit = (): RequestInit => {
    const headers = buildHeaders();
    const init: RequestInit = { method, signal, headers };
    if (json !== undefined) {
      init.body = JSON.stringify(json);
      headers['Content-Type'] = 'application/json';
    } else if (form) {
      init.body = form; // the browser sets the multipart boundary
    }
    return init;
  };

  // The auth endpoints answer 401 for wrong credentials or a dead refresh token: that is not a session to renew.
  const res = await send(`${BASE}${path}${buildQuery(query)}`, makeInit, !path.startsWith('/auth/'));

  if (!res.ok) throw await readProblem(res);
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

/** Downloads a protected file (chat attachments need the bearer token, so a plain img src cannot be used). */
export async function fetchBlob(url: string, signal?: AbortSignal): Promise<Blob> {
  const res = await send(url, () => ({ headers: buildHeaders(), signal }));
  if (!res.ok) throw await readProblem(res);
  return res.blob();
}

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { authApi, storeSession, tokenStore, UNAUTHORIZED_EVENT, usersApi, type RegisterInput } from '@/api';
import type { AuthResponse, User } from '@/types/api';
import { useNotify } from './NotificationContext';

interface AuthState {
  user: User | null;
  /** True while the stored token is being validated on startup. */
  loading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (input: RegisterInput) => Promise<User>;
  logout: () => void;
  setUser: (user: User) => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(() => !!tokenStore.get());
  const queryClient = useQueryClient();
  const { i18n, t } = useTranslation();
  const { notify } = useNotify();

  const applySession = useCallback(
    (res: AuthResponse) => {
      storeSession(res);
      setUser(res.user);
      queryClient.clear();
      return res.user;
    },
    [queryClient],
  );

  // Local end of the session: forget the tokens and the data of the user.
  const endSession = useCallback(() => {
    tokenStore.clear();
    setUser(null);
    queryClient.clear();
  }, [queryClient]);

  // The user signs out: the server is also told, so the refresh token cannot be used any more (best effort).
  const logout = useCallback(() => {
    const refreshToken = tokenStore.getRefresh();
    if (refreshToken) authApi.logout(refreshToken).catch(() => undefined);
    endSession();
  }, [endSession]);

  // Restore the session from the stored token.
  useEffect(() => {
    if (!tokenStore.get()) return;
    let cancelled = false;
    usersApi
      .me()
      .then((u) => !cancelled && setUser(u))
      .catch(() => !cancelled && tokenStore.clear())
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  // The API said 401 for a request that carried a token: the session is over.
  useEffect(() => {
    const onUnauthorized = () => {
      endSession();
      notify(t('auth.sessionExpired'), 'warning');
    };
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
  }, [endSession, notify, t]);

  const value = useMemo<AuthState>(
    () => ({
      user,
      loading,
      isAdmin: user?.role === 'Admin',
      login: async (email, password) => applySession(await authApi.login(email, password)),
      register: async (input) =>
        applySession(await authApi.register({ ...input, language: (i18n.resolvedLanguage as 'es' | 'en') ?? 'es' })),
      logout,
      setUser,
    }),
    [user, loading, applySession, logout, i18n.resolvedLanguage],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

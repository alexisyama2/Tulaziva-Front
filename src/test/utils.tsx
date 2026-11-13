import type { ReactElement } from 'react';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { NotificationProvider } from '@/context/NotificationContext';
import type { User } from '@/types/api';

export const makeUser = (overrides: Partial<User> = {}): User => ({
  id: 'user-1',
  email: 'ana@mail.com',
  displayName: 'Ana',
  role: 'User',
  preferredLanguage: 'en',
  latitude: null,
  longitude: null,
  createdAtUtc: '2026-01-01T00:00:00',
  photoUrl: null,
  emailVerified: true,
  ...overrides,
});

export const makeClient = () =>
  new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity }, mutations: { retry: false } } });

interface Options {
  client?: QueryClient;
  route?: string;
}

/** Router, react-query and notifications around the component. Auth is mocked by each test (`vi.mock('@/context/AuthContext')`). */
export function renderWithProviders(ui: ReactElement, { client = makeClient(), route = '/' }: Options = {}) {
  const view = render(
    <QueryClientProvider client={client}>
      <NotificationProvider>
        <MemoryRouter initialEntries={[route]}>
          <Routes>
            <Route path="/login" element={<div>login page</div>} />
            <Route path="*" element={ui} />
          </Routes>
        </MemoryRouter>
      </NotificationProvider>
    </QueryClientProvider>,
  );

  return { ...view, client };
}

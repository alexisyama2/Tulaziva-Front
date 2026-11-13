import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import type { User } from '@/types/api';

const auth = vi.hoisted(() => ({ value: { user: null as User | null, loading: false, isAdmin: false } }));
vi.mock('@/context/AuthContext', () => ({ useAuth: () => auth.value }));

const user = (role: string): User => ({
  id: '1', email: 'a@b.c', displayName: 'A', role, preferredLanguage: 'en',
  latitude: null, longitude: null, createdAtUtc: '2026-01-01T00:00:00', photoUrl: null, emailVerified: true,
});

function renderAt(path: string, adminOnly = false) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/login" element={<div>login page</div>} />
        <Route path="/" element={<div>home</div>} />
        <Route element={<ProtectedRoute adminOnly={adminOnly} />}>
          <Route path="/secret" element={<div>secret content</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe('ProtectedRoute', () => {
  it('redirects anonymous visitors to the login page', () => {
    auth.value = { user: null, loading: false, isAdmin: false };
    renderAt('/secret');
    expect(screen.getByText('login page')).toBeInTheDocument();
  });

  it('shows a spinner while the session is being restored', () => {
    auth.value = { user: null, loading: true, isAdmin: false };
    renderAt('/secret');
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('lets signed-in users through', () => {
    auth.value = { user: user('User'), loading: false, isAdmin: false };
    renderAt('/secret');
    expect(screen.getByText('secret content')).toBeInTheDocument();
  });

  it('keeps non-admins out of admin routes', () => {
    auth.value = { user: user('User'), loading: false, isAdmin: false };
    renderAt('/secret', true);
    expect(screen.getByText('home')).toBeInTheDocument();
  });

  it('lets admins into admin routes', () => {
    auth.value = { user: user('Admin'), loading: false, isAdmin: true };
    renderAt('/secret', true);
    expect(screen.getByText('secret content')).toBeInTheDocument();
  });
});

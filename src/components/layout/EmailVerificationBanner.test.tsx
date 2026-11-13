import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EmailVerificationBanner from './EmailVerificationBanner';
import { makeUser, renderWithProviders } from '@/test/utils';
import type { User } from '@/types/api';

const auth = vi.hoisted(() => ({ user: null as User | null }));
vi.mock('@/context/AuthContext', () => ({ useAuth: () => ({ user: auth.user }) }));

const resend = vi.hoisted(() => vi.fn());
vi.mock('@/api', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/api')>();
  return { ...original, usersApi: { ...original.usersApi, resendVerification: resend } };
});

describe('EmailVerificationBanner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resend.mockResolvedValue(undefined);
  });

  it('asks the user with an unverified address to confirm it, and can send the link again', async () => {
    auth.user = makeUser({ emailVerified: false });
    renderWithProviders(<EmailVerificationBanner />);

    expect(screen.getByText(/ana@mail.com/)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Resend link' }));

    await waitFor(() => expect(resend).toHaveBeenCalledTimes(1));
    expect(await screen.findByText('We sent a new link to ana@mail.com')).toBeInTheDocument();
  });

  it('says nothing to someone whose address is verified, or to nobody', () => {
    auth.user = makeUser({ emailVerified: true });
    const { container, unmount } = renderWithProviders(<EmailVerificationBanner />);
    expect(container).toBeEmptyDOMElement();
    unmount();

    auth.user = null;
    const anonymous = renderWithProviders(<EmailVerificationBanner />);
    expect(anonymous.container).toBeEmptyDOMElement();
  });

  it('can be dismissed', async () => {
    auth.user = makeUser({ emailVerified: false });
    renderWithProviders(<EmailVerificationBanner />);

    await userEvent.click(screen.getByRole('button', { name: 'Close' }));

    expect(screen.queryByText(/Confirm your email/)).not.toBeInTheDocument();
  });
});

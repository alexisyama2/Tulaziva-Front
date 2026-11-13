import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BlockedUsersSection, DeleteAccountSection, EmailSection } from './AccountSections';
import { ApiError } from '@/api';
import { makeUser, renderWithProviders } from '@/test/utils';

const mocks = vi.hoisted(() => ({
  requestEmailChange: vi.fn(),
  deleteAccount: vi.fn(),
  list: vi.fn(),
  unblock: vi.fn(),
  logout: vi.fn(),
  isAdmin: false,
}));

vi.mock('@/api', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/api')>();
  return {
    ...original,
    usersApi: { ...original.usersApi, requestEmailChange: mocks.requestEmailChange, deleteAccount: mocks.deleteAccount },
    blocksApi: { ...original.blocksApi, list: mocks.list, unblock: mocks.unblock },
  };
});

vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({ user: makeUser(), isAdmin: mocks.isAdmin, logout: mocks.logout }),
}));

beforeEach(() => {
  vi.clearAllMocks();
  mocks.isAdmin = false;
  mocks.list.mockResolvedValue([]);
});

describe('EmailSection', () => {
  it('asks for the change with the password and says where the link went', async () => {
    mocks.requestEmailChange.mockResolvedValue(undefined);
    renderWithProviders(<EmailSection user={makeUser()} />);

    expect(screen.getByText('Your account uses ana@mail.com.')).toBeInTheDocument();
    await userEvent.type(screen.getByLabelText('New email'), '  new@mail.com ');
    await userEvent.type(screen.getByLabelText('Current password'), 'Password1');
    await userEvent.click(screen.getByRole('button', { name: 'Change email' }));

    await waitFor(() => expect(mocks.requestEmailChange).toHaveBeenCalledWith('new@mail.com', 'Password1'));
    expect(await screen.findByText(/We sent a link to new@mail.com/)).toBeInTheDocument();
    // The form starts empty again.
    expect(screen.getByLabelText('New email')).toHaveValue('');
  });

  it('does not call the API without the new address and the password', async () => {
    renderWithProviders(<EmailSection user={makeUser()} />);

    await userEvent.click(screen.getByRole('button', { name: 'Change email' }));

    expect(mocks.requestEmailChange).not.toHaveBeenCalled();
    expect(screen.getByText('Enter your email')).toBeInTheDocument();
  });

  it('shows what the API says, for example that the address is taken', async () => {
    mocks.requestEmailChange.mockRejectedValue(new ApiError(409, { detail: 'That email is already registered.' }));
    renderWithProviders(<EmailSection user={makeUser()} />);

    await userEvent.type(screen.getByLabelText('New email'), 'taken@mail.com');
    await userEvent.type(screen.getByLabelText('Current password'), 'Password1');
    await userEvent.click(screen.getByRole('button', { name: 'Change email' }));

    expect(await screen.findByText('That email is already registered.')).toBeInTheDocument();
  });
});

describe('BlockedUsersSection', () => {
  it('lists the blocked users and lets the user unblock one', async () => {
    mocks.list.mockResolvedValue([{ id: 'u2', displayName: 'Luis', photoUrl: null, blockedAtUtc: '2026-11-05T10:00:00' }]);
    mocks.unblock.mockResolvedValue(undefined);
    renderWithProviders(<BlockedUsersSection />);

    expect(await screen.findByText('Luis')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Unblock' }));

    await waitFor(() => expect(mocks.unblock).toHaveBeenCalledWith('u2'));
    expect(await screen.findByText('Luis was unblocked')).toBeInTheDocument();
  });

  it('says so when nobody is blocked', async () => {
    renderWithProviders(<BlockedUsersSection />);

    expect(await screen.findByText("You haven't blocked anyone.")).toBeInTheDocument();
  });
});

describe('DeleteAccountSection', () => {
  it('asks for the password, deletes the account and signs out', async () => {
    mocks.deleteAccount.mockResolvedValue(undefined);
    renderWithProviders(<DeleteAccountSection />);

    await userEvent.click(screen.getByRole('button', { name: 'Delete my account' }));
    const confirm = screen.getByRole('button', { name: 'Delete forever' });
    expect(confirm).toBeDisabled(); // no password yet

    await userEvent.type(screen.getByLabelText('Your password'), 'Password1');
    await userEvent.click(confirm);

    await waitFor(() => expect(mocks.deleteAccount).toHaveBeenCalledWith('Password1'));
    await waitFor(() => expect(mocks.logout).toHaveBeenCalled());
  });

  it('stays open and signed in when the password is wrong', async () => {
    mocks.deleteAccount.mockRejectedValue(new ApiError(400, { detail: 'The current password is not correct.' }));
    renderWithProviders(<DeleteAccountSection />);

    await userEvent.click(screen.getByRole('button', { name: 'Delete my account' }));
    await userEvent.type(screen.getByLabelText('Your password'), 'Wrong');
    await userEvent.click(screen.getByRole('button', { name: 'Delete forever' }));

    expect(await screen.findByText('The current password is not correct.')).toBeInTheDocument();
    expect(mocks.logout).not.toHaveBeenCalled();
  });

  it('does not offer it to an administrator', () => {
    mocks.isAdmin = true;
    renderWithProviders(<DeleteAccountSection />);

    expect(screen.queryByRole('button', { name: 'Delete my account' })).not.toBeInTheDocument();
    expect(screen.getByText('An administrator account cannot be deleted from here.')).toBeInTheDocument();
  });
});

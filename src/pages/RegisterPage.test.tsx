import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RegisterPage from './RegisterPage';
import { makeUser, renderWithProviders } from '@/test/utils';

const register = vi.hoisted(() => vi.fn());
vi.mock('@/context/AuthContext', () => ({ useAuth: () => ({ user: null, register }) }));

const fill = async () => {
  await userEvent.type(screen.getByLabelText('Display name'), 'Ana');
  await userEvent.type(screen.getByLabelText('Email'), 'ana@mail.com');
  await userEvent.type(screen.getByLabelText('Password'), 'Password1');
  await userEvent.type(screen.getByLabelText('Repeat the password'), 'Password1');
  // Without the location the test does not depend on the browser geolocation.
  await userEvent.click(screen.getByLabelText('Save my location to show you nearby ads'));
};

beforeEach(() => {
  vi.clearAllMocks();
  register.mockResolvedValue(makeUser());
});

describe('RegisterPage', () => {
  it('keeps "Sign up" disabled until the terms and the privacy notice are accepted', async () => {
    renderWithProviders(<RegisterPage />);
    await fill();

    const button = screen.getByRole('button', { name: 'Sign up' });
    expect(button).toBeDisabled();
    expect(screen.getByText('You must accept them to create your account.')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('checkbox', { name: /I accept the Terms of use and the Privacy notice/ }));
    expect(button).toBeEnabled();

    await userEvent.click(screen.getByRole('checkbox', { name: /I accept the Terms of use/ }));
    expect(button).toBeDisabled();
    expect(register).not.toHaveBeenCalled();
  });

  it('links to both documents, in a new tab so the form is not lost', () => {
    renderWithProviders(<RegisterPage />);

    const terms = screen.getByRole('link', { name: 'Terms of use' });
    const privacy = screen.getByRole('link', { name: 'Privacy notice' });
    expect(terms).toHaveAttribute('href', '/terms');
    expect(terms).toHaveAttribute('target', '_blank');
    expect(privacy).toHaveAttribute('href', '/privacy');
    expect(privacy).toHaveAttribute('target', '_blank');
  });

  it('sends the acceptance to the API', async () => {
    renderWithProviders(<RegisterPage />);
    await fill();

    await userEvent.click(screen.getByRole('checkbox', { name: /I accept the Terms of use/ }));
    await userEvent.click(screen.getByRole('button', { name: 'Sign up' }));

    await waitFor(() => expect(register).toHaveBeenCalledWith(expect.objectContaining({ email: 'ana@mail.com', acceptedTerms: true })));
  });

  it('does not sign up when the two passwords differ, and says so', async () => {
    renderWithProviders(<RegisterPage />);
    await fill();
    await userEvent.type(screen.getByLabelText('Repeat the password'), 'x');
    await userEvent.click(screen.getByRole('checkbox', { name: /I accept the Terms of use/ }));

    expect(await screen.findByText("The passwords don't match")).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Sign up' }));

    expect(register).not.toHaveBeenCalled();
  });

  it('shows and hides each password with its eye button', async () => {
    renderWithProviders(<RegisterPage />);
    const password = screen.getByLabelText('Password');
    const repeat = screen.getByLabelText('Repeat the password');
    expect(password).toHaveAttribute('type', 'password');

    const [first] = screen.getAllByRole('button', { name: 'Show password' });
    await userEvent.click(first);

    expect(password).toHaveAttribute('type', 'text');
    expect(repeat).toHaveAttribute('type', 'password'); // each box has its own
    await userEvent.click(screen.getByRole('button', { name: 'Hide password' }));
    expect(password).toHaveAttribute('type', 'password');
  });
});

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ReportDialog from './ReportDialog';
import { ApiError } from '@/api';
import { renderWithProviders } from '@/test/utils';

const report = vi.hoisted(() => vi.fn());
vi.mock('@/api', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/api')>();
  return { ...original, adsApi: { ...original.adsApi, report } };
});

const renderDialog = (onClose = vi.fn()) => {
  renderWithProviders(<ReportDialog adId="ad-1" open onClose={onClose} />);
  return onClose;
};

describe('ReportDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    report.mockResolvedValue(undefined);
  });

  it('sends the reason that was chosen and closes', async () => {
    const onClose = renderDialog();

    await userEvent.click(screen.getByRole('radio', { name: 'It looks like a scam' }));
    await userEvent.type(screen.getByRole('textbox'), '  Asks for a deposit  ');
    await userEvent.click(screen.getByRole('button', { name: 'Send report' }));

    await waitFor(() => expect(report).toHaveBeenCalledWith('ad-1', 'fraud', 'Asks for a deposit'));
    expect(await screen.findByText('Thanks, we received your report')).toBeInTheDocument();
    expect(onClose).toHaveBeenCalled();
  });

  it('details are optional for the usual reasons', async () => {
    renderDialog();

    await userEvent.click(screen.getByRole('button', { name: 'Send report' }));

    await waitFor(() => expect(report).toHaveBeenCalledWith('ad-1', 'spam', ''));
  });

  it('"other" needs an explanation before it can be sent', async () => {
    renderDialog();

    await userEvent.click(screen.getByRole('radio', { name: 'Another reason' }));
    const send = screen.getByRole('button', { name: 'Send report' });
    expect(send).toBeDisabled();

    await userEvent.type(screen.getByRole('textbox'), 'Something odd');
    expect(send).toBeEnabled();
  });

  it('shows what the API says (for example, that it was already reported) and stays open', async () => {
    report.mockRejectedValue(new ApiError(409, { detail: 'You already reported this ad.' }));
    const onClose = renderDialog();

    await userEvent.click(screen.getByRole('button', { name: 'Send report' }));

    expect(await screen.findByText('You already reported this ad.')).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });
});

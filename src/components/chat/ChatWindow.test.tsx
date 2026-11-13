import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChatWindow from './ChatWindow';
import { makeUser, renderWithProviders } from '@/test/utils';
import type { Conversation } from '@/types/api';

const mocks = vi.hoisted(() => ({
  get: vi.fn(),
  messages: vi.fn(),
  markRead: vi.fn(),
  list: vi.fn(),
  block: vi.fn(),
  unblock: vi.fn(),
}));

vi.mock('@/api', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/api')>();
  return {
    ...original,
    chatApi: { ...original.chatApi, get: mocks.get, messages: mocks.messages, markRead: mocks.markRead },
    blocksApi: { ...original.blocksApi, list: mocks.list, block: mocks.block, unblock: mocks.unblock },
  };
});

vi.mock('@/context/AuthContext', () => ({ useAuth: () => ({ user: makeUser() }) }));

const conversation = (other: Partial<Conversation['otherParticipant']> = {}): Conversation => ({
  id: 'c1',
  adId: 'ad-1',
  adTitle: 'Bicicleta',
  otherParticipant: { id: 'u2', displayName: 'Luis', photoUrl: null, deleted: false, ...other },
  lastMessage: null,
  unreadCount: 0,
  createdAtUtc: '2026-11-05T10:00:00',
  lastMessageAtUtc: '2026-11-05T10:00:00',
});

beforeEach(() => {
  vi.clearAllMocks();
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
  mocks.get.mockResolvedValue(conversation());
  mocks.messages.mockResolvedValue({ items: [], page: 1, pageSize: 30, totalCount: 0 });
  mocks.list.mockResolvedValue([]);
});

describe('ChatWindow', () => {
  it('lets the user write, and blocks the other person after asking', async () => {
    mocks.block.mockResolvedValue(undefined);
    renderWithProviders(<ChatWindow conversationId="c1" />);

    expect(await screen.findByPlaceholderText('Write a message…')).toBeInTheDocument();

    // The options appear once the conversation has loaded.
    await userEvent.click(await screen.findByRole('button', { name: 'More options' }));
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Block user' }));
    expect(await screen.findByText('Block Luis?')).toBeInTheDocument();
    expect(mocks.block).not.toHaveBeenCalled(); // asked first

    await userEvent.click(screen.getByRole('button', { name: 'Block user' }));

    await waitFor(() => expect(mocks.block).toHaveBeenCalledWith('u2'));
  });

  it('replaces the box to write with a notice when the user blocked the other person, with a way back', async () => {
    mocks.list.mockResolvedValue([{ id: 'u2', displayName: 'Luis', photoUrl: null, blockedAtUtc: '2026-11-05T10:00:00' }]);
    mocks.unblock.mockResolvedValue(undefined);
    renderWithProviders(<ChatWindow conversationId="c1" />);

    expect(await screen.findByText('You blocked Luis. Unblock them to write again.')).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('Write a message…')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Unblock' }));

    await waitFor(() => expect(mocks.unblock).toHaveBeenCalledWith('u2'));
  });

  it('shows a deleted account as such, without a way to write or to block', async () => {
    mocks.get.mockResolvedValue(conversation({ displayName: 'Whatever the API sends', deleted: true }));
    renderWithProviders(<ChatWindow conversationId="c1" />);

    expect(await screen.findByText('Deleted user')).toBeInTheDocument();
    expect(screen.getByText('This account no longer exists, so you cannot write here.')).toBeInTheDocument();
    expect(screen.queryByText('Whatever the API sends')).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText('Write a message…')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'More options' })).not.toBeInTheDocument();
  });
});

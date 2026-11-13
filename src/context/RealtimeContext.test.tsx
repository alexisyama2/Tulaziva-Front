import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, screen, waitFor } from '@testing-library/react';
import { RealtimeProvider, useRealtime } from './RealtimeContext';
import { makeClient, makeUser, renderWithProviders } from '@/test/utils';
import type { MessageNotification, User } from '@/types/api';

const auth = vi.hoisted(() => ({ user: null as User | null }));
vi.mock('./AuthContext', () => ({ useAuth: () => ({ user: auth.user }) }));

// A fake connection: the test decides when the server "pushes" something.
const hub = vi.hoisted(() => {
  const state = {
    handlers: new Map<string, (...args: unknown[]) => void>(),
    start: vi.fn(),
    stop: vi.fn(),
    builds: 0,
    url: '' as string,
    connectionState: 'Connected',
  };
  return state;
});

vi.mock('@microsoft/signalr', () => ({
  LogLevel: { Warning: 3 },
  HubConnectionState: { Connected: 'Connected' },
  HubConnectionBuilder: class {
    withUrl(url: string) {
      hub.url = url;
      return this;
    }
    withAutomaticReconnect() {
      return this;
    }
    configureLogging() {
      return this;
    }
    build() {
      hub.builds++;
      return {
        on: (name: string, handler: (...args: unknown[]) => void) => hub.handlers.set(name, handler),
        onreconnecting: vi.fn(),
        onreconnected: vi.fn(),
        onclose: vi.fn(),
        start: hub.start,
        stop: hub.stop,
        get state() {
          return hub.connectionState;
        },
      };
    }
  },
}));

const notification: MessageNotification = {
  senderDisplayName: 'Luis',
  adTitle: 'Bicicleta',
  message: {
    id: 'm1',
    conversationId: 'c1',
    senderId: 'u2',
    body: 'Hola',
    createdAtUtc: '2026-11-05T10:00:00',
    readAtUtc: null,
    attachments: [],
  },
};

function Status() {
  return <span>{useRealtime().connected ? 'live' : 'offline'}</span>;
}

const renderProvider = (client = makeClient()) =>
  renderWithProviders(
    <RealtimeProvider>
      <Status />
    </RealtimeProvider>,
    { client, route: '/ads' },
  );

describe('RealtimeProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    hub.handlers.clear();
    hub.builds = 0;
    hub.connectionState = 'Connected';
    hub.start.mockResolvedValue(undefined);
    hub.stop.mockResolvedValue(undefined);
    auth.user = makeUser();
  });

  it('opens the channel for a signed-in user, and says it is live', async () => {
    renderProvider();

    expect(await screen.findByText('live')).toBeInTheDocument();
    expect(hub.url).toBe('/hubs/chat');
  });

  it('does not connect for anonymous visitors', () => {
    auth.user = null;
    renderProvider();

    expect(hub.builds).toBe(0);
    expect(screen.getByText('offline')).toBeInTheDocument();
  });

  it('closes the channel when the provider goes away', async () => {
    const { unmount } = renderProvider();
    await screen.findByText('live');

    unmount();

    expect(hub.stop).toHaveBeenCalled();
  });

  it('stays offline (the polling takes over) when the channel cannot be opened', async () => {
    hub.start.mockRejectedValue(new Error('no websockets'));
    renderProvider();

    await waitFor(() => expect(hub.start).toHaveBeenCalled());
    expect(screen.getByText('offline')).toBeInTheDocument();
  });

  it('a new message refreshes the chat data and tells the user who wrote', async () => {
    const client = makeClient();
    const invalidate = vi.spyOn(client, 'invalidateQueries');
    renderProvider(client);
    await screen.findByText('live');

    act(() => hub.handlers.get('MessageReceived')!(notification));

    const keys = invalidate.mock.calls.map(([filters]) => JSON.stringify(filters?.queryKey));
    expect(keys).toEqual(expect.arrayContaining([
      JSON.stringify(['chat', 'unread']),
      JSON.stringify(['chat', 'conversations']),
      JSON.stringify(['chat', 'messages', 'c1']),
    ]));
    expect(await screen.findByText('New message from Luis')).toBeInTheDocument();
  });

  it('no pop-up for the conversation the user is already reading', async () => {
    window.history.pushState({}, '', '/messages/c1');
    renderProvider();
    await screen.findByText('live');

    act(() => hub.handlers.get('MessageReceived')!(notification));

    expect(screen.queryByText('New message from Luis')).not.toBeInTheDocument();
    window.history.pushState({}, '', '/');
  });

  it('a read mark refreshes that conversation', async () => {
    const client = makeClient();
    const invalidate = vi.spyOn(client, 'invalidateQueries');
    renderProvider(client);
    await screen.findByText('live');

    act(() => hub.handlers.get('ConversationRead')!('c1'));

    expect(invalidate.mock.calls.map(([filters]) => JSON.stringify(filters?.queryKey))).toContain(JSON.stringify(['chat', 'messages', 'c1']));
  });
});

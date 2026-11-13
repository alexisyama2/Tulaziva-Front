import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { HubConnectionBuilder, HubConnectionState, LogLevel } from '@microsoft/signalr';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { tokenStore } from '@/api';
import { chatKeys } from '@/hooks/chatKeys';
import type { MessageNotification } from '@/types/api';
import { useAuth } from './AuthContext';
import { useNotify } from './NotificationContext';

interface RealtimeState {
  /** True while the live channel is open. The chat polls slowly then, and quickly when it is not. */
  connected: boolean;
}

const RealtimeContext = createContext<RealtimeState>({ connected: false });

export const HUB_URL = '/hubs/chat';

/**
 * Keeps the live channel of the chats open while someone is signed in. The channel only says "something changed": the data is
 * still read from the API (the queries are refreshed), and if the channel is down the polling of the hooks takes over.
 */
export function RealtimeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { notify } = useNotify();
  const { t } = useTranslation();
  const [connected, setConnected] = useState(false);
  const userId = user?.id;

  useEffect(() => {
    if (!userId) return;

    const connection = new HubConnectionBuilder()
      .withUrl(HUB_URL, { accessTokenFactory: () => tokenStore.get() ?? '' })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build();

    const refreshChats = () => {
      void qc.invalidateQueries({ queryKey: chatKeys.unread });
      void qc.invalidateQueries({ queryKey: chatKeys.conversations });
    };

    connection.on('MessageReceived', (n: MessageNotification) => {
      refreshChats();
      void qc.invalidateQueries({ queryKey: chatKeys.messages(n.message.conversationId) });

      // No pop-up for the chat the user is looking at.
      if (window.location.pathname !== `/messages/${n.message.conversationId}`)
        notify(t('chat.newMessage', { name: n.senderDisplayName }), 'info');
    });

    connection.on('ConversationRead', (conversationId: string) => {
      refreshChats();
      void qc.invalidateQueries({ queryKey: chatKeys.messages(conversationId) });
    });

    connection.onreconnecting(() => setConnected(false));
    connection.onreconnected(() => {
      setConnected(true);
      // Whatever happened while it was down.
      refreshChats();
      void qc.invalidateQueries({ queryKey: ['chat', 'messages'] });
    });
    connection.onclose(() => setConnected(false));

    let stopped = false;
    connection
      .start()
      .then(() => !stopped && setConnected(connection.state === HubConnectionState.Connected))
      .catch(() => {
        /* Not available (old backend, proxy without WebSockets): the polling keeps the chat working. */
      });

    return () => {
      stopped = true;
      setConnected(false);
      void connection.stop();
    };
  }, [userId, qc, notify, t]);

  const value = useMemo(() => ({ connected }), [connected]);

  return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useRealtime(): RealtimeState {
  return useContext(RealtimeContext);
}

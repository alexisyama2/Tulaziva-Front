import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { chatApi } from '@/api';
import { useAuth } from '@/context/AuthContext';
import { useRealtime } from '@/context/RealtimeContext';
import { chatKeys } from './chatKeys';

export { chatKeys };

/** With the live channel open the polling is only a safety net; without it, it is what keeps the chat fresh. */
const POLL_FAST_MS = 5_000;
const POLL_SLOW_MS = 60_000;
const pollEvery = (connected: boolean) => (connected ? POLL_SLOW_MS : POLL_FAST_MS);

/** Unread badge for the navbar. The live channel refreshes it at once; the polling is the fallback. */
export function useUnreadCount() {
  const { user } = useAuth();
  const { connected } = useRealtime();
  return useQuery({
    queryKey: chatKeys.unread,
    queryFn: chatApi.unreadCount,
    enabled: !!user,
    refetchInterval: connected ? POLL_SLOW_MS : 15_000,
    select: (d) => d.count,
  });
}

export function useConversations() {
  const { user } = useAuth();
  const { connected } = useRealtime();
  return useQuery({
    queryKey: chatKeys.conversations,
    queryFn: () => chatApi.list(1, 50),
    enabled: !!user,
    refetchInterval: pollEvery(connected),
  });
}

/** Messages come newest first; pages are fetched on demand ("load older") and the first page is polled. */
export function useMessages(conversationId: string | undefined) {
  const { connected } = useRealtime();
  return useInfiniteQuery({
    queryKey: chatKeys.messages(conversationId ?? ''),
    queryFn: ({ pageParam }) => chatApi.messages(conversationId!, pageParam, 30),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.page * last.pageSize < last.totalCount ? last.page + 1 : undefined),
    enabled: !!conversationId,
    refetchInterval: pollEvery(connected),
  });
}

export function useSendMessage(conversationId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ body, files }: { body: string; files: File[] }) =>
      files.length ? chatApi.sendFiles(conversationId, files, body || undefined) : chatApi.send(conversationId, body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: chatKeys.messages(conversationId) });
      void qc.invalidateQueries({ queryKey: chatKeys.conversations });
    },
  });
}

export function useMarkRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => chatApi.markRead(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: chatKeys.conversations });
      void qc.invalidateQueries({ queryKey: chatKeys.unread });
    },
  });
}

export function useStartConversation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (adId: string) => chatApi.start(adId),
    onSuccess: () => qc.invalidateQueries({ queryKey: chatKeys.conversations }),
  });
}

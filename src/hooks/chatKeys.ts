export const chatKeys = {
  conversations: ['chat', 'conversations'] as const,
  unread: ['chat', 'unread'] as const,
  messages: (id: string) => ['chat', 'messages', id] as const,
};

import { Badge, Box, List, ListItemAvatar, ListItemButton, ListItemText, Skeleton, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { Conversation } from '@/types/api';
import { useAuth } from '@/context/AuthContext';
import UserAvatar from '@/components/common/UserAvatar';
import { timeAgo } from '@/utils/format';

interface Props {
  conversations?: Conversation[];
  loading?: boolean;
  activeId?: string;
}

export default function ConversationList({ conversations, loading, activeId }: Props) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (loading)
    return (
      <Box sx={{ p: 2 }}>
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} variant="rounded" height={64} sx={{ mb: 1.5 }} />
        ))}
      </Box>
    );

  return (
    <List disablePadding>
      {conversations?.map((c) => {
        const last = c.lastMessage;
        const preview = !last ? '' : (last.senderId === user?.id ? `${t('chat.you')}: ` : '') + (last.text || (last.hasAttachments ? t('chat.photo') : ''));
        return (
          <ListItemButton key={c.id} selected={c.id === activeId} onClick={() => navigate(`/messages/${c.id}`)} sx={{ py: 1.5, borderBottom: 1, borderColor: 'divider' }}>
            <ListItemAvatar sx={{ minWidth: 64 }}>
              <Badge color="secondary" badgeContent={c.unreadCount} max={99}>
                <UserAvatar name={c.otherParticipant.deleted ? undefined : c.otherParticipant.displayName} photoUrl={c.otherParticipant.photoUrl} size={46} />
              </Badge>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
                  <Typography fontWeight={c.unreadCount ? 800 : 600} noWrap>{c.otherParticipant.deleted ? t('chat.deletedUser') : c.otherParticipant.displayName}</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>{timeAgo(c.lastMessageAtUtc)}</Typography>
                </Box>
              }
              secondary={
                <>
                  <Typography variant="caption" color="primary" noWrap component="span" display="block">{c.adTitle}</Typography>
                  <Typography variant="body2" color="text.secondary" noWrap component="span" display="block" fontWeight={c.unreadCount ? 600 : 400}>
                    {preview}
                  </Typography>
                </>
              }
              slotProps={{ secondary: { component: 'div' } }}
            />
          </ListItemButton>
        );
      })}
    </List>
  );
}

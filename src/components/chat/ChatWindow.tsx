import { useEffect, useMemo, useRef, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Alert, Box, Button, Chip, CircularProgress, IconButton, ListItemIcon, Menu, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material';
import SendIcon from '@mui/icons-material/SendRounded';
import AttachIcon from '@mui/icons-material/AddPhotoAlternateOutlined';
import CloseIcon from '@mui/icons-material/CloseRounded';
import ArrowBackIcon from '@mui/icons-material/ArrowBackRounded';
import MoreIcon from '@mui/icons-material/MoreVertRounded';
import BlockIcon from '@mui/icons-material/BlockRounded';
import LockOpenIcon from '@mui/icons-material/LockOpenRounded';
import { useTranslation } from 'react-i18next';
import { chatApi } from '@/api';
import { chatBackground } from '@/theme/theme';
import { useAuth } from '@/context/AuthContext';
import { useRealtime } from '@/context/RealtimeContext';
import { useNotify } from '@/context/NotificationContext';
import { chatKeys, useMarkRead, useMessages, useSendMessage } from '@/hooks/useChat';
import { useBlockedUsers, useSetBlocked } from '@/hooks/useBlocks';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import UserAvatar from '@/components/common/UserAvatar';
import ErrorState, { errorMessages } from '@/components/common/ErrorState';
import MessageBubble from './MessageBubble';

const MAX_FILES = 5;
const MAX_FILE_BYTES = 10 * 1024 * 1024;
const OK_EXT = /\.(jpe?g|png)$/i;

interface Props {
  conversationId: string;
  onBack?: () => void;
}

export default function ChatWindow({ conversationId, onBack }: Props) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { error: notifyError, success } = useNotify();
  const { connected } = useRealtime();
  const conversation = useQuery({
    queryKey: [...chatKeys.conversations, conversationId],
    queryFn: () => chatApi.get(conversationId),
    refetchInterval: connected ? 60_000 : 5_000,
  });
  const messages = useMessages(conversationId);
  const send = useSendMessage(conversationId);
  const markRead = useMarkRead();
  const blocked = useBlockedUsers();
  const setBlocked = useSetBlocked();
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [confirmBlock, setConfirmBlock] = useState(false);

  const [text, setText] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const fileInput = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLDivElement>(null);

  // The API returns newest first; the screen shows oldest first.
  const ordered = useMemo(() => (messages.data?.pages.flatMap((p) => p.items) ?? []).slice().reverse(), [messages.data]);
  const lastId = ordered[ordered.length - 1]?.id;

  // Mark as read whenever the other person has sent something we have not read.
  const unread = conversation.data?.unreadCount ?? 0;
  useEffect(() => {
    if (unread > 0 && !markRead.isPending) markRead.mutate(conversationId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unread, conversationId]);

  useEffect(() => {
    // Scrolls the list of messages only. scrollIntoView would also scroll the page, which on a phone pushes the header of the chat out of sight.
    const el = list.current;
    el?.scrollTo?.({ top: el.scrollHeight, behavior: 'smooth' });
  }, [lastId, conversationId]);

  const pickFiles = (list: FileList | null) => {
    if (!list) return;
    const next = [...files];
    for (const f of Array.from(list)) {
      if (!OK_EXT.test(f.name) || f.size > MAX_FILE_BYTES) notifyError(t('chat.fileInvalid', { name: f.name }));
      else if (next.length >= MAX_FILES) {
        notifyError(t('chat.tooManyFiles'));
        break;
      } else next.push(f);
    }
    setFiles(next);
    if (fileInput.current) fileInput.current.value = '';
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = text.trim();
    if ((!body && files.length === 0) || send.isPending) return;
    try {
      await send.mutateAsync({ body, files });
      setText('');
      setFiles([]);
    } catch (err) {
      notifyError(errorMessages(err, t('errors.generic')).join(' '));
    }
  };

  if (conversation.isError) return <Box sx={{ p: 3 }}><ErrorState error={conversation.error} /></Box>;

  const other = conversation.data?.otherParticipant;
  const otherDeleted = !!other?.deleted;
  const otherName = otherDeleted ? t('chat.deletedUser') : other?.displayName;
  const blockedByMe = !!other && !otherDeleted && !!blocked.data?.some((b) => b.id === other.id);
  // Nobody can write to a deleted account, and the one who blocked does not write to the one they blocked.
  const canWrite = !!other && !otherDeleted && !blockedByMe;

  const changeBlock = async (block: boolean) => {
    if (!other) return;
    try {
      await setBlocked.mutateAsync({ userId: other.id, blocked: block });
      success(t(block ? 'block.blocked' : 'block.unblocked', { name: other.displayName }));
      setConfirmBlock(false);
    } catch (err) {
      notifyError(errorMessages(err, t('errors.generic')).join(' '));
    }
  };

  return (
    <Stack sx={{ height: '100%', minHeight: 0 }}>
      <Stack direction="row" alignItems="center" gap={1.5} sx={{ p: 1.5, borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
        {onBack && (
          <IconButton onClick={onBack} aria-label={t('common.back')}><ArrowBackIcon /></IconButton>
        )}
        <UserAvatar name={otherDeleted ? undefined : other?.displayName} photoUrl={other?.photoUrl} size={42} />
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography fontWeight={700} noWrap>{otherName ?? '…'}</Typography>
          {conversation.data && (
            <Typography variant="caption" color="text.secondary" noWrap display="block">
              {t('chat.about', { title: conversation.data.adTitle })}
            </Typography>
          )}
        </Box>
        {conversation.data && (
          <Button component={RouterLink} to={`/ads/${conversation.data.adId}`} size="small">{t('chat.viewAd')}</Button>
        )}
        {other && !otherDeleted && (
          <>
            <IconButton onClick={(e) => setMenuAnchor(e.currentTarget)} aria-label={t('chat.moreOptions')} aria-haspopup="menu">
              <MoreIcon />
            </IconButton>
            <Menu anchorEl={menuAnchor} open={!!menuAnchor} onClose={() => setMenuAnchor(null)}>
              <MenuItem
                onClick={() => {
                  setMenuAnchor(null);
                  if (blockedByMe) void changeBlock(false);
                  else setConfirmBlock(true);
                }}
              >
                <ListItemIcon>{blockedByMe ? <LockOpenIcon fontSize="small" /> : <BlockIcon fontSize="small" />}</ListItemIcon>
                {blockedByMe ? t('block.unblock') : t('block.action')}
              </MenuItem>
            </Menu>
          </>
        )}
      </Stack>

      <Box ref={list} sx={{ flex: 1, overflowY: 'auto', p: 2, bgcolor: chatBackground }}>
        {messages.hasNextPage && (
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <Button size="small" onClick={() => messages.fetchNextPage()} disabled={messages.isFetchingNextPage}>
              {t('chat.loadOlder')}
            </Button>
          </Box>
        )}
        {messages.isLoading && <Box sx={{ textAlign: 'center', py: 4 }}><CircularProgress /></Box>}
        {messages.isError && <ErrorState error={messages.error} onRetry={() => messages.refetch()} />}
        {!messages.isLoading && ordered.length === 0 && (
          <Typography color="text.secondary" textAlign="center" sx={{ py: 6 }}>{t('chat.noMessages')}</Typography>
        )}
        {ordered.map((m) => (
          <MessageBubble key={m.id} message={m} mine={m.senderId === user?.id} />
        ))}
      </Box>

      {other && !canWrite ? (
        <Paper square elevation={0} sx={{ p: 1.5, borderTop: 1, borderColor: 'divider' }}>
          <Alert
            severity="info"
            action={
              blockedByMe ? (
                <Button color="inherit" size="small" onClick={() => changeBlock(false)} disabled={setBlocked.isPending}>
                  {t('block.unblock')}
                </Button>
              ) : undefined
            }
          >
            {otherDeleted ? t('chat.deletedHint') : t('block.youBlocked', { name: other.displayName })}
          </Alert>
        </Paper>
      ) : (
      <Paper component="form" onSubmit={submit} square elevation={0} sx={{ p: 1.5, borderTop: 1, borderColor: 'divider' }}>
        {files.length > 0 && (
          <Stack direction="row" gap={1} flexWrap="wrap" sx={{ mb: 1 }}>
            {files.map((f, i) => (
              <Chip key={`${f.name}-${i}`} label={f.name} size="small" onDelete={() => setFiles(files.filter((_, j) => j !== i))} deleteIcon={<CloseIcon />} />
            ))}
          </Stack>
        )}
        <Stack direction="row" gap={1} alignItems="flex-end">
          <IconButton onClick={() => fileInput.current?.click()} aria-label={t('chat.attach')} title={t('chat.attachHint')}>
            <AttachIcon />
          </IconButton>
          <input ref={fileInput} type="file" hidden multiple accept=".jpg,.jpeg,.png" onChange={(e) => pickFiles(e.target.files)} />
          <TextField
            fullWidth
            multiline
            maxRows={4}
            size="small"
            placeholder={t('chat.writeMessage')}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) submit(e);
            }}
          />
          <IconButton type="submit" color="primary" disabled={send.isPending || (!text.trim() && files.length === 0)} aria-label={t('common.send')}>
            {send.isPending ? <CircularProgress size={22} /> : <SendIcon />}
          </IconButton>
        </Stack>
      </Paper>
      )}

      <ConfirmDialog
        open={confirmBlock}
        title={t('block.confirmTitle', { name: other?.displayName ?? '' })}
        text={t('block.confirmText')}
        confirmLabel={t('block.action')}
        destructive
        loading={setBlocked.isPending}
        onConfirm={() => changeBlock(true)}
        onClose={() => setConfirmBlock(false)}
      />
    </Stack>
  );
}

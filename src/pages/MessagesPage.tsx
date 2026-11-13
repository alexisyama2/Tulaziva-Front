import { useNavigate, useParams } from 'react-router-dom';
import { Box, Container, Paper, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import ChatIcon from '@mui/icons-material/ForumOutlined';
import { useTranslation } from 'react-i18next';
import { chatBackground } from '@/theme/theme';
import ChatWindow from '@/components/chat/ChatWindow';
import ConversationList from '@/components/chat/ConversationList';
import EmptyState from '@/components/common/EmptyState';
import ErrorState from '@/components/common/ErrorState';
import { useConversations } from '@/hooks/useChat';

export default function MessagesPage() {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const { data, isLoading, isError, error, refetch } = useConversations();

  const showList = isDesktop || !id;
  const showChat = isDesktop || !!id;

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 0, md: 4 } }}>
      <Typography variant="h4" sx={{ mb: 2, display: { xs: id ? 'none' : 'block', md: 'block' }, pt: { xs: 3, md: 0 } }}>{t('chat.title')}</Typography>
      <Paper sx={{ borderRadius: { xs: 0, md: 4 }, overflow: 'hidden', height: { xs: 'calc(100vh - 140px)', md: 'calc(100vh - 220px)' }, minHeight: 420, display: 'grid', gridTemplateColumns: { xs: '1fr', md: '340px 1fr' } }}>
        {showList && (
          <Box sx={{ borderRight: { md: 1 }, borderColor: 'divider', overflowY: 'auto', minHeight: 0 }}>
            {isError ? (
              <Box sx={{ p: 2 }}><ErrorState error={error} onRetry={() => refetch()} /></Box>
            ) : data && data.items.length === 0 ? (
              <EmptyState icon={<ChatIcon />} title={t('chat.empty')} hint={t('chat.emptyHint')} />
            ) : (
              <ConversationList conversations={data?.items} loading={isLoading} activeId={id} />
            )}
          </Box>
        )}
        {showChat && (
          <Box sx={{ minHeight: 0, minWidth: 0 }}>
            {id ? (
              <ChatWindow key={id} conversationId={id} onBack={isDesktop ? undefined : () => navigate('/messages')} />
            ) : (
              <Stack alignItems="center" justifyContent="center" sx={{ height: '100%', color: 'text.secondary', bgcolor: chatBackground }}>
                <ChatIcon sx={{ fontSize: 64, opacity: 0.4 }} />
                <Typography>{t('chat.selectConversation')}</Typography>
              </Stack>
            )}
          </Box>
        )}
      </Paper>
    </Container>
  );
}

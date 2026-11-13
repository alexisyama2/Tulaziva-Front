import { useState } from 'react';
import { Box, Dialog, Link, Stack, Typography } from '@mui/material';
import AttachFileIcon from '@mui/icons-material/AttachFileRounded';
import DoneAllIcon from '@mui/icons-material/DoneAllRounded';
import { useTranslation } from 'react-i18next';
import type { Message } from '@/types/api';
import AuthImage from '@/components/common/AuthImage';
import { fetchBlob } from '@/api';
import { formatBytes, formatTime } from '@/utils/format';
import { gradients } from '@/theme/theme';

interface Props {
  message: Message;
  mine: boolean;
}

async function download(url: string, fileName: string) {
  const blob = await fetchBlob(url);
  const href = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = href;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(href);
}

export default function MessageBubble({ message, mine }: Props) {
  const { t } = useTranslation();
  const [zoom, setZoom] = useState<string | null>(null);
  const images = message.attachments.filter((a) => a.contentType.startsWith('image/'));
  const files = message.attachments.filter((a) => !a.contentType.startsWith('image/'));

  return (
    <Box sx={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start', mb: 1 }}>
      <Box
        sx={{
          maxWidth: { xs: '85%', sm: '70%' },
          px: 1.5,
          py: 1,
          borderRadius: 3,
          borderBottomRightRadius: mine ? 4 : undefined,
          borderBottomLeftRadius: mine ? undefined : 4,
          ...(mine ? { background: gradients.brand } : { bgcolor: 'background.paper' }),
          color: mine ? '#fff' : 'text.primary',
          boxShadow: mine ? 'none' : '0 1px 2px rgba(22,50,79,.12)',
        }}
      >
        {images.length > 0 && (
          <Box sx={{ display: 'grid', gap: 0.5, gridTemplateColumns: images.length > 1 ? 'repeat(2, 1fr)' : '1fr', mb: message.body ? 1 : 0 }}>
            {images.map((img) => (
              <AuthImage key={img.id} url={img.url} alt={img.fileName} onClick={() => setZoom(img.url)} sx={{ width: '100%', minWidth: 140, height: images.length > 1 ? 120 : 200, borderRadius: 2 }} />
            ))}
          </Box>
        )}
        {files.map((f) => (
          <Link
            key={f.id}
            component="button"
            type="button"
            onClick={() => download(f.url, f.fileName)}
            sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'inherit', textAlign: 'left' }}
          >
            <AttachFileIcon fontSize="small" /> {f.fileName} ({formatBytes(f.sizeBytes)})
          </Link>
        ))}
        {message.body && <Typography sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{message.body}</Typography>}
        <Stack direction="row" justifyContent="flex-end" alignItems="center" gap={0.5} sx={{ opacity: 0.75, mt: 0.25 }}>
          <Typography variant="caption">{formatTime(message.createdAtUtc)}</Typography>
          {mine && message.readAtUtc && <DoneAllIcon sx={{ fontSize: 14 }} titleAccess={t('chat.read')} />}
        </Stack>
      </Box>

      <Dialog open={!!zoom} onClose={() => setZoom(null)} maxWidth="md">
        {zoom && <AuthImage url={zoom} alt="" sx={{ maxWidth: '100%', maxHeight: '85vh', objectFit: 'contain' }} />}
      </Dialog>
    </Box>
  );
}

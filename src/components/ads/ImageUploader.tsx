import { useEffect, useMemo, useRef } from 'react';
import { Box, Button, IconButton, Stack, Typography } from '@mui/material';
import AddPhotoIcon from '@mui/icons-material/AddPhotoAlternateOutlined';
import CloseIcon from '@mui/icons-material/CloseRounded';
import { useTranslation } from 'react-i18next';
import type { AdImage } from '@/types/api';
import { useNotify } from '@/context/NotificationContext';

export const MAX_IMAGES = 10;
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];

interface Props {
  existing: AdImage[];
  newFiles: File[];
  onRemoveExisting: (id: string) => void;
  onNewFilesChange: (files: File[]) => void;
}

function Thumb({ src, cover, onRemove }: { src: string; cover: boolean; onRemove: () => void }) {
  return (
    <Box sx={{ position: 'relative', width: 104, height: 104, borderRadius: 3, overflow: 'hidden', border: 1, borderColor: cover ? 'primary.main' : 'divider' }}>
      <Box component="img" src={src} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      <IconButton size="small" onClick={onRemove} sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'rgba(0,0,0,.55)', color: '#fff', '&:hover': { bgcolor: 'rgba(0,0,0,.75)' } }}>
        <CloseIcon fontSize="small" />
      </IconButton>
    </Box>
  );
}

export default function ImageUploader({ existing, newFiles, onRemoveExisting, onNewFilesChange }: Props) {
  const { t } = useTranslation();
  const { error } = useNotify();
  const inputRef = useRef<HTMLInputElement>(null);

  const previews = useMemo(() => newFiles.map((f) => URL.createObjectURL(f)), [newFiles]);
  useEffect(() => () => previews.forEach(URL.revokeObjectURL), [previews]);

  const total = existing.length + newFiles.length;

  const onPick = (list: FileList | null) => {
    if (!list) return;
    const accepted: File[] = [];
    for (const file of Array.from(list)) {
      if (!ALLOWED.includes(file.type)) error(t('form.imageInvalid', { name: file.name }));
      else if (file.size > MAX_BYTES) error(t('form.imageTooBig', { name: file.name }));
      else if (total + accepted.length >= MAX_IMAGES) {
        error(t('form.tooManyImages', { max: MAX_IMAGES }));
        break;
      } else accepted.push(file);
    }
    if (accepted.length) onNewFilesChange([...newFiles, ...accepted]);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <Stack gap={1.5}>
      <Typography variant="body2" color="text.secondary">{t('form.imagesHint', { max: MAX_IMAGES })}</Typography>
      <Stack direction="row" flexWrap="wrap" gap={1.5}>
        {existing.map((img, i) => (
          <Thumb key={img.id} src={img.url} cover={i === 0} onRemove={() => onRemoveExisting(img.id)} />
        ))}
        {previews.map((src, i) => (
          <Thumb key={src} src={src} cover={existing.length === 0 && i === 0} onRemove={() => onNewFilesChange(newFiles.filter((_, j) => j !== i))} />
        ))}
        {total < MAX_IMAGES && (
          <Button
            onClick={() => inputRef.current?.click()}
            sx={{ width: 104, height: 104, border: '2px dashed', borderColor: 'divider', borderRadius: 3, flexDirection: 'column', gap: 0.5 }}
          >
            <AddPhotoIcon />
            <Typography variant="caption">{t('form.addImages')}</Typography>
          </Button>
        )}
      </Stack>
      <input ref={inputRef} type="file" accept={ALLOWED.join(',')} multiple hidden onChange={(e) => onPick(e.target.files)} />
    </Stack>
  );
}

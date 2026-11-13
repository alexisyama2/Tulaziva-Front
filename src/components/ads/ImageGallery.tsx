import { useState } from 'react';
import { Box, Dialog, IconButton, Stack } from '@mui/material';
import ImageIcon from '@mui/icons-material/ImageOutlined';
import ChevronLeft from '@mui/icons-material/ChevronLeftRounded';
import ChevronRight from '@mui/icons-material/ChevronRightRounded';
import CloseIcon from '@mui/icons-material/CloseRounded';
import type { AdImage } from '@/types/api';

export default function ImageGallery({ images, alt }: { images: AdImage[]; alt: string }) {
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);

  if (images.length === 0)
    return (
      <Stack alignItems="center" justifyContent="center" sx={{ aspectRatio: '4 / 3', bgcolor: 'action.hover', borderRadius: 4, color: 'text.disabled' }}>
        <ImageIcon sx={{ fontSize: 72 }} />
      </Stack>
    );

  const current = images[index] ?? images[0];
  const move = (d: number) => setIndex((i) => (i + d + images.length) % images.length);

  const arrows = images.length > 1 && (
    <>
      <IconButton onClick={() => move(-1)} sx={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', bgcolor: 'rgba(255,255,255,.85)', '&:hover': { bgcolor: '#fff' } }}>
        <ChevronLeft />
      </IconButton>
      <IconButton onClick={() => move(1)} sx={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', bgcolor: 'rgba(255,255,255,.85)', '&:hover': { bgcolor: '#fff' } }}>
        <ChevronRight />
      </IconButton>
    </>
  );

  return (
    <Stack gap={1.5}>
      <Box sx={{ position: 'relative', aspectRatio: '4 / 3', borderRadius: 4, overflow: 'hidden', bgcolor: '#14102b' }}>
        <Box
          component="img"
          src={current.url}
          alt={alt}
          onClick={() => setOpen(true)}
          sx={{ width: '100%', height: '100%', objectFit: 'contain', cursor: 'zoom-in' }}
        />
        {arrows}
      </Box>
      {images.length > 1 && (
        <Stack direction="row" gap={1} sx={{ overflowX: 'auto', pb: 0.5 }}>
          {images.map((img, i) => (
            <Box
              key={img.id}
              component="img"
              src={img.url}
              alt=""
              onClick={() => setIndex(i)}
              sx={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 2, cursor: 'pointer', border: 2, borderColor: i === index ? 'primary.main' : 'transparent', opacity: i === index ? 1 : 0.7 }}
            />
          ))}
        </Stack>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="lg" fullWidth slotProps={{ paper: { sx: { bgcolor: '#0c0920', position: 'relative' } } }}>
        <IconButton onClick={() => setOpen(false)} sx={{ position: 'absolute', top: 8, right: 8, color: '#fff', zIndex: 1 }}>
          <CloseIcon />
        </IconButton>
        <Box sx={{ position: 'relative', height: '85vh' }}>
          <Box component="img" src={current.url} alt={alt} sx={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          {arrows}
        </Box>
      </Dialog>
    </Stack>
  );
}

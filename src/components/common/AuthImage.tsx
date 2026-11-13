import { Box, Skeleton, type SxProps, type Theme } from '@mui/material';
import BrokenImageIcon from '@mui/icons-material/BrokenImageOutlined';
import { useProtectedImage } from '@/hooks/useProtectedImage';

interface Props {
  url: string;
  alt: string;
  sx?: SxProps<Theme>;
  onClick?: () => void;
}

/** An image served behind the bearer token (chat attachments). */
export default function AuthImage({ url, alt, sx, onClick }: Props) {
  const { src, error } = useProtectedImage(url);

  if (error)
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', bgcolor: 'action.hover', color: 'text.disabled', ...sx }}>
        <BrokenImageIcon />
      </Box>
    );
  if (!src) return <Skeleton variant="rounded" sx={sx} />;

  return <Box component="img" src={src} alt={alt} onClick={onClick} sx={{ objectFit: 'cover', cursor: onClick ? 'zoom-in' : 'default', ...sx }} />;
}

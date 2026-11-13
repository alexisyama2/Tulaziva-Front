import { IconButton, Tooltip, type SxProps, type Theme } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/FavoriteRounded';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorderRounded';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { useNotify } from '@/context/NotificationContext';
import { errorMessages } from '@/components/common/ErrorState';
import { useFavoriteIds, useToggleFavorite } from '@/hooks/useFavorites';

interface Props {
  adId: string;
  /** A round white button for the corner of a photo, or a plain one for a toolbar. */
  overlay?: boolean;
  sx?: SxProps<Theme>;
}

export default function FavoriteButton({ adId, overlay = false, sx }: Props) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { error } = useNotify();
  const { data: ids } = useFavoriteIds();
  const toggle = useToggleFavorite();

  const saved = ids?.has(adId) ?? false;
  const label = saved ? t('favorites.remove') : t('favorites.add');

  const onClick = (event: React.MouseEvent) => {
    // The button lives over a card that is a link: do not follow it.
    event.preventDefault();
    event.stopPropagation();

    // Anonymous visitors are sent to sign in and come back to where they were.
    if (!user) return navigate('/login', { state: { from: location.pathname + location.search } });

    toggle.mutate({ adId, favorite: !saved }, { onError: (e) => error(errorMessages(e, t('errors.generic')).join(' ')) });
  };

  return (
    <Tooltip title={label}>
      <IconButton
        onClick={onClick}
        aria-label={label}
        aria-pressed={saved}
        size="small"
        sx={[
          overlay && {
            bgcolor: (th: Theme) => (th.palette.mode === 'dark' ? 'rgba(26,21,53,.85)' : 'rgba(255,255,255,.92)'),
            '&:hover': { bgcolor: 'background.paper' },
          },
          { color: saved ? 'secondary.main' : 'text.secondary' },
          ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
        ]}
      >
        {saved ? <FavoriteIcon /> : <FavoriteBorderIcon />}
      </IconButton>
    </Tooltip>
  );
}

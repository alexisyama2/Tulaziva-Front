import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  alpha,
  AppBar,
  Badge,
  Box,
  Button,
  Divider,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import AddIcon from '@mui/icons-material/AddRounded';
import ChatIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import ListAltIcon from '@mui/icons-material/ListAltRounded';
import PersonIcon from '@mui/icons-material/PersonOutlineRounded';
import AdminIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import FavoriteIcon from '@mui/icons-material/FavoriteBorderRounded';
import LogoutIcon from '@mui/icons-material/LogoutRounded';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { useUnreadCount } from '@/hooks/useChat';
import ColorModeToggle from '@/components/common/ColorModeToggle';
import LanguageSwitcher from '@/components/common/LanguageSwitcher';
import Logo from '@/components/common/Logo';
import UserAvatar from '@/components/common/UserAvatar';

export default function Navbar() {
  const { t } = useTranslation();
  const { user, isAdmin, logout } = useAuth();
  const { data: unread = 0 } = useUnreadCount();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);

  const go = (path: string) => {
    setAnchor(null);
    navigate(path);
  };

  return (
    <AppBar
      position="sticky"
      color="inherit"
      sx={(th) => ({ bgcolor: alpha(th.palette.background.paper, 0.85), backdropFilter: 'blur(14px)', borderBottom: 1, borderColor: 'divider', color: 'text.primary' })}
    >
      <Toolbar sx={{ gap: 1, maxWidth: 1280, width: '100%', mx: 'auto' }}>
        <Logo />
        <Box sx={{ flex: 1 }} />

        {!isMobile && (
          <Button component={RouterLink} to="/ads" color="inherit">
            {t('nav.ads')}
          </Button>
        )}

        <ColorModeToggle />
        <LanguageSwitcher />

        {user ? (
          <>
            <Tooltip title={t('nav.messages')}>
              <IconButton component={RouterLink} to="/messages" aria-label={t('nav.messages')}>
                <Badge badgeContent={unread} color="secondary" max={99}>
                  <ChatIcon />
                </Badge>
              </IconButton>
            </Tooltip>

            {isMobile ? (
              <Tooltip title={t('nav.publish')}>
                <IconButton component={RouterLink} to="/ads/new" color="primary" aria-label={t('nav.publish')}>
                  <AddIcon />
                </IconButton>
              </Tooltip>
            ) : (
              <Button component={RouterLink} to="/ads/new" variant="contained" startIcon={<AddIcon />}>
                {t('nav.publish')}
              </Button>
            )}

            <IconButton onClick={(e) => setAnchor(e.currentTarget)} sx={{ p: 0.5 }} aria-label={t('nav.profile')}>
              <UserAvatar name={user.displayName} photoUrl={user.photoUrl} size={36} />
            </IconButton>
            <Menu anchorEl={anchor} open={!!anchor} onClose={() => setAnchor(null)} slotProps={{ paper: { sx: { minWidth: 220, mt: 1 } } }}>
              <Box sx={{ px: 2, py: 1 }}>
                <Typography fontWeight={700} noWrap>{user.displayName}</Typography>
                <Typography variant="body2" color="text.secondary" noWrap>{user.email}</Typography>
              </Box>
              <Divider />
              <MenuItem onClick={() => go('/profile')}>
                <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
                {t('nav.profile')}
              </MenuItem>
              <MenuItem onClick={() => go('/favorites')}>
                <ListItemIcon><FavoriteIcon fontSize="small" /></ListItemIcon>
                {t('nav.favorites')}
              </MenuItem>
              <MenuItem onClick={() => go('/my-ads')}>
                <ListItemIcon><ListAltIcon fontSize="small" /></ListItemIcon>
                {t('nav.myAds')}
              </MenuItem>
              {isAdmin && (
                <MenuItem onClick={() => go('/admin')}>
                  <ListItemIcon><AdminIcon fontSize="small" /></ListItemIcon>
                  {t('nav.admin')}
                </MenuItem>
              )}
              <Divider />
              <MenuItem
                onClick={() => {
                  setAnchor(null);
                  logout();
                  navigate('/');
                }}
              >
                <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
                {t('nav.logout')}
              </MenuItem>
            </Menu>
          </>
        ) : (
          <>
            <Button component={RouterLink} to="/login" color="inherit">
              {t('nav.login')}
            </Button>
            <Button component={RouterLink} to="/register" variant="contained">
              {t('nav.register')}
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}

import { Avatar, type AvatarProps } from '@mui/material';

interface Props extends Omit<AvatarProps, 'src'> {
  name?: string;
  photoUrl?: string | null;
  size?: number;
}

export default function UserAvatar({ name = '', photoUrl, size = 40, sx, ...rest }: Props) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');

  return (
    <Avatar
      src={photoUrl ?? undefined}
      alt={name}
      sx={{
        width: size,
        height: size,
        fontSize: size * 0.4,
        fontWeight: 700,
        bgcolor: 'primary.light',
        color: '#fff',
        ...sx,
      }}
      {...rest}
    >
      {initials || undefined}
    </Avatar>
  );
}

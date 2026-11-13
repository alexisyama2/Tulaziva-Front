import { Circle, MapContainer, TileLayer } from 'react-leaflet';
import { Box, useTheme } from '@mui/material';
import 'leaflet/dist/leaflet.css';

interface Props {
  latitude: number;
  longitude: number;
  /** Radius of the highlighted area. The exact point is not shown: the location is approximate. */
  radiusMeters?: number;
  height?: number;
}

export default function AdMap({ latitude, longitude, radiusMeters = 800, height = 220 }: Props) {
  const theme = useTheme();
  const dark = theme.palette.mode === 'dark';

  return (
    <Box
      sx={{
        height,
        borderRadius: 3,
        overflow: 'hidden',
        border: 1,
        borderColor: 'divider',
        // The map is a background decoration: keep it behind the sticky navbar and dialogs.
        position: 'relative',
        zIndex: 0,
        // Darken the OSM tiles in dark mode.
        '& .leaflet-tile-pane': dark ? { filter: 'invert(1) hue-rotate(180deg) brightness(.9) contrast(.9)' } : undefined,
      }}
    >
      <MapContainer center={[latitude, longitude]} zoom={13} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Circle
          center={[latitude, longitude]}
          radius={radiusMeters}
          pathOptions={{ color: theme.palette.primary.main, fillColor: theme.palette.primary.main, fillOpacity: 0.25, weight: 2 }}
        />
      </MapContainer>
    </Box>
  );
}

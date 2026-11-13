import { useCallback, useState } from 'react';

export interface Coords {
  latitude: number;
  longitude: number;
}

const KEY = 'tulaziva.coords';

function readCached(): Coords | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Coords) : null;
  } catch {
    return null;
  }
}

/** Browser geolocation on demand (never asks for permission until `locate` is called). */
export function useGeolocation() {
  const [coords, setCoords] = useState<Coords | null>(readCached);
  const [loading, setLoading] = useState(false);
  const [denied, setDenied] = useState(false);

  const locate = useCallback((): Promise<Coords | null> => {
    if (!('geolocation' in navigator)) {
      setDenied(true);
      return Promise.resolve(null);
    }
    setLoading(true);
    setDenied(false);
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const c = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
          sessionStorage.setItem(KEY, JSON.stringify(c));
          setCoords(c);
          setLoading(false);
          resolve(c);
        },
        () => {
          setDenied(true);
          setLoading(false);
          resolve(null);
        },
        { enableHighAccuracy: false, timeout: 10_000, maximumAge: 300_000 },
      );
    });
  }, []);

  const clear = useCallback(() => {
    sessionStorage.removeItem(KEY);
    setCoords(null);
  }, []);

  return { coords, loading, denied, locate, clear };
}

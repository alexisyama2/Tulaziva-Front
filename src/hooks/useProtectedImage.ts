import { useEffect, useState } from 'react';
import { fetchBlob } from '@/api';

/** Loads an image that requires the bearer token (chat attachments) and exposes it as an object URL. */
export function useProtectedImage(url: string | null | undefined) {
  const [src, setSrc] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!url) return;
    const controller = new AbortController();
    let objectUrl: string | null = null;
    setSrc(null);
    setError(false);
    fetchBlob(url, controller.signal)
      .then((blob) => {
        objectUrl = URL.createObjectURL(blob);
        setSrc(objectUrl);
      })
      .catch((e: Error) => e.name !== 'AbortError' && setError(true));
    return () => {
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [url]);

  return { src, error };
}
